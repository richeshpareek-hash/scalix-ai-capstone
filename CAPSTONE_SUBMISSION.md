# Scalix Capstone Submission Guide

## Product

Scalix AI is a universal capacity-readiness SaaS concept for businesses with any architecture style. The prototype uses the fictional ClearOne Clearing and Custody tenant to demonstrate a deep equity-clearing workflow.

Scalix combines business context, client architecture, dependency evidence, endpoint limits, production-pattern assumptions, and sales forecasts. It produces a six-month AI Capacity Readiness Score (ACRS), service-level readiness, bottleneck explanations, evidence gaps, and recommended validation actions.

## Formal and integrated artifacts

- `scalix-develop-companion/index.html` is the locked, one-file Develop compliance artifact used to complete and confirm the structured companion prompts.
- This React Scalix application is the enhanced integrated demonstration. It turns the approved design into an Executive workflow with agent orchestration, reviewer output, human approval, persistent evidence, architecture views, and Admin onboarding.
- The integrated app does not replace or rewrite the locked companion.

## Run

From the Scalix folder:

```text
node server.js
```

Open `http://127.0.0.1:5175/`.

Logins:

- Client: `ClearOne` / `clear`
- Admin: `admin` / `admin`

## Recommended demonstration

1. Sign in as ClearOne and point out the persistent `Synthetic Demo` or `Live AI` badge.
2. Review overall ACRS, risk summary, and six-month service status.
3. Run the 4M market-open surge scenario.
4. Show the analyst’s evidence, missing data, decision, and independent reviewer.
5. Approve, edit, or escalate the recommendation and show the persisted Executive decision log.
6. Run the production-action boundary case and show refusal plus escalation.
7. Open Agent Evals and show five confirmed Pass verdicts.
8. Show the Before → Change → After improvement and reviewer challenge proof.
9. Open Business Analytics to show the seven factor values, explicit weights, contributions, and endpoint model.
10. Open Architecture and Knowledge Base to show the evidence matrix, endpoint catalog, indexed sources, retrieved chunks, freshness, and synthetic disclosure.
11. Sign in as Admin and demonstrate business-layer setup, guided client onboarding, client management, and support.

## Evaluation evidence

| Eval | Scenario | Confirmed human verdict |
|---|---|---|
| EV-001 | 4M market-open surge | Pass |
| EV-002 | Reduced six-month forecast | Pass |
| EV-003 | 20% market decline | Pass |
| EV-004 | Missing Kafka telemetry | Pass |
| EV-005 | Unauthorized production action | Pass |

The reviewer challenge is deliberately flawed and should return `NEEDS ATTENTION`; it is not counted as one of the five scored cases.

## Safety boundary

- Scalix advises; an Executive approves, edits, rejects, or escalates.
- The prototype never changes production capacity or sends engineering commitments.
- Evidence IDs are validated and missing telemetry is disclosed.
- ACRS is deterministic and continuous; the language model does not invent the score.
- Synthetic data and modeled assumptions are visibly labeled.
- A live OpenAI run requires a server-side API key and available API credit. The demo remains functional in deterministic synthetic mode without a key.

## Known limitations to reevaluate after integration

- ClearOne architecture, telemetry, incidents, capacity limits, and sales inputs are synthetic.
- Datadog, Kubernetes, GCP, Kafka, database, document-ingestion, vector-database, and knowledge-graph connectors are simulated.
- Browser-local persistence demonstrates traceability but is not a production audit store.
- Analyst and reviewer share an evidence package and provider; the reviewer is a second-pass control, not an independent audit.
- Modeled bottlenecks prioritize targeted performance and resilience validation; they do not replace those tests.
