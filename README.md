# Scalix AI Capacity Readiness Prototype

Scalix is positioned as a SaaS platform for microservice-based businesses. A customer connects production telemetry, platform metadata, service architecture, dependency maps, Kafka/database metrics, and sales pipeline forecasts. Scalix builds a private customer knowledge base, uses RAG to ground agent reasoning, and produces six-month AI Capacity Readiness Scores for executives and engineering leaders.

The capstone demo uses a fictional clearing-house tenant, ClearOne Clearing, with synthetic telemetry, architecture data, and sales forecast inputs.

## Public capstone deployment

The GitHub Pages build starts in deterministic evidence mode using only the synthetic ClearOne dataset. Without a key it makes no external model calls and still exposes the complete dashboard, console, scenario loop, approval workflow, and eval evidence.

Visitors may optionally connect their own OpenAI project key in Settings to run the `gpt-5.6-terra` analyst and reviewer. The key is never shipped in the files or sent to Scalix; it is held only in that browser tab and sent directly to the OpenAI Responses API. Disconnecting or closing the tab clears it. Production actions remain disabled in both modes.

This browser BYOK path is a capstone convenience, not the recommended production security architecture. OpenAI recommends routing API requests through a backend instead of exposing keys to client-side browser code. See `SECURITY.md` for the public-demo controls and production design.

This prototype has two modes:

1. Deterministic scoring mode for trusted ACRS calculations.
2. Optional OpenAI analyst-and-reviewer mode for evidence-grounded findings and independent quality review, using browser-session BYOK on GitHub Pages or a server-side key when run locally.

The integrated decision loop is:

1. Capture the Executive scenario.
2. Retrieve the synthetic ClearOne business, service, dependency, and telemetry context.
3. Calculate the continuous weighted ACRS deterministically.
4. Run the Capacity Readiness Analyst.
5. Validate output fields, evidence IDs, and production-action boundaries in the application.
6. Run an independent Review Agent.
7. Present the result for Executive Approve, Edit, or Escalate.

When run locally through `server.js`, the OpenAI API key remains in server memory or the `OPENAI_API_KEY` environment variable. On GitHub Pages, optional BYOK is held only in the visitor's tab session. Without a key, the same governed workflow uses deterministic synthetic analyst and reviewer outputs.

New SaaS-focused screens:

- Customer Setup: shows one-time environment hookup and connector status.
- Knowledge + RAG: shows customer-specific knowledge sources and retrieved architecture chunks.
- Sales Forecast: turns pipeline questions into projected endpoint and dependency demand.
- Command Center: preserves ACRS, RAG/confidence warnings, and executive-ready readiness narrative.
- Agent Evals: runs 21 directional, non-directional, boundary, safety, and adversarial cases in the integrated React workflow and records human verdicts.

## Demo logins

- Admin: `admin` / `admin`
- Client: `ClearOne` / `clear`

## Current prototype flows

- Admin login opens business setup, guided client onboarding, client management, and customer service.
- New client setup walks through business profile, business type, architecture uploads, architecture type, dependency maps, endpoints, review, and simulated knowledge-graph/vector-DB creation.
- Manage clients supports edit, delete, architecture documentation updates, dependency-map updates, endpoint updates, and simulated knowledge-graph rebuild.
- ClearOne client login opens a clearing-house dashboard with a made-up logo, scenario chat, six-month RAG service status, executive summary, bottlenecks, and sales target update form.
- Scenario chat now runs the governed analyst, application validation, independent reviewer, verified-evidence display, and Executive approval gate for stress questions such as a 4M-order market-open surge.
- The sidebar always identifies Live AI versus Synthetic Demo mode. API credentials remain server-side and production actions remain disabled.
- Scenario runs and Executive Approve, Edit, or Escalate decisions are persisted in a browser-local decision log for prototype traceability.
- The integrated Agent Evals workspace contains 21 evaluation cases, including unsupported bottleneck attribution and deterministic-score-versus-narrative disagreement fault injections that demonstrate the reviewer can return Needs Attention. The local deterministic regression currently passes 42 of 42 assertions.
- The ACRS implementation now uses the explicit continuous weighting model: capacity headroom 30%; latency trend, resource utilization, and business growth 15% each; dependency resilience and reliability 10% each; evidence confidence 5%.
- Sales forecasting now uses service-specific exposure to new accounts, equity trades, new positions, total positions, and market-open peak concentration. All five drivers also feed an EOD model covering projected workload, carried backlog, sustainable throughput, available batch window, SLO headroom, and readiness.
- The ClearOne synthetic current-volume baseline is 500K new accounts/day, 1M equity trades/day, 100K new positions/day, and 5M total positions. Endpoint baseline and safe RPS values are explicitly marked as assumptions pending replacement by Datadog and client telemetry.
- The Executive dashboard separates composite readiness from throughput utilization: ACRS remains a weighted readiness score, while Overall Capacity Position shows the business-criticality-weighted current versus forecast utilization across all 12 services. The limiting service is displayed separately.
- Every service row uses the same Capacity Position convention, showing projected RPS, assumed safe RPS, and current-to-forecast utilization percentages for its limiting endpoint.
- Capacity Position cells align projected RPS and Capacity RAG on one line using the same visual hierarchy as ACRS/Readiness RAG, with safe RPS and utilization movement shown beneath.
- Ticketed recommendations now include a remediation checkpoint. Executives can record implementation evidence, validated safe RPS and optional resource observations; Scalix versions the prior baseline, recalculates endpoint Capacity RAG, service ACRS, dependent services and overall ACRS, and only reports Green when the deterministic thresholds are actually met.
- Capacity RAG is separate from ACRS Readiness RAG: below 80% of safe RPS is Green, 80–100% is Amber, and above 100% is Red. The ACRS capacity factor is continuous and no longer double-counts resource utilization.
- Architecture Assumptions includes a reversible Green Control Test that saves the current browser configuration, applies healthy synthetic capacity/resource/latency/EOD values with zero incremental sales, and restores the prior ClearOne state on exit.
- ClearOne now includes a robust equity-only GCP clearing architecture model covering account opening, bank relationship, funding, real-time buying-power checks, house/Reg-T margin requirements, PDT/day-trading controls, fractional/notional equity orders, order routing, trade booking, ledger, positions, reconciliation, confirms/statements, settlement, margin rotation, margin calls, and SOD files.
- Real-time buying power and margin are modeled as a service cluster: `/buying-power/realtime`, `/margin/requirements/calculate`, `/margin/intraday/monitor`, `/margin/calls`, and `/risk/day-trading/check`, with bottlenecks around Redis account hot keys, margin-rule recalculation storms, stale position snapshots, open-order reservations, DB fallback reads, and margin-call queues.
- Basket orders are modeled with `/orders/equity/basket` and `/orders/equity/basket/expand`, including parent-to-child order fan-out, aggregate buying-power and margin reservation, per-leg eligibility checks, CAT parent-child linkage, partial reject repair, booking, ledger, position, and reconciliation amplification.
- Allocation is modeled with `/trades/allocate`, including block/basket execution allocation across accounts, sleeves, strategies, or introducing-broker clients, plus average-price calculation, fractional residuals, rounding rules, CAT allocation linkage, allocation-break repair, booking, ledger, and position fan-out.
- The ClearOne dashboard now includes the full Scalix prediction pipeline: knowledge layer, telemetry layer, business forecast layer, workload translation layer, bottleneck inference layer, ACRS scoring layer, and explainability/chat layer.
- Scenario chat now decomposes user questions into workload metrics, maps them to endpoint/event pressure, applies clearing-house bottleneck patterns, shows top inferred endpoint pressure, reports confidence, and lists missing telemetry needed to improve certainty without relying on full end-to-end performance testing.
- AI guardrails are now modeled through stronger system prompts and a visible dashboard guardrail panel: grounded-only answers, no invented metrics, fact-vs-estimate labeling, confidence downgrade, required evidence contract, missing-data disclosure, and executive-reviewed actions only.
- Admin now includes a one-time Business setup tab where Scalix can prebuild or ad hoc rebuild reusable business domain layers such as Clearing and Custody. This creates a business vector DB/domain graph before client-specific RAG, so common industry questions are answered from the business layer first and ClearOne-specific questions then use client RAG, telemetry, and LLM synthesis.
- The model now includes the regulatory/control plane: CAT reporting, CAIS account reporting, FINRA/TRF reporting, regulatory feedback/error repair, and clock synchronization.
- The model now includes product enrollment flows: FDIC cash sweep enrollment and FPSL / Fully Paid Securities Lending enrollment.
- Additional lifecycle services include security master, corporate actions, tax/cost basis, ACATS transfers, and exception/break management.
- Investigation / case management is modeled as a cross-cutting service fed by unresolved breaks, CAT/TRF rejects, ACATS rejects, ACH/funding disputes, fraud/AML alerts, customer complaints, settlement fails, and evidence aggregation workflows.
- CDD / KYC / AML screening is modeled as an account-readiness control service covering CIP checks, identity verification, sanctions/PEP screening, adverse media, beneficial-owner review, AML risk scoring, enhanced due diligence, and manual-review escalations.
- The client workspace includes Architecture inputs where dependency matrix, endpoint catalog, and system architecture JSON can be reviewed/edited and used to rerun the synthetic bottleneck analyzer.
- The dashboard now surfaces Pub/Sub backlog/throughput risk, GCP-specific bottlenecks, endpoint safe-capacity gaps, and dependency-matrix bottleneck explanations.

Run locally:

```bash
node server.js
```

Then open http://127.0.0.1:5175/.

To enable real LLM mode, set OPENAI_API_KEY in your shell before running the server. Without a key, the app uses simulated agent output so the capstone demo still works.
