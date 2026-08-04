const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { SYSTEM_PROMPTS } = require('./prompts.js');
const {
  EVAL_CASES,
  ANALYST_PROMPT,
  REVIEWER_PROMPT,
  buildAnalysisPayload,
  fallbackWorker,
  applyEvaluationFault,
  validateWorker,
  fallbackReviewer,
} = require('./agent-core.js');

const baseDir = __dirname;
const port = Number(process.env.PORT || 5175);
const model = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
let runtimeApiKey = process.env.OPENAI_API_KEY || '';
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8' };

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function endpointReadiness(endpoint) {
  const ratio = endpoint.forecastRps / endpoint.safeRps;
  if (ratio <= 0.7) return 0.96;
  if (ratio <= 0.85) return 0.88 - (ratio - 0.7) * 0.8;
  if (ratio <= 1) return 0.68 - (ratio - 0.85) * 1.6;
  return clamp(0.38 - (ratio - 1) * 0.9, 0.08, 0.38);
}
function fallback(payload) {
  const a = payload.assessment || { endpoints: [], status: 'At Risk' };
  const endpoints = a.endpoints || [];
  const weakest = endpoints.length ? endpoints.slice().sort((x,y) => endpointReadiness(x) - endpointReadiness(y))[0] : { path: '/orders/place', forecastRps: 150, safeRps: 128 };
  return {
    mode: 'simulated',
    summary: 'The agent run marks the platform ' + a.status + ' because forecasted order flow stresses ' + weakest.path + ' and exposes dependency risk in database connections and telemetry gaps.',
    agent_outputs: [
      { agent: 'Forecast Translation Agent', status: 'complete', finding: 'Business forecast growth is translated into endpoint RPS, with highest concern on order placement and validation paths.' },
      { agent: 'Capacity Agent', status: 'complete', finding: weakest.path + ' has forecasted load near or above modeled safe capacity.' },
      { agent: 'Dependency Risk Agent', status: 'complete', finding: 'The order path is constrained by order-service memory and trade-db connection pressure.' },
      { agent: 'Telemetry Confidence Agent', status: 'complete', finding: 'Missing p99 latency, stale Kafka lag, and burst-level DB connection metrics keep confidence at Medium.' },
      { agent: 'Orchestrator', status: 'complete', finding: 'The deterministic ACRS remains the source of truth; the AI layer explains and prioritizes review actions.' }
    ],
    recommendations: [
      'Set /orders/place performance target to ' + Math.ceil(weakest.forecastRps * 1.17) + ' RPS with p95 latency below 250 ms.',
      'Review trade-db connection pool limits and order validation query path.',
      'Add missing telemetry before final capacity signoff.'
    ]
  };
}
function extractText(data) {
  if (data.output_text) return data.output_text;
  if (!data.output) return '';
  return data.output.flatMap(item => item.content || []).map(part => part.text || '').join(String.fromCharCode(10));
}
function parseJsonText(text) {
  const normalized = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(normalized);
}
async function callPrompt(prompt, userPayload, options = {}) {
  const apiKey = runtimeApiKey;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      instructions: prompt,
      input: JSON.stringify(userPayload),
      text: { verbosity: options.verbosity || 'medium' },
      max_output_tokens: options.maxOutputTokens || 2500,
      store: false,
    }),
  });
  if (!response.ok) throw new Error('OpenAI API error ' + response.status + ': ' + await response.text());
  return parseJsonText(extractText(await response.json()));
}
async function callOpenAI(agentKey, userPayload) {
  const apiKey = runtimeApiKey;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const prompt = SYSTEM_PROMPTS[agentKey].prompt + String.fromCharCode(10) + 'Return compact valid JSON only. Do not wrap in markdown.';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: [{ role: 'system', content: prompt }, { role: 'user', content: JSON.stringify(userPayload) }] })
  });
  if (!response.ok) throw new Error('OpenAI API error ' + response.status + ': ' + await response.text());
  const data = await response.json();
  const text = extractText(data).trim();
  try { return JSON.parse(text); } catch { return { raw_text: text }; }
}

function safeOpenAIError(error) {
  const message = String(error?.message || error || '');
  if (/401|invalid_api_key|incorrect api key/i.test(message)) return 'authentication failed — reconnect a valid OpenAI project API key';
  if (/insufficient_quota|exceeded your current quota|billing/i.test(message)) return 'the OpenAI project has no available API credit or has exceeded its quota';
  if (/429|rate limit/i.test(message)) return 'the OpenAI project is currently rate limited';
  if (/403|permission|not authorized/i.test(message)) return 'the API project does not have permission to use the configured model';
  if (/404|model_not_found|does not exist/i.test(message)) return `the configured model (${model}) is not available to this API project`;
  if (/fetch|network|ENOTFOUND|ECONN/i.test(message)) return 'the OpenAI endpoint could not be reached from the local server';
  return 'the OpenAI request failed before a valid analyst response was returned';
}

async function runValidatedScenario(payload) {
  const analysisPayload = buildAnalysisPayload(payload);
  const { context } = analysisPayload;
  const liveRequested = payload.executionMode === 'live_openai';
  const liveAvailable = Boolean(runtimeApiKey);
  const useLiveOpenAI = liveRequested && liveAvailable;
  let mode = liveRequested ? 'synthetic_fallback' : 'deterministic_model';
  let analyst = fallbackWorker(context);
  let analystSource = 'Deterministic synthetic model';
  let modelIssue = liveRequested && !liveAvailable
    ? 'Live OpenAI mode was requested, but no server-side API key is available; the safe deterministic result is shown.'
    : '';

  if (useLiveOpenAI) {
    try {
      const candidate = await callPrompt(ANALYST_PROMPT, analysisPayload, { maxOutputTokens: 3200 });
      const candidateValidation = validateWorker(candidate, context.caseId);
      if (candidateValidation.valid) {
        analyst = candidate;
        analystSource = model;
        mode = 'real_llm';
      } else {
        modelIssue = 'The analyst response failed application validation; the safe deterministic result is shown.';
      }
    } catch (error) {
      modelIssue = `Live OpenAI analyst failed because ${safeOpenAIError(error)}. The safe deterministic result is shown.`;
    }
  }

  const evalCase = EVAL_CASES.find((item) => item.caseId === context.caseId);
  if (
    payload.evaluationFaultInjection &&
    evalCase?.faultInjection === payload.evaluationFaultInjection
  ) {
    analyst = applyEvaluationFault(analyst, context, payload.evaluationFaultInjection);
    analystSource = `${analystSource} + controlled reviewer fault injection`;
  }

  const validation = validateWorker(analyst, context.caseId);
  const policyReviewer = fallbackReviewer(analyst, context, validation);
  let reviewer = policyReviewer;
  let reviewerSource = 'Deterministic policy reviewer';
  if (useLiveOpenAI && mode === 'real_llm') {
    try {
      const candidateReviewer = await callPrompt(REVIEWER_PROMPT, {
        ...analysisPayload,
        analyst_output: analyst,
        application_validation: validation,
      }, { verbosity: 'low', maxOutputTokens: 1000 });
      if (
        ['LOOKS_RIGHT', 'NEEDS_ATTENTION'].includes(candidateReviewer?.verdict) &&
        candidateReviewer?.reason &&
        candidateReviewer?.checks
      ) {
        const misreadWorkflowStatus = analyst.status === 'OK' &&
          /status.{0,40}OK.{0,120}(conflict|inconsistent)|OK.{0,120}(Red|ESCALATE)/i.test(candidateReviewer.reason);
        if (policyReviewer.verdict === 'NEEDS_ATTENTION' && candidateReviewer.verdict !== 'NEEDS_ATTENTION') {
          reviewer = policyReviewer;
          reviewerSource = 'Deterministic policy reviewer â€” material contradiction safeguard';
        } else if (misreadWorkflowStatus) {
          reviewer = fallbackReviewer(analyst, context, validation);
          reviewerSource = 'Deterministic policy reviewer — workflow-status correction';
        } else {
          reviewer = candidateReviewer;
          reviewerSource = model;
        }
      } else {
        modelIssue = [modelIssue, 'The reviewer format was invalid; deterministic policy review was applied.'].filter(Boolean).join(' ');
      }
    } catch (error) {
      modelIssue = [modelIssue, `The live reviewer failed because ${safeOpenAIError(error)}; deterministic policy review was applied.`].filter(Boolean).join(' ');
    }
  }

  return {
    mode,
    caseId: context.caseId,
    analyst,
    analystSource,
    reviewer,
    reviewerSource,
    validation,
    citations: analyst.evidence_ids || [],
    guardrail: {
      status: validation.valid ? 'PASSED' : 'ATTENTION',
      message: modelIssue || 'Application evidence, format, and boundary checks passed.',
    },
    humanGate: {
      status: 'PENDING',
      allowedActions: ['APPROVE', 'EDIT', 'ESCALATE'],
      productionActionExecuted: false,
    },
  };
}
async function runRealAgents(payload) {
  const agentKeys = ['forecast','capacity','dependency','reliability','telemetry','recommendations'];
  const specialistOutputs = [];
  for (const key of agentKeys) {
    const out = await callOpenAI(key, { knowledge_graph: payload.knowledge_graph, deterministic_assessment: payload.assessment, prior_outputs: specialistOutputs });
    specialistOutputs.push({ agent: SYSTEM_PROMPTS[key].title, output: out });
  }
  const orchestrated = await callOpenAI('orchestrator', { knowledge_graph: payload.knowledge_graph, deterministic_assessment: payload.assessment, specialist_outputs: specialistOutputs });
  return {
    mode: 'real_llm',
    summary: orchestrated.summary || orchestrated.executive_summary || 'The orchestrator generated an assessment from specialist agent outputs.',
    agent_outputs: specialistOutputs.map(item => ({ agent: item.agent, status: 'complete', finding: item.output.summary || item.output.finding || item.output.raw_text || 'Structured output generated.' })),
    recommendations: orchestrated.recommendations || orchestrated.prioritized_recommendations || []
  };
}
async function serveStatic(req, res) {
  const urlPath = new URL(req.url, 'http://127.0.0.1').pathname;
  const clean = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath).split('/').filter(Boolean).join(path.sep);
  const requested = path.resolve(baseDir, clean);
  const relative = path.relative(baseDir, requested);
  if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); res.end('Forbidden'); return; }
  const data = await fs.readFile(requested);
  res.writeHead(200, { 'Content-Type': mime[path.extname(requested)] || 'application/octet-stream' });
  res.end(data);
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/runtime-status') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        mode: runtimeApiKey ? 'live_openai' : 'synthetic_demo',
        openAIAvailable: Boolean(runtimeApiKey),
        model: runtimeApiKey ? model : null,
        apiKeyLocation: 'server_only',
        productionActionsEnabled: false,
      }));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/runtime-key') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const key = String(JSON.parse(body || '{}').apiKey || '').trim();
          if (!key || key.length < 20) throw new Error('Enter a valid OpenAI API key.');
          runtimeApiKey = key;
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ connected: true, model, storage: 'server_memory' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ connected: false, error: error.message }));
        }
      });
      return;
    }
    if (req.method === 'DELETE' && req.url === '/api/runtime-key') {
      runtimeApiKey = '';
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ connected: false }));
      return;
    }
    if (req.method === 'GET' && req.url === '/api/eval-cases') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(EVAL_CASES));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/scenario-analysis') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const result = await runValidatedScenario(JSON.parse(body || '{}'));
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Scenario analysis could not be completed.', detail: error.message }));
        }
      });
      return;
    }
    if (req.method === 'POST' && req.url === '/api/run-assessment') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const payload = JSON.parse(body || '{}');
        try {
          const result = runtimeApiKey ? await runRealAgents(payload) : fallback(payload);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(fallback(payload)));
        }
      });
      return;
    }
    await serveStatic(req, res);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log('Scalix agentic prototype running at http://127.0.0.1:' + port + '/'));
