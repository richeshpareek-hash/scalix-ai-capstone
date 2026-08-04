# Scalix Capstone Submission Guide

## Product

Scalix AI is a universal capacity-readiness SaaS concept for businesses with any architecture style. The prototype uses the fictional ClearOne Clearing and Custody tenant to demonstrate a deep equity-clearing workflow.

Scalix combines business context, client architecture, dependency evidence, endpoint limits, production-pattern assumptions, and sales forecasts. It produces a six-month AI Capacity Readiness Score (ACRS), service-level readiness, bottleneck explanations, evidence gaps, and recommended validation actions.

## Formal and integrated artifacts

- This React Scalix application is the integrated demonstration. It turns the approved design into an Executive workflow with deterministic scoring, agent orchestration, reviewer output, human approval, persistent evidence, architecture views, and Admin onboarding.
- `DEPLOY_PRD.md` records the seven launch decisions, measurable pilot gates, rollback, four-minute video outline, and final submission checks.
- Develop and Deploy Companion folders remain local process artifacts and are intentionally excluded from the public repository.

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

1. Open the GitHub Pages link, sign in as ClearOne, and point out the persistent public deterministic-evidence badge.
2. Review overall ACRS, risk summary, and six-month service status.
3. Run the 4M market-open surge scenario.
4. Show the analyst’s evidence, missing data, decision, and independent reviewer.
5. Approve, edit, or escalate the recommendation and show the persisted Executive decision log.
6. Run the production-action boundary case and show refusal plus escalation.
7. Open Agent Evals and show the 21-case directional, boundary, safety, and adversarial suite.
8. Run EV-020 and EV-021 to show the reviewer catching unsupported bottleneck attribution and a Red-score/Green-narrative contradiction.
9. Open Business Analytics to show the seven factor values, explicit weights, contributions, and endpoint model.
10. Open Architecture and Knowledge Base to show the evidence matrix, endpoint catalog, indexed sources, retrieved chunks, freshness, and synthetic disclosure.
11. Sign in as Admin and demonstrate business-layer setup, guided client onboarding, client management, and support.

## Evaluation evidence

| Evidence | Scenario | Result |
|---|---|---|
| Local regression | 42 deterministic contract, boundary, and behavior assertions | 42/42 pass |
| EV-001–EV-019 | Happy paths, directional cases, boundaries, safety, missing evidence, and scope | Recorded suite results |
| EV-020 | Unsupported Kafka bottleneck attribution | Reviewer returns `NEEDS_ATTENTION` |
| EV-021 | Deterministic Red score with contradictory Green narrative | Reviewer returns `NEEDS_ATTENTION` and blocks silent acceptance |

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
