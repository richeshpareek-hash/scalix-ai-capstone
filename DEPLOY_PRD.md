# Scalix Deploy PRD — Seven Launch Decisions

## 1. Go / no-go view

**Verdict: Go for a small, supervised pilot; no-go for autonomous production use.** Scalix is ready to demonstrate and pilot as a read-only decision-support tool because the deterministic regression passes 42 of 42 assertions, the browser suite includes 21 directional, boundary, safety, and adversarial cases, production actions are disabled, and every recommendation remains behind an Executive approval gate. The pilot must not begin until the pilot owner, escalation owner, decision owner, data-access scope, alert thresholds, and rollback procedure are signed off. Expansion is blocked if Scalix produces any false-Green incident, leaks restricted data, bypasses approval, or fails agreed accuracy thresholds.

## 2. Privacy and safety risks

A real pilot would ingest architecture documents, endpoint catalogs, dependency maps, SLOs, capacity limits, incident and performance-test history, sales forecasts, and read-only operational telemetry from systems such as Datadog, Kubernetes, GCP, Kafka, and databases. That information could expose proprietary architecture, customer volumes, control weaknesses, credentials, or regulated data if mishandled. Access must therefore use least privilege, tenant isolation, encryption, retention limits, audit logging, document classification, redaction, and server-side secret management. Prompts, retrieved evidence, agent responses, reviewer findings, approvals, and escalations should be visible only to authorized pilot participants. The model must not receive customer PII, account data, trade-level data, secrets, or production write credentials. This capstone is synthetic end to end; a real pilot would require a formal privacy, security, legal, model-risk, and compliance review first.

## 3. Human operating model

- **Operator:** the Capacity Engineering or SRE lead connects approved read-only evidence, maintains assumptions, runs baseline forecasts and scenarios, and investigates missing telemetry.
- **Escalation owner:** the VP of Engineering or Head of SRE reviews Red/Amber services, low-confidence findings, reviewer disagreements, and any suspected false Green.
- **Decision owner:** the Executive sponsor, normally the CTO, owns final approval, rejection, prioritization, funding, and risk acceptance.

Scalix produces recommendations; it does not change infrastructure or commit engineering targets. A human reviews the deterministic score, supporting evidence, missing-data warnings, analyst narrative, reviewer verdict, and proposed tests before approving, rejecting, editing, or escalating. During the pilot, the three roles hold a weekly 30-minute review of new cases, corrections, incidents, false-Green checks, and unresolved tasks.

## 4. Quality monitoring

- **Quality:** at least 80% of recommendations should be accepted without a material factual correction; 100% of deterministic-versus-narrative contradictions and unsupported bottleneck attributions in the adversarial set must be caught; false-Green rate is a hard zero. Falling below 80% for two consecutive weekly reviews pauses new use and triggers evidence/prompt/eval correction.
- **Value:** median time from forecast question to a reviewable capacity brief should be under 15 minutes and at least 50% lower than the existing manual process; at least 70% of invited pilot users should voluntarily use Scalix twice per month. Missing either target for two review periods triggers workflow research before feature expansion.
- **Risk:** zero unauthorized production actions, zero secrets or restricted records sent to a model, zero cross-tenant evidence exposure, and zero production incidents involving a service Scalix previously labeled Green without a documented review. Any occurrence immediately pauses the pilot, disables Ask Scalix if implicated, preserves logs, and starts incident review.

The full eval suite is rerun monthly and after every scoring, prompt, policy, retrieval, model, or connector change. Score distributions, confidence, evidence completeness, reviewer override rate, escalation rate, latency, failures, and drift in sales-to-load translation are trended.

## 5. User feedback plan

Feedback comes from three channels. First, Approve, Edit, Reject, Escalate, and Jira-sandbox events provide structured behavioral data, including correction reasons and time to decision. Second, the operator and Executive sponsor answer two questions in the weekly review: “What finding was most useful?” and “What was wrong, missing, or too hard to trust?” Third, representative corrected cases are added to the eval dataset and rerun against the same acceptance table. The Product Manager owns prioritization; Capacity Engineering owns evidence and calculation defects; the AI/Platform owner owns prompt, retrieval, validation, and reviewer defects. Changes ship only after regression results and known limitations are updated.

## 6. Pilot plan

Run a six-week shadow pilot with one clearing-and-custody client team: one Executive sponsor, one VP/Head of SRE escalation owner, two Capacity/SRE operators, and up to three read-only reviewers. Include 20 historical or planned equity-clearing capacity cases covering baseline growth, market-open volume, accounts, ACH, baskets, ledger amplification, Kafka lag, regulatory reporting, EOD windows, missing evidence, and conflicting forecasts. Use synthetic or approved sanitized business inputs plus read-only metadata; keep Jira in a sandbox and require human approval for every task. Explicitly exclude production writes, auto-scaling, customer or trade-level PII, order execution, regulatory filing, and automated engineering commitments. Success requires zero hard-risk events, zero false Greens, 100% reviewer detection on the two adversarial contradictions, at least 80% recommendation acceptance without material correction, at least 50% faster brief creation, and written owner approval to continue. Rollback means disabling Ask Scalix, revoking connectors, returning to deterministic baseline reports, and managing exported tasks through the existing engineering process.

## 7. Four-minute video outline

- **0:00–0:30 — Introduction:** introduce Scalix, the fictional ClearOne prototype, and the capacity-readiness decision it supports.
- **0:30–1:30 — Problem and discovery:** explain the gap between sales forecasts and service-level capacity, the slow manual evidence hunt, and the risk of confident conclusions based on missing telemetry.
- **1:30–2:30 — Live solution demo:** open the public link, sign in as ClearOne, show deterministic baseline ACRS, run the 4M-order Ask Scalix scenario, review baseline-versus-scenario service changes, and show that recommendations await approval. Then run the unauthorized-production-action case and show refusal/escalation.
- **2:30–3:30 — Evaluation rigor:** show 42/42 deterministic assertions and the 21-case browser suite. Highlight EV-020, where the reviewer rejects unsupported Kafka attribution, and EV-021, where it catches a Red-score/Green-narrative contradiction. Explain that ACRS is calculated deterministically and the model, when enabled locally, only synthesizes the evidence package. State the honest limitation that ClearOne telemetry and connectors are synthetic.
- **3:30–4:00 — Impact and launch:** summarize faster bottleneck identification and lower false-Green risk, present the six-week read-only shadow pilot, monitoring thresholds, owners, and rollback, and end with the public product URL visible on screen.

## Three final checks

- **FINAL 1 — PRD check: Pass.** Every grading-critical deployment decision is written here without required link-outs.
- **FINAL 2 — Prototype check: Pass.** A reviewer can understand the scenario-to-score-to-review-to-human-decision loop from this PRD and the working prototype.
- **FINAL 3 — Video check: Ready to record.** The four-minute structure covers problem, demo, evidence, limitations, impact, and launch. Final pass depends on recording within four minutes with clear narration and the public link on screen.

## Submission checklist

- Share the completed PRD sheet with faculty as Editor.
- Upload the four-minute video through the course submission page.
- Add both the PRD link and live product URL to the Masterfile row.
- Open both pasted links once from a signed-out/private browser before submitting.
