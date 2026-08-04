const fs = require('fs');
const path = require('path');
const {
  EVAL_CASES,
  buildAnalysisPayload,
  fallbackWorker,
  applyEvaluationFault,
  validateWorker,
  fallbackReviewer,
} = require('../agent-core');

const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const endpointArg = process.argv.find((arg) => arg.startsWith('--endpoint='));
const endpoint = endpointArg ? endpointArg.split('=').slice(1).join('=') : 'http://127.0.0.1:5175/api/scenario-analysis';
const casesArg = process.argv.find((arg) => arg.startsWith('--cases='));
const selectedCaseIds = casesArg
  ? new Set(casesArg.split('=').slice(1).join('=').split(',').map((value) => value.trim()).filter(Boolean))
  : null;
const selectedCases = selectedCaseIds
  ? EVAL_CASES.filter((item) => selectedCaseIds.has(item.caseId))
  : EVAL_CASES;

if (selectedCaseIds && selectedCases.length !== selectedCaseIds.size) {
  const found = new Set(selectedCases.map((item) => item.caseId));
  const missing = [...selectedCaseIds].filter((caseId) => !found.has(caseId));
  throw new Error(`Unknown evaluation case(s): ${missing.join(', ')}`);
}

const baseline = {
  accounts: 500000,
  equityTrades: 1000000,
  newPositions: 100000,
  totalPositions: 5000000,
  achTransactions: 250000,
};

const target = {
  accounts: 1000000,
  equityTrades: 2000000,
  newPositions: 200000,
  totalPositions: 6000000,
  achTransactions: 500000,
  peakMultiplier: 3.2,
  achPeakMultiplier: 2,
  orderFillRate: 82,
  executionsPerFilledOrder: 1.1,
};

const services = [
  { name: 'Real-Time Buying Power', score: 48, status: 'Red', limiter: 'Redis fallback and DB connections' },
  { name: 'Kafka Event Backbone', score: 56, status: 'Red', limiter: 'Consumer lag and partition headroom' },
  { name: 'Ledger + Positions', score: 63, status: 'Red', limiter: 'Posting throughput' },
  { name: 'Settlement + Overnight Batch', score: 72, status: 'Amber', limiter: 'EOD processing window' },
];

function inputsFor(item) {
  const adjustedTarget = { ...target };
  let readiness = { score: 62, risk: 38, status: 'Red' };
  if (item.caseId === 'SC-003') adjustedTarget.equityTrades = 1750000;
  if (item.caseId === 'SC-023') adjustedTarget.equityTrades = -100;
  if (item.caseId === 'SC-024') readiness = { score: 92, risk: 8, status: 'Green' };
  if (item.caseId === 'SC-026') readiness = { score: 48, risk: 52, status: 'Red' };
  return { adjustedTarget, readiness };
}

function deterministicResult(item) {
  const { adjustedTarget, readiness } = inputsFor(item);
  const analysisPayload = buildAnalysisPayload({
    question: item.question,
    caseId: item.caseId,
    target: adjustedTarget,
    readiness,
    services,
    baseline,
    incrementalSalesForecast: {
      accounts: adjustedTarget.accounts - baseline.accounts,
      equityTrades: adjustedTarget.equityTrades - baseline.equityTrades,
      newPositions: adjustedTarget.newPositions - baseline.newPositions,
      achTransactions: adjustedTarget.achTransactions - baseline.achTransactions,
    },
  });
  const cleanAnalyst = fallbackWorker(analysisPayload.context);
  const analyst = item.faultInjection
    ? applyEvaluationFault(cleanAnalyst, analysisPayload.context, item.faultInjection)
    : cleanAnalyst;
  const validation = validateWorker(analyst, analysisPayload.context.caseId);
  const reviewer = fallbackReviewer(analyst, analysisPayload.context, validation);
  return {
    mode: 'deterministic_model',
    caseId: analysisPayload.context.caseId,
    analyst,
    reviewer,
    validation,
    humanGate: { status: 'PENDING', allowedActions: ['APPROVE', 'EDIT', 'ESCALATE'], productionActionExecuted: false },
  };
}

async function liveResult(item) {
  const { adjustedTarget, readiness } = inputsFor(item);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      question: item.question,
      caseId: item.caseId,
      target: adjustedTarget,
      readiness,
      services,
      baseline,
      incrementalSalesForecast: {
        accounts: adjustedTarget.accounts - baseline.accounts,
        equityTrades: adjustedTarget.equityTrades - baseline.equityTrades,
        newPositions: adjustedTarget.newPositions - baseline.newPositions,
        achTransactions: adjustedTarget.achTransactions - baseline.achTransactions,
      },
      executionMode: 'live_openai',
      evaluationFaultInjection: item.faultInjection || null,
    }),
  });
  if (!response.ok) throw new Error(`${item.evalId}: ${response.status} ${await response.text()}`);
  return response.json();
}

function content(role, text) {
  return { role, parts: [{ text }] };
}

async function main() {
  const runOne = async (item) => {
    let result;
    try {
      result = live ? await liveResult(item) : deterministicResult(item);
    } catch (error) {
      result = {
        mode: 'evaluation_error',
        caseId: item.caseId,
        error: error.name === 'TimeoutError' ? 'Live scenario exceeded the 45-second evaluation limit.' : error.message,
      };
    }
    return {
      eval_case_id: item.evalId,
      scalix_case_id: item.caseId,
      category: item.category || 'capacity-readiness',
      prompt: content('user', item.question),
      responses: [{ response: content('model', JSON.stringify(result)) }],
      reference: { response: content('model', item.expected) },
    };
  };

  const cases = [];
  const concurrency = live ? 4 : 1;
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < selectedCases.length) {
      const index = nextIndex++;
      cases[index] = await runOne(selectedCases[index]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const promptOnlyCases = selectedCases.map((item) => ({
      eval_case_id: item.evalId,
      scalix_case_id: item.caseId,
      prompt: content('user', item.question),
      reference: { response: content('model', item.expected) },
  }));

  const tracesDir = path.join(root, 'artifacts', 'traces');
  const datasetDir = path.join(root, 'tests', 'eval', 'datasets');
  fs.mkdirSync(tracesDir, { recursive: true });
  fs.mkdirSync(datasetDir, { recursive: true });
  const filteredSuffix = selectedCaseIds ? '-adversarial' : '';
  const suffix = `${live ? 'live-openai' : 'deterministic'}${filteredSuffix}`;
  const tracePath = path.join(tracesDir, `scalix-${suffix}.json`);
  const datasetPath = path.join(datasetDir, selectedCaseIds ? 'scalix-capacity-adversarial.json' : 'scalix-capacity.json');
  fs.writeFileSync(tracePath, `${JSON.stringify({ eval_cases: cases }, null, 2)}\n`);
  fs.writeFileSync(datasetPath, `${JSON.stringify({ eval_cases: promptOnlyCases }, null, 2)}\n`);
  process.stdout.write(JSON.stringify({ mode: suffix, cases: cases.length, tracePath, datasetPath }, null, 2));
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
