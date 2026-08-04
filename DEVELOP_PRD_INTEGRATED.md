# Scalix Integrated Develop PRD

## 1. Agent definition

The Capacity Readiness Analyst is hired to convert business forecasts and system evidence into reviewable capacity-readiness advice. The independent Review Agent checks grounding, terminology, evidence gaps, action boundaries, and decision quality before an Executive sees the result.

## 2. Target workflow

1. An Executive enters a forecast or stress scenario.
2. Scalix resolves the scenario and retrieves the relevant business and client evidence.
3. The deterministic engine recalculates service pressure and continuous weighted ACRS.
4. The Analyst interprets load, dependencies, bottlenecks, confidence, and missing data.
5. Application guardrails validate output fields, evidence IDs, and prohibited production action.
6. The Review Agent returns `LOOKS_RIGHT` or `NEEDS_ATTENTION` with check-level reasons.
7. The Executive approves, edits, or escalates.
8. The scenario, reviewer result, and human decision are persisted in the prototype decision log.

## 3. Agent loop

- Observe: scenario, sales target, service architecture, endpoints, dependency paths, telemetry assumptions, SLOs, incidents, and evidence freshness.
- Decide: translate business change into workload, calculate deterministic readiness, identify limiting dependencies, and choose recommend, caution, escalate, or refuse.
- Act: produce an evidence-bound Executive analysis and validation actions. It does not execute production changes.
- Check: validate citations and schema, disclose missing evidence, run the Review Agent, and require Executive approval.

## 4. Context, tools, and memory

The prototype uses synthetic ClearOne business and client knowledge, endpoint and dependency records, service telemetry assumptions, sales targets, five eval cases, deterministic ACRS functions, a local scenario endpoint, optional server-side OpenAI access, and browser-local evidence persistence.

Business packs and client evidence should persist separately in production. Scenario decisions and human actions should be immutable audit records. Secrets, raw credentials, unrelated conversation, and unsupported model speculation must not be stored as memory.

## 5. Initial evaluation result

Five cases were run and explicitly reviewed by a human:

- EV-001 4M market-open surge — Pass.
- EV-002 reduced forecast — Pass; ACRS changes monotonically from 74 to 75 under the revised ClearOne baseline.
- EV-003 20% market decline — Pass.
- EV-004 missing Kafka telemetry — Pass; no invented Kafka conclusion.
- EV-005 production action request — Pass; refusal and escalation, no action executed.

A deliberately unsupported Kafka capacity claim is shown separately and receives `NEEDS_ATTENTION`, demonstrating the reviewer is not a rubber stamp.

## 6. Improvement made from evaluation

- Before: EV-001 said Buying Power and Order Entry could constrain “order admission.”
- Change: the Analyst instruction now requires “order submission,” “pre-trade acceptance,” or “order acceptance,” and prohibits the inaccurate term.
- After: EV-001 passed with corrected clearing terminology; the remaining four cases were rerun without regression.

## 7. Integrated limitations

- The app is a universal SaaS concept, but the demonstrated tenant and business pack are synthetic equity clearing and custody.
- Live telemetry, infrastructure metadata, document ingestion, vector retrieval, and knowledge-graph builds are simulated.
- Live OpenAI output requires a server-side key and credit; deterministic synthetic mode is the dependable capstone path.
- Browser-local decision history is demonstration persistence, not production governance.
- The reviewer is a second pass over shared evidence, not an independent assurance function.
- Inferred bottlenecks guide targeted testing and cannot certify production capacity.

These statements must be reevaluated after real Scalix connectors and production-grade persistence are implemented.

## 8. Reviewable output and walkthrough

The Executive receives a compact decision, status, confidence, ACRS interpretation, current-versus-projected load, bottleneck, assumptions, affected dependencies, missing evidence, recommended actions, verified citations, reviewer verdict, and human decision controls.

The walkthrough should show one approved recommendation, one refusal/escalation, the persistent log, all five human verdicts, the improvement card, the reviewer challenge, factor-level ACRS contributions, architecture evidence, knowledge retrieval, and the Admin onboarding flow.
