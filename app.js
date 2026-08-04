const USERS = {
  admin: { password: "admin", role: "admin", display: "Platform Admin" },
  ClearOne: { password: "clear", role: "client", display: "ClearOne Clearing" },
};

const EQUITY_ARCHITECTURE = {
  platform: "GCP / GKE / Cloud SQL / Memorystore / Pub/Sub / BigQuery / Cloud Storage",
  businessFlows: [
    "Open new account",
    "Establish bank relationship",
    "Fund account",
    "Real-time buying power and margin eligibility check before order placement",
    "Place fractional/notional buy/sell equity order",
    "Place basket order, expand into child orders, validate each leg, reserve aggregate buying power/margin, and route eligible legs",
    "Allocate block/basket executions across accounts, sleeves, strategies, or introducing-broker clients before final booking",
    "Ledger entry and funds/position update",
    "Book trade to Broadridge/DTCC-style downstream systems",
    "Intraday margin monitoring, house/maintenance margin checks, PDT/day-trading controls, margin calls, and risk alerts",
    "Reconciliation, confirms, statements, settlement, margin rotation, and SOD broker/client files",
    "Regulatory control plane: CAT transaction reporting, CAIS account reporting, FINRA/TRF reporting, feedback/error repair, and clock synchronization",
    "Client product enrollments: FDIC cash sweep enrollment and FPSL / Fully Paid Securities Lending enrollment",
    "Lifecycle support: CIP/KYC/CDD/AML screening, security master, corporate actions, tax/cost basis, ACATS asset transfers, exception/break management, investigations, and fail management",
  ],
  services: [
    { name: "Account Onboarding Service", gcp: "GKE 4 pods / Cloud SQL KYC DB", event: "account.opened", risk: "KYC vendor latency and document verification bursts" },
    { name: "CDD / KYC AML Screening Service", gcp: "GKE 4 pods / Cloud SQL due-diligence DB / vendor screening adapters / Pub/Sub review queue", event: "cdd.review.completed", risk: "Identity verification, CIP checks, sanctions/PEP screening, adverse media, beneficial-owner review, AML risk scoring, and manual review queue spikes" },
    { name: "FDIC Sweep Enrollment Service", gcp: "GKE 3 pods / Cloud SQL enrollment DB / partner bank file adapter", event: "fdic_sweep.enrolled", risk: "Partner bank eligibility checks, disclosure capture, and nightly sweep-file SLA pressure" },
    { name: "FPSL Enrollment Service", gcp: "GKE 3 pods / Cloud SQL lending enrollment DB / disclosure store", event: "fpsl.enrolled", risk: "Disclosure/e-consent capture, eligibility screening, inventory matching, and opt-out processing bursts" },
    { name: "Bank Relationship Service", gcp: "GKE 3 pods / ACH microservice / Cloud SQL", event: "bank.relationship.established", risk: "ACH verification callbacks and idempotency locks" },
    { name: "Funding Service", gcp: "GKE 4 pods / Pub/Sub / Cloud SQL funds DB", event: "account.funded", risk: "Ledger write contention and ACH status delays" },
    { name: "Security Master Service", gcp: "Cloud Run / Memorystore / BigQuery symbol master", event: "security_master.updated", risk: "Symbol eligibility, halt status, fractional support, and reference-data refresh latency" },
    { name: "Buying Power Service", gcp: "GKE 5 pods / Memorystore Redis / Cloud SQL", event: "buying_power.checked", risk: "Redis hot keys, DB fallback, and synchronous pre-trade path" },
    { name: "Real-Time Buying Power Service", gcp: "GKE 6 pods / Memorystore Redis cluster / Cloud SQL read replicas / Pub/Sub balance stream", event: "realtime_buying_power.calculated", risk: "Market-open fan-out across ledger, positions, funding, open orders, unsettled cash, and margin rules" },
    { name: "Margin Requirement Service", gcp: "GKE 5 pods / Cloud SQL risk rules DB / BigQuery exposure store", event: "margin.requirement.calculated", risk: "Reg-T/house maintenance calculations, concentration rules, short-sale constraints, and optionless equity margin expansion during volatile sessions" },
    { name: "Intraday Margin Monitoring Service", gcp: "GKE stream workers / Pub/Sub margin events / BigQuery risk snapshots", event: "margin.intraday.alerted", risk: "Recalculation storms when prices move sharply and account equity changes across many symbols" },
    { name: "Margin Call Service", gcp: "Cloud Run workflows / Cloud SQL call DB / notification queue", event: "margin.call.created", risk: "Margin-call queue spikes, customer notification SLA pressure, aging logic, and investigation handoff" },
    { name: "Day Trading / PDT Control Service", gcp: "GKE 3 pods / Cloud SQL pattern-day-trader DB / Redis account flags", event: "day_trade.checked", risk: "Synchronous account restriction checks and stale day-trade counters during high order volume" },
    { name: "Basket Order Service", gcp: "GKE 5 pods / Cloud SQL basket DB / Pub/Sub basket topic", event: "basket_order.accepted", risk: "Single parent basket expanding into hundreds of child orders, multiplying buying-power, margin, CAT, routing, booking, ledger, and position workload" },
    { name: "Basket Expansion Service", gcp: "GKE workers / Pub/Sub child-order fan-out / BigQuery basket audit store", event: "basket_order.expanded", risk: "Child-order fan-out bursts, partial basket failure handling, idempotency, and per-leg eligibility validation" },
    { name: "Order Capture Service", gcp: "GKE 6 pods / Pub/Sub orders topic", event: "order.accepted", risk: "Market-open RPS, notional/fractional validation, and Pub/Sub publish quota" },
    { name: "Order Routing Service", gcp: "GKE 5 pods / broker adapter", event: "order.routed", risk: "External broker/Broadridge adapter latency and retries" },
    { name: "Allocation Service", gcp: "GKE 4 pods / Cloud SQL allocation DB / Pub/Sub allocation topic / BigQuery allocation audit store", event: "trade.allocated", risk: "Block and basket execution allocation across accounts, fractional residuals, rounding rules, average-price calculations, and allocation-break repair queues" },
    { name: "Trade Booking Service", gcp: "GKE 4 pods / Cloud SQL trade DB", event: "trade.booked", risk: "Trade DB connection pool and DTCC/Broadridge outbound batch pressure" },
    { name: "Ledger Service", gcp: "GKE 5 pods / Cloud Spanner-style ledger store", event: "ledger.posted", risk: "Double-entry write amplification and serializable balance updates" },
    { name: "Position Service", gcp: "GKE 4 pods / Cloud SQL position DB", event: "position.updated", risk: "High write volume during fills and corporate-action adjustment windows" },
    { name: "CAT Reporting Service", gcp: "GKE workers / Cloud Storage report archive / BigQuery audit store", event: "cat.report.submitted", risk: "Order lifecycle event completeness, FDID mapping, timestamp quality, and T+1 8 AM submission pressure" },
    { name: "CAIS Account Reporting Service", gcp: "Cloud Run jobs / BigQuery account reference store", event: "cais.account.submitted", risk: "Account holder type, FDID consistency, hashed customer identifiers, and T+3 repair workflow pressure" },
    { name: "FINRA TRF Reporting Service", gcp: "GKE 3 pods / TRF adapter / low-latency queue", event: "trf.report.submitted", risk: "OTC trade reporting latency, correction/reversal handling, and facility adapter backpressure" },
    { name: "Regulatory Feedback Service", gcp: "Cloud Run / Cloud Storage feedback files / BigQuery reject store", event: "reg.feedback.processed", risk: "CAT/TRF reject queues, correction deadlines, and feedback-file parsing spikes" },
    { name: "Clock Sync Timestamp Service", gcp: "GKE daemon checks / Cloud Monitoring / audit store", event: "clock.sync.checked", risk: "Clock drift, timestamp granularity, and cross-service event ordering gaps" },
    { name: "Reconciliation Service", gcp: "Cloud Run jobs / BigQuery / Cloud Storage", event: "recon.completed", risk: "N+1 file matching, late files, and overnight batch-window compression" },
    { name: "Exception & Break Management Service", gcp: "GKE 3 pods / BigQuery breaks DB / workflow queue", event: "break.opened", risk: "Unmatched trades, failed bookings, recon breaks, and manual-review queue growth" },
    { name: "Investigation Case Management Service", gcp: "GKE 4 pods / Cloud SQL case DB / Pub/Sub case events / BigQuery evidence store", event: "investigation.opened", risk: "Case creation spikes from recon breaks, CAT/TRF rejects, ACATS rejects, funding disputes, fraud/AML alerts, customer complaints, and settlement failures" },
    { name: "Corporate Actions Service", gcp: "Cloud Run / BigQuery corporate action store / Pub/Sub", event: "corp_action.processed", risk: "Dividend/split/symbol-change events causing position and tax-lot recalculation spikes" },
    { name: "Tax Cost Basis Service", gcp: "Cloud Run jobs / BigQuery tax lots / Cloud Storage forms", event: "taxlot.updated", risk: "Wash-sale, tax-lot, realized gain/loss, and 1099 batch pressure" },
    { name: "ACATS Transfer Service", gcp: "GKE 3 pods / transfer workflow DB / external transfer adapter", event: "acats.transfer.updated", risk: "Transfer-status polling, reject handling, asset mapping, and client service backlog" },
    { name: "Statement Confirm Service", gcp: "Cloud Run / Cloud Storage / Pub/Sub", event: "confirm.generated", risk: "PDF/file generation throughput and storage write bursts" },
    { name: "Settlement & Margin Batch Service", gcp: "GKE workers / Cloud Composer / BigQuery", event: "settlement.completed", risk: "T+1 settlement, margin rotation, and SOD file SLA pressure" },
  ],
  endpoints: [
    { path: "/accounts/open", service: "Account Onboarding Service", currentRps: 35, safeRps: 90, forecastRps: 72, p95: 420, dependency: "KYC DB, document vendor, account-events", limiter: "vendor latency" },
    { path: "/compliance/cdd/screen", service: "CDD / KYC AML Screening Service", currentRps: 38, safeRps: 78, forecastRps: 105, p95: 720, dependency: "identity vendor, sanctions/PEP lists, adverse media, beneficial owner records, AML risk engine, manual review queue", limiter: "vendor screening latency and manual review backlog" },
    { path: "/accounts/fdic-sweep/enroll", service: "FDIC Sweep Enrollment Service", currentRps: 22, safeRps: 65, forecastRps: 58, p95: 360, dependency: "account profile, disclosure store, partner bank file adapter", limiter: "partner bank eligibility/file SLA" },
    { path: "/accounts/fpsl/enroll", service: "FPSL Enrollment Service", currentRps: 18, safeRps: 55, forecastRps: 48, p95: 390, dependency: "account profile, lending eligibility, disclosure/e-consent store", limiter: "eligibility screening and opt-out processing" },
    { path: "/bank/relationships", service: "Bank Relationship Service", currentRps: 28, safeRps: 70, forecastRps: 52, p95: 310, dependency: "ACH adapter, bank-link DB", limiter: "callback idempotency locks" },
    { path: "/funding/deposit", service: "Funding Service", currentRps: 55, safeRps: 130, forecastRps: 96, p95: 260, dependency: "funding DB, ledger service, ACH events", limiter: "ledger write coupling" },
    { path: "/reference/securities/eligibility", service: "Security Master Service", currentRps: 240, safeRps: 520, forecastRps: 610, p95: 95, dependency: "symbol master, fractional eligibility, halt status, restriction list", limiter: "reference-data cache miss / refresh latency" },
    { path: "/buying-power/check", service: "Buying Power Service", currentRps: 180, safeRps: 260, forecastRps: 330, p95: 190, dependency: "Redis, account DB, position DB, funds ledger", limiter: "Redis hot keys / DB fallback" },
    { path: "/buying-power/realtime", service: "Real-Time Buying Power Service", currentRps: 260, safeRps: 340, forecastRps: 620, p95: 210, dependency: "Redis cluster, ledger balances, positions, unsettled cash, open orders, margin requirements", limiter: "market-open account hot keys and multi-service fan-out" },
    { path: "/margin/requirements/calculate", service: "Margin Requirement Service", currentRps: 145, safeRps: 230, forecastRps: 410, p95: 340, dependency: "risk rules DB, security master, positions, ledger, account margin profile", limiter: "house/Reg-T rule calculation and concentration checks" },
    { path: "/margin/intraday/monitor", service: "Intraday Margin Monitoring Service", currentRps: 95, safeRps: 170, forecastRps: 360, p95: 520, dependency: "price events, position updates, margin requirements, Pub/Sub risk stream", limiter: "price-move recalculation storms" },
    { path: "/margin/calls", service: "Margin Call Service", currentRps: 18, safeRps: 42, forecastRps: 88, p95: 740, dependency: "margin deficits, customer notifications, investigation queue, call aging rules", limiter: "notification/case workflow backlog" },
    { path: "/risk/day-trading/check", service: "Day Trading / PDT Control Service", currentRps: 150, safeRps: 280, forecastRps: 500, p95: 160, dependency: "account flags, day-trade counters, buying power, order history", limiter: "synchronous PDT restriction checks" },
    { path: "/orders/equity/basket", service: "Basket Order Service", currentRps: 48, safeRps: 90, forecastRps: 165, p95: 460, dependency: "basket DB, account profile, buying power, margin requirements, security master, Pub/Sub basket.accepted", limiter: "parent-to-child order amplification" },
    { path: "/orders/equity/basket/expand", service: "Basket Expansion Service", currentRps: 520, safeRps: 680, forecastRps: 1250, p95: 390, dependency: "basket definitions, child order topic, security eligibility, routing, CAT events", limiter: "child-order fan-out and partial failure repair" },
    { path: "/orders/equity/place", service: "Order Capture Service", currentRps: 220, safeRps: 360, forecastRps: 510, p95: 240, dependency: "real-time buying power, margin requirements, PDT controls, order DB, Pub/Sub orders.accepted", limiter: "market-open order burst" },
    { path: "/orders/equity/route", service: "Order Routing Service", currentRps: 190, safeRps: 340, forecastRps: 460, p95: 310, dependency: "broker adapter, routing topic, order state DB", limiter: "external adapter retries" },
    { path: "/trades/allocate", service: "Allocation Service", currentRps: 120, safeRps: 210, forecastRps: 390, p95: 430, dependency: "execution fills, basket parent/child link, account allocation rules, average-price engine, allocation DB", limiter: "allocation fan-out, rounding residuals, and allocation-break repair" },
    { path: "/trades/book", service: "Trade Booking Service", currentRps: 160, safeRps: 300, forecastRps: 420, p95: 360, dependency: "trade DB, Broadridge/DTCC outbound, booking-events", limiter: "DB pool and outbound batching" },
    { path: "/ledger/post", service: "Ledger Service", currentRps: 210, safeRps: 330, forecastRps: 520, p95: 290, dependency: "ledger store, funds service, position service", limiter: "double-entry write amplification" },
    { path: "/positions/update", service: "Position Service", currentRps: 170, safeRps: 310, forecastRps: 430, p95: 250, dependency: "position DB, ledger events, trade booked events", limiter: "fill burst writes" },
    { path: "/reg/cat/events", service: "CAT Reporting Service", currentRps: 460, safeRps: 620, forecastRps: 820, p95: 410, dependency: "order events, route events, execution events, FDID map, timestamp service", limiter: "T+1 CAT submission and repair backlog" },
    { path: "/reg/cais/accounts", service: "CAIS Account Reporting Service", currentRps: 40, safeRps: 85, forecastRps: 92, p95: 520, dependency: "account reference DB, FDID map, account holder type, hashed identifiers", limiter: "account/FDID consistency repair queue" },
    { path: "/reg/finra-trf/report", service: "FINRA TRF Reporting Service", currentRps: 75, safeRps: 140, forecastRps: 155, p95: 180, dependency: "trade booking, TRF adapter, correction/reversal queue", limiter: "reporting adapter backpressure" },
    { path: "/reg/feedback/repair", service: "Regulatory Feedback Service", currentRps: 24, safeRps: 45, forecastRps: 70, p95: 900, dependency: "CAT feedback files, TRF rejects, correction workflows", limiter: "reject-file parsing and repair SLA" },
    { path: "/ops/clock-sync/check", service: "Clock Sync Timestamp Service", currentRps: 12, safeRps: 45, forecastRps: 36, p95: 120, dependency: "GKE nodes, service clocks, event timestamp audit store", limiter: "clock drift alert volume" },
    { path: "/recon/run", service: "Reconciliation Service", currentRps: 8, safeRps: 18, forecastRps: 24, p95: 1200, dependency: "BigQuery, Cloud Storage files, broker/DTCC files", limiter: "overnight batch window" },
    { path: "/exceptions/breaks", service: "Exception & Break Management Service", currentRps: 18, safeRps: 40, forecastRps: 64, p95: 760, dependency: "recon breaks DB, trade booking, ledger, client service queue", limiter: "manual-review workflow backlog" },
    { path: "/investigations/cases", service: "Investigation Case Management Service", currentRps: 42, safeRps: 85, forecastRps: 120, p95: 640, dependency: "breaks, CAT/TRF rejects, ACATS rejects, funding disputes, fraud/AML alerts, settlement fails, customer complaints", limiter: "case queue growth and evidence aggregation" },
    { path: "/corporate-actions/process", service: "Corporate Actions Service", currentRps: 10, safeRps: 28, forecastRps: 38, p95: 1100, dependency: "corporate action feed, positions, tax lots, ledger adjustments", limiter: "position/tax-lot recalculation bursts" },
    { path: "/tax/cost-basis/update", service: "Tax Cost Basis Service", currentRps: 32, safeRps: 70, forecastRps: 95, p95: 840, dependency: "trade lots, corporate actions, wash-sale rules, tax forms", limiter: "tax-lot write amplification" },
    { path: "/transfers/acats/status", service: "ACATS Transfer Service", currentRps: 26, safeRps: 58, forecastRps: 66, p95: 620, dependency: "external transfer adapter, asset mapping, account status", limiter: "external transfer status/reject handling" },
    { path: "/statements/confirms", service: "Statement Confirm Service", currentRps: 12, safeRps: 30, forecastRps: 44, p95: 980, dependency: "Cloud Storage, statement templates, email delivery", limiter: "file generation bursts" },
    { path: "/settlement/sod-files", service: "Settlement & Margin Batch Service", currentRps: 6, safeRps: 12, forecastRps: 17, p95: 1800, dependency: "margin batch, SOD broker files, Cloud Composer", limiter: "SOD SLA compression" },
  ],
  dependencies: [
    ["Account Onboarding Service", "CDD / KYC AML Screening Service", "CIP, KYC, CDD, sanctions/PEP, AML risk scoring"],
    ["CDD / KYC AML Screening Service", "FDIC Sweep Enrollment Service", "approved customer eligibility"],
    ["CDD / KYC AML Screening Service", "FPSL Enrollment Service", "approved account and suitability/eligibility checks"],
    ["CDD / KYC AML Screening Service", "Bank Relationship Service", "approved funding eligibility"],
    ["CDD / KYC AML Screening Service", "CAIS Account Reporting Service", "account holder type, FDID, and customer reference data"],
    ["CDD / KYC AML Screening Service", "Investigation Case Management Service", "EDD/manual review/fraud or AML escalation"],
    ["Account Onboarding Service", "FDIC Sweep Enrollment Service", "cash sweep eligibility and disclosures"],
    ["Account Onboarding Service", "FPSL Enrollment Service", "fully paid lending eligibility and disclosures"],
    ["Account Onboarding Service", "Bank Relationship Service", "account readiness"],
    ["Account Onboarding Service", "CAIS Account Reporting Service", "account holder / FDID reporting"],
    ["Bank Relationship Service", "Funding Service", "ACH funding"],
    ["Funding Service", "Ledger Service", "cash ledger update"],
    ["Order Capture Service", "Security Master Service", "symbol eligibility and restrictions"],
    ["Order Capture Service", "Buying Power Service", "sync pre-trade cash check"],
    ["Order Capture Service", "Real-Time Buying Power Service", "real-time cash, unsettled funds, open-order, and margin-aware pre-trade check"],
    ["Order Capture Service", "Margin Requirement Service", "initial/maintenance margin and concentration rule check"],
    ["Order Capture Service", "Day Trading / PDT Control Service", "pattern-day-trader and day-trade buying-power control"],
    ["Order Capture Service", "CAT Reporting Service", "new order / order receipt reportable event"],
    ["Basket Order Service", "Real-Time Buying Power Service", "aggregate basket reserve before child-order release"],
    ["Basket Order Service", "Margin Requirement Service", "portfolio-level and per-leg margin requirement"],
    ["Basket Order Service", "Security Master Service", "per-leg symbol eligibility, halt, fractional, and restriction validation"],
    ["Basket Order Service", "Basket Expansion Service", "parent basket accepted for child-order expansion"],
    ["Basket Expansion Service", "Order Capture Service", "child equity orders generated from parent basket"],
    ["Basket Expansion Service", "CAT Reporting Service", "parent/child order lifecycle and linkage events"],
    ["Basket Expansion Service", "Order Routing Service", "eligible child orders released for routing"],
    ["Basket Expansion Service", "Exception & Break Management Service", "partial basket failures and child-order repair queue"],
    ["Buying Power Service", "Ledger Service", "available funds"],
    ["Buying Power Service", "Position Service", "current holdings"],
    ["Real-Time Buying Power Service", "Ledger Service", "cash, settled/unsettled funds, and reserved balances"],
    ["Real-Time Buying Power Service", "Position Service", "current positions and exposure"],
    ["Real-Time Buying Power Service", "Margin Requirement Service", "margin-aware buying power calculation"],
    ["Real-Time Buying Power Service", "Funding Service", "pending deposits, ACH holds, and cash availability"],
    ["Margin Requirement Service", "Security Master Service", "marginability, price, halt, and restriction data"],
    ["Margin Requirement Service", "Ledger Service", "account equity and debit balance"],
    ["Margin Requirement Service", "Position Service", "symbol exposure and concentration"],
    ["Margin Requirement Service", "Intraday Margin Monitoring Service", "requirement snapshots and deficits"],
    ["Intraday Margin Monitoring Service", "Margin Call Service", "intraday or EOD margin deficiency"],
    ["Margin Call Service", "Investigation Case Management Service", "margin disputes, aged calls, forced liquidation review, and exception handling"],
    ["Order Capture Service", "Order Routing Service", "accepted equity order"],
    ["Order Routing Service", "CAT Reporting Service", "route event reportable lifecycle"],
    ["Order Routing Service", "Allocation Service", "execution/fill event requiring account allocation"],
    ["Allocation Service", "Trade Booking Service", "allocated execution ready for street-side and customer-side booking"],
    ["Allocation Service", "Ledger Service", "allocated money movement by account"],
    ["Allocation Service", "Position Service", "allocated share quantity by account"],
    ["Allocation Service", "CAT Reporting Service", "allocation/account lifecycle and representative-order linkage"],
    ["Allocation Service", "Exception & Break Management Service", "allocation breaks, rounding residuals, and rejected allocation instructions"],
    ["Order Routing Service", "FINRA TRF Reporting Service", "OTC execution reporting when applicable"],
    ["Trade Booking Service", "Ledger Service", "trade money movement"],
    ["Trade Booking Service", "Position Service", "share quantity update"],
    ["Trade Booking Service", "CAT Reporting Service", "execution / allocation reporting"],
    ["Trade Booking Service", "Reconciliation Service", "street-side booking file"],
    ["Trade Booking Service", "Exception & Break Management Service", "failed booking and unmatched trade workflow"],
    ["Position Service", "Corporate Actions Service", "position adjustments and entitlement processing"],
    ["Position Service", "FPSL Enrollment Service", "lendable fully paid inventory"],
    ["Corporate Actions Service", "Tax Cost Basis Service", "tax lot and cost basis recalculation"],
    ["Reconciliation Service", "Statement Confirm Service", "confirmed trade data"],
    ["Reconciliation Service", "Exception & Break Management Service", "recon breaks and repair queue"],
    ["Exception & Break Management Service", "Investigation Case Management Service", "unresolved breaks and manual investigation queue"],
    ["Regulatory Feedback Service", "Investigation Case Management Service", "CAT/TRF rejects requiring investigation"],
    ["Regulatory Feedback Service", "CAT Reporting Service", "CAT reject correction workflow"],
    ["Regulatory Feedback Service", "FINRA TRF Reporting Service", "trade report reject/correction workflow"],
    ["Clock Sync Timestamp Service", "CAT Reporting Service", "timestamp integrity and event ordering"],
    ["ACATS Transfer Service", "Position Service", "incoming/outgoing asset movement"],
    ["ACATS Transfer Service", "Investigation Case Management Service", "transfer rejects and client complaints"],
    ["Funding Service", "Investigation Case Management Service", "ACH returns, funding disputes, and cash movement exceptions"],
    ["Settlement & Margin Batch Service", "Margin Requirement Service", "EOD margin rotation and next-day requirement baseline"],
    ["Settlement & Margin Batch Service", "Investigation Case Management Service", "settlement fails and margin exceptions"],
    ["Ledger Service", "Settlement & Margin Batch Service", "cash/security settlement"],
    ["FDIC Sweep Enrollment Service", "Settlement & Margin Batch Service", "cash sweep allocation and SOD bank files"],
  ],
  events: [
    { topic: "account.opened", throughput: 80, safe: 140, lag: 1200 },
    { topic: "cdd.review.completed", throughput: 95, safe: 120, lag: 14000 },
    { topic: "fdic_sweep.enrolled", throughput: 45, safe: 75, lag: 2200 },
    { topic: "fpsl.enrolled", throughput: 35, safe: 65, lag: 1800 },
    { topic: "bank.relationship.established", throughput: 60, safe: 120, lag: 900 },
    { topic: "account.funded", throughput: 140, safe: 220, lag: 2800 },
    { topic: "security_master.updated", throughput: 450, safe: 520, lag: 9000 },
    { topic: "buying_power.checked", throughput: 780, safe: 900, lag: 15000 },
    { topic: "realtime_buying_power.calculated", throughput: 1050, safe: 1150, lag: 32000 },
    { topic: "margin.requirement.calculated", throughput: 720, safe: 820, lag: 28000 },
    { topic: "margin.intraday.alerted", throughput: 220, safe: 260, lag: 17000 },
    { topic: "margin.call.created", throughput: 70, safe: 85, lag: 13000 },
    { topic: "day_trade.checked", throughput: 650, safe: 760, lag: 9000 },
    { topic: "basket_order.accepted", throughput: 180, safe: 220, lag: 12000 },
    { topic: "basket_order.expanded", throughput: 1450, safe: 1500, lag: 38000 },
    { topic: "order.accepted", throughput: 1100, safe: 1250, lag: 26000 },
    { topic: "order.routed", throughput: 980, safe: 1100, lag: 21000 },
    { topic: "trade.allocated", throughput: 680, safe: 760, lag: 26000 },
    { topic: "trade.booked", throughput: 850, safe: 920, lag: 24000 },
    { topic: "ledger.posted", throughput: 1250, safe: 1300, lag: 42000 },
    { topic: "position.updated", throughput: 900, safe: 1000, lag: 18000 },
    { topic: "cat.report.submitted", throughput: 720, safe: 780, lag: 36000 },
    { topic: "cais.account.submitted", throughput: 82, safe: 95, lag: 7000 },
    { topic: "trf.report.submitted", throughput: 135, safe: 150, lag: 11000 },
    { topic: "reg.feedback.processed", throughput: 60, safe: 70, lag: 19000 },
    { topic: "clock.sync.checked", throughput: 35, safe: 60, lag: 700 },
    { topic: "recon.completed", throughput: 35, safe: 42, lag: 6000 },
    { topic: "break.opened", throughput: 55, safe: 65, lag: 14000 },
    { topic: "investigation.opened", throughput: 96, safe: 110, lag: 18000 },
    { topic: "corp_action.processed", throughput: 34, safe: 40, lag: 12000 },
    { topic: "taxlot.updated", throughput: 88, safe: 100, lag: 16000 },
    { topic: "acats.transfer.updated", throughput: 52, safe: 70, lag: 4200 },
    { topic: "settlement.completed", throughput: 30, safe: 35, lag: 8000 },
  ],
  gcpRisks: ["GKE pod memory pressure", "Cloud SQL connection pools", "Pub/Sub subscription backlog", "Redis hot keys for account buying power and margin balances", "Real-time buying-power fan-out across ledger, positions, funding, open orders, and margin services", "Basket parent-to-child order amplification and Pub/Sub fan-out spikes", "Basket partial-fill/partial-reject repair queues", "Allocation fan-out across accounts, sleeves, strategies, and introducing-broker clients", "Allocation rounding residuals, average-price calculation pressure, and allocation-break repair queues", "Margin requirement recalculation storms during volatile price moves", "Margin-call notification and investigation queue spikes", "PDT/day-trading restriction check latency", "Cloud Composer batch-window compression", "BigQuery slot contention", "Cloud Storage file burst writes", "CDD/KYC/AML vendor latency and manual review backlog", "Regulatory reject/correction queues", "Partner bank sweep-file windows", "FPSL eligibility and opt-out queue spikes", "Investigation case queue spikes and evidence aggregation latency"],
};

const CLEARONE_BASELINE_EQUITY_TRADES = 2400000;

const BUSINESS_DOMAIN_PACKS = [
  {
    id: "clearing-custody",
    name: "Clearing and Custody",
    status: "Ready",
    version: "v1.0",
    rebuilt: "Today",
    examples: "Apex Fintech Solutions, DriveWealth, Pershing-style custody, self-clearing broker-dealers",
    questions: [
      "Does the business self-clear or introduce to another clearing broker?",
      "Which products are supported: equities, options, fixed income, crypto, cash sweep, securities lending?",
      "Which regulatory/control flows matter most: CAT, CAIS, TRF, FINRA, SEC, margin, statements/confirms?",
      "What are the largest transaction types: new accounts, orders, baskets, allocations, trades, funding, batch files?",
      "What similar businesses should Scalix use as domain analogs?"
    ],
    capabilities: [
      "Account opening, CIP/KYC/CDD/AML, funding, bank relationship, buying power, margin, PDT, orders, basket orders, allocation, routing, trade booking, ledger, positions, CAT/CAIS/FINRA reporting, reconciliation, statements/confirms, settlement, SOD/EOD batch, FDIC sweep, FPSL, investigations"
    ],
    vectorDb: "Business vector DB seeded with clearing lifecycle, service taxonomy, event patterns, bottleneck patterns, telemetry checklist, and answer guardrails",
    graph: "Business knowledge graph maps domain capabilities to likely services, endpoints, events, dependencies, batch windows, and common capacity risks",
  },
];

let state = {
  session: null,
  view: "dashboard",
  setupStep: 0,
  businessSetupDraft: {
    selectedPack: "clearing-custody",
    businessSubtype: "Self-clearing broker-dealer and custody platform",
    productScope: "Equities, fractional/notional orders, basket orders, allocation, margin, FDIC sweep, FPSL, statements/confirms, settlement",
    similarBusinesses: "Apex Fintech Solutions, DriveWealth, Pershing-style custody platforms",
    regulatoryFocus: "CAT, CAIS, FINRA TRF, SEC/FINRA books and records, margin, statements/confirms, AML/CDD",
    rebuildReason: "Initial business domain layer build",
  },
  businessLayers: BUSINESS_DOMAIN_PACKS,
  setupDraft: {
    businessType: "Clearing House",
    businessName: "New Client",
    details: "",
    architectureType: "Event Driven Microservice",
    docs: "",
    connectedSources: ["Datadog / Prometheus / Grafana", "Kubernetes / Cloud metadata", "Kafka / Pub/Sub / database metrics", "API gateway logs", "Service catalog"],
    dependencyMap: "",
    endpoints: "",
    uploadedFiles: [],
  },
  clients: [
    {
      id: "ClearOne",
      name: "ClearOne Clearing",
      businessType: "Clearing House",
      status: "Active",
      logo: "C1",
      theme: "clearing",
      details:
        "Fictional self-clearing broker-dealer / clearing and custody platform processing new accounts, CIP/KYC/CDD/AML screening, FDIC cash sweep enrollment, FPSL / Fully Paid Securities Lending enrollment, bank relationships, funding, real-time buying-power checks, house/Reg-T margin calculations, PDT/day-trading controls, fractional/notional equity buy/sell orders, basket orders with child-order expansion, block/basket allocation, ledger/funds/position updates, CAT/CAIS/FINRA reporting, street-side booking, reconciliation, investigations, confirms, statements, settlement, intraday/EOD margin rotation, margin calls, and SOD broker/client files.",
      architectureType: "Event Driven Microservice",
      knowledgeStatus: "Knowledge graph + vector DB ready",
      docs:
        "Synthetic GCP equity-clearing architecture documentation, service catalog, endpoint inventory, Pub/Sub event definitions, database capacity assumptions, CIP/KYC/CDD/AML controls, CAT/CAIS/FINRA reporting controls, FDIC sweep and FPSL enrollment flows, real-time buying power, margin requirements, PDT controls, basket order capture/expansion flows, trade allocation workflows, intraday margin monitoring, margin-call workflows, investigation case workflows, runbooks, incident playbooks, batch details, and ACRS scoring rules.",
      dependencyMap:
        "Equity order path: /orders/equity/place -> Security Master -> Real-Time Buying Power Service -> Margin Requirement Service -> Day Trading / PDT Control Service -> Order Capture Service -> Order Routing Service -> Allocation Service -> Trade Booking Service -> Ledger Service -> Position Service -> CAT/TRF reporting -> Reconciliation -> Exception/Breaks -> Investigations -> Statement/Confirm -> Settlement & Margin Batch. Basket order path: /orders/equity/basket -> Basket Order Service -> aggregate buying-power/margin reserve -> Basket Expansion Service -> child orders -> Order Capture/Order Routing -> Allocation Service -> CAT parent-child/allocation lifecycle -> Trade Booking/Ledger/Position. Margin path includes Ledger/Position/Funding -> Margin Requirement -> Intraday Margin Monitoring -> Margin Call -> Investigation. Account path includes Account Onboarding -> CDD/KYC/AML Screening -> FDIC Sweep Enrollment / FPSL Enrollment -> CAIS reporting.",
      endpoints:
        EQUITY_ARCHITECTURE.endpoints.map((endpoint) => endpoint.path).join(", "),
      architecture: EQUITY_ARCHITECTURE,
      dependencyMatrix: EQUITY_ARCHITECTURE.dependencies,
      endpointCatalog: EQUITY_ARCHITECTURE.endpoints,
      salesTargets: {
        accounts: 18000,
        trades: 2400000,
        equityTrades: 2400000,
        optionsTrades: 0,
        newPositions: 310000,
        peakMultiplier: 3.2,
      },
      services: [],
      ragChunks: [
        "Equity clearing lifecycle: account opening, CIP/KYC/CDD/AML screening, FDIC cash sweep enrollment, FPSL enrollment, bank relationship, funding, real-time buying-power checks, margin requirements, PDT/day-trading controls, single orders, basket orders, child-order expansion, trade allocation, order capture/routing, trade booking, ledger posting, position updates, CAT/CAIS/FINRA reporting, reconciliation, exception/break management, investigations, confirms/statements, settlement, margin rotation, margin calls, and SOD files.",
        "CDD/KYC/AML pattern: identity verification, CIP, customer risk rating, sanctions/PEP screening, adverse media, beneficial-owner review, EDD/manual review, and fraud/AML escalations can delay account readiness and downstream enrollments.",
        "Known capacity pattern: market-open bursts concentrate load around real-time buying power, margin requirement checks, PDT controls, order capture, ledger posting, position updates, and event subscription backlogs.",
        "Buying power and margin pattern: real-time buying power must account for settled cash, unsettled funds, open orders, ledger reservations, positions, marginability, concentration, house requirements, Reg-T maintenance, day-trading/PDT limits, and pending funding holds. Bottlenecks often appear as Redis account hot keys, DB fallback reads, stale position snapshots, or margin-rule recalculation storms.",
        "Basket order pattern: one parent basket can expand into tens or hundreds of child equity orders. Scalix treats this as an amplification risk because each leg may require security eligibility, buying-power reservation, margin calculation, PDT check, CAT linkage, routing, booking, ledger posting, position update, reconciliation, and exception handling.",
        "Allocation pattern: block and basket executions may need to be allocated across accounts, sleeves, strategies, or introducing-broker clients before final customer-side booking. Bottlenecks often appear in average-price calculations, fractional residuals, rounding rules, rejected allocation instructions, CAT allocation linkage, and allocation-break repair queues.",
        "Regulatory/control-plane pattern: CAT order lifecycle events, CAIS account records, TRF reports, feedback rejects, correction queues, clock sync checks, and FDID consistency can become overnight or intraday bottlenecks.",
        "Investigation pattern: unresolved breaks, regulatory rejects, ACATS rejects, ACH returns, fraud/AML alerts, customer complaints, settlement fails, and evidence aggregation can create case-management queues that block downstream corrections.",
        "Product enrollment pattern: FDIC cash sweep and FPSL enrollment introduce disclosure capture, eligibility screening, partner-file windows, inventory matching, and opt-out queue pressure.",
        "GCP risk context: GKE pod memory pressure, Cloud SQL connection pools, Pub/Sub backlog, Redis hot keys, BigQuery slot contention, Cloud Composer batch windows, Cloud Storage burst writes, regulatory reject queues, and partner bank file windows.",
        "ACRS rule: forecasted load above modeled safe capacity drives Critical status unless remediation targets are approved.",
        "Telemetry confidence rule: missing p99 latency, stale Pub/Sub backlog, stale DB pool data, or missing batch duration history can downgrade visible readiness.",
        "AI guardrail rule: Scalix must ground answers in ClearOne knowledge graph, endpoint rows, dependency paths, telemetry signals, deterministic workload translation, and retrieved chunks. It must label assumptions, avoid invented metrics, show confidence, and list missing data.",
        "Answer contract rule: every executive scenario answer should include short answer, evidence used, modeled workload translation, top bottleneck hypotheses, confidence, missing data, and executive-reviewed next actions.",
      ],
    },
  ],
};

const $ = (selector) => document.querySelector(selector);
const money = new Intl.NumberFormat("en-US");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusClass(status) {
  return {
    Green: "green",
    Amber: "amber",
    "At Risk": "risk",
    Critical: "critical",
    Active: "green",
    Draft: "amber",
  }[status] || "amber";
}

function currentClient() {
  const client = state.clients.find((item) => item.id === "ClearOne") || state.clients[0];
  if (client && client.architecture && (!client.services || client.services.length === 0)) {
    client.services = analyzeEquityArchitecture(client).services;
  }
  return client;
}

function clientReadiness(client) {
  if (client.architecture) client.services = analyzeEquityArchitecture(client).services;
  const score = Math.round(client.services.reduce((sum, service) => sum + service.score, 0) / client.services.length);
  const status = score >= 85 ? "Green" : score >= 70 ? "Amber" : score >= 55 ? "At Risk" : "Critical";
  return { score, status, risk: 100 - score };
}

function scoreStatus(score) {
  if (score >= 85) return "Green";
  if (score >= 70) return "Amber";
  if (score >= 55) return "At Risk";
  return "Critical";
}

const SCALIX_MODEL_LAYERS = [
  { name: "Business domain layer", detail: "Reusable industry pack such as Clearing and Custody with domain lifecycle, capability map, service taxonomy, bottleneck patterns, telemetry checklist, and guardrails" },
  { name: "Knowledge layer", detail: "Architecture docs, endpoint catalog, dependency matrix, runbooks, incidents, SLOs, known limits, and batch windows" },
  { name: "Telemetry layer", detail: "Datadog trends, p95/p99 latency, CPU, memory, DB pools, Redis, Pub/Sub lag, pod restarts, API logs, and error rate" },
  { name: "Business forecast layer", detail: "Six-month account growth, equity trade volume, basket order mix, average basket legs, market-open peak, and client onboarding events" },
  { name: "Workload translation layer", detail: "Converts business demand into endpoint RPS, event throughput, DB writes, ledger entries, position updates, CAT events, allocation volume, and batch pressure" },
  { name: "Bottleneck inference layer", detail: "Combines ClearOne dependency graph, telemetry headroom, and known clearing-house bottleneck patterns to form hypotheses" },
  { name: "ACRS scoring layer", detail: "Calculates readiness, residual capacity risk, confidence, RAG status, weakest dependency, and recommended performance target" },
  { name: "AI guardrails layer", detail: "Applies system prompts, answer contracts, evidence checks, confidence downgrades, and no-hallucination rules before responding" },
  { name: "Explainability + chat layer", detail: "Answers executive scenarios with retrieved evidence, projected load, likely bottlenecks, missing data, confidence, and executive-reviewed next actions" },
];

const AI_GUARDRAILS = [
  { name: "Grounded-only answers", detail: "Use ClearOne knowledge graph, endpoint catalog, dependency matrix, telemetry, deterministic model output, and retrieved chunks only." },
  { name: "No invented metrics", detail: "Never fabricate Datadog trends, p99 latency, safe RPS, Pub/Sub lag, incidents, services, or regulatory facts. Missing data must be called out." },
  { name: "Fact vs estimate labeling", detail: "Separate observed facts, modeled forecasts, assumptions, and hypotheses in every executive scenario answer." },
  { name: "Confidence downgrade", detail: "Lower confidence when telemetry, dependency links, basket mix, allocation fan-out, or batch history is incomplete." },
  { name: "Evidence contract", detail: "Each answer must include evidence used, workload translation, top bottlenecks, missing data, and recommended validation." },
  { name: "Human approval", detail: "Scalix recommends targets and validation actions only; it must not auto-change production capacity or configs." },
];

const BOTTLENECK_PATTERN_LIBRARY = [
  { pattern: "Market-open order burst", signal: "High equity order volume peaking at 9:30 AM", likely: "Order Capture, Real-Time Buying Power, Margin Requirement, Order Routing, CAT Reporting", action: "Pre-warm pods/caches, validate peak RPS, protect queues, and raise safe-capacity targets." },
  { pattern: "Basket order amplification", signal: "Basket parent orders with high average leg count", likely: "Basket Expansion, Security Master, Buying Power, Margin Requirement, CAT Reporting, Allocation", action: "Set child-order fan-out limits, isolate basket topics, and test partial reject repair flow." },
  { pattern: "Allocation fan-out", signal: "Block/basket executions allocated across many accounts or sleeves", likely: "Allocation, Trade Booking, Ledger, Position, CAT Reporting, Break Management", action: "Validate average-price, rounding residual, and allocation-break throughput." },
  { pattern: "Real-time buying power hot keys", signal: "Repeated account-level checks against Redis/ledger/position data", likely: "Real-Time Buying Power, Ledger, Position, Funding", action: "Partition account keys, add stale-read guardrails, and measure cache-miss DB fallback." },
  { pattern: "Margin recalculation storm", signal: "High order volume plus volatile prices or concentration changes", likely: "Margin Requirement, Intraday Margin Monitoring, Margin Call, Investigation", action: "Throttle recalculation, snapshot risk inputs, and monitor margin-call queue age." },
  { pattern: "Regulatory event explosion", signal: "Each order/fill/allocation creates CAT/TRF/CAIS lifecycle events", likely: "CAT Reporting, FINRA TRF, Regulatory Feedback, Clock Sync", action: "Validate linkage, timestamp integrity, reject repair, and T+1 submission windows." },
  { pattern: "Overnight batch compression", signal: "Large day volume creates confirms, statements, recon, settlement, margin rotation, and SOD file pressure", likely: "Reconciliation, Statement Confirm, Settlement & Margin Batch", action: "Forecast batch duration and alert before SLA compression exceeds threshold." },
];

function extractScenario(question = "", client) {
  const q = question.toLowerCase();
  const amountMatch = q.match(/(\d+(?:\.\d+)?)\s*(m|million|k|thousand)?/i);
  const amount = amountMatch ? Number(amountMatch[1]) : null;
  const unit = amountMatch ? (amountMatch[2] || "").toLowerCase() : "";
  const numericVolume = amount ? Math.round(amount * (unit.startsWith("m") ? 1000000 : unit.startsWith("k") || unit.startsWith("t") ? 1000 : 1)) : null;
  const basketMention = q.includes("basket");
  const allocationMention = q.includes("allocation") || q.includes("allocate") || q.includes("block");
  const marketOpen = q.includes("9:30") || q.includes("market opens") || q.includes("market open");
  const volatileMarket = q.includes("volatile") || q.includes("volatility") || q.includes("selloff") || q.includes("rally");
  const accountCampaign = q.includes("new account") || q.includes("onboarding") || q.includes("accounts");
  const legMatch = q.match(/(\d+)\s*(legs|symbols|names)/i);
  const avgBasketLegs = legMatch ? Number(legMatch[1]) : basketMention ? 35 : 1;
  const projectedOrders = numericVolume || client.salesTargets.trades;
  const basketParentOrders = basketMention ? Math.max(1, Math.round(projectedOrders * 0.08)) : Math.round(projectedOrders * 0.015);
  const childOrders = basketMention ? basketParentOrders * avgBasketLegs : basketParentOrders * 12;
  const peakMultiplier = marketOpen ? Math.max(client.salesTargets.peakMultiplier, 3.2) : client.salesTargets.peakMultiplier;
  return { question, projectedOrders, basketMention, allocationMention, marketOpen, volatileMarket, accountCampaign, avgBasketLegs, basketParentOrders, childOrders, peakMultiplier };
}

function endpointScenarioMultiplier(endpoint, scenario) {
  const path = endpoint.path;
  let multiplier = scenario.peakMultiplier / 3.2;
  if (scenario.marketOpen && ["/orders/equity/place", "/buying-power/realtime", "/margin/requirements/calculate", "/risk/day-trading/check"].includes(path)) multiplier *= 1.25;
  if (path.includes("/basket")) multiplier *= scenario.basketMention ? Math.max(1.4, scenario.avgBasketLegs / 18) : 0.85;
  if (path.includes("/basket/expand")) multiplier *= scenario.basketMention ? Math.max(1.8, scenario.avgBasketLegs / 12) : 0.9;
  if (path === "/trades/allocate") multiplier *= scenario.basketMention || scenario.allocationMention ? 1.75 : 1.1;
  if (path.includes("/margin") && scenario.volatileMarket) multiplier *= 1.45;
  if (path.includes("/compliance") && scenario.accountCampaign) multiplier *= 1.35;
  if (path.includes("/reg/cat")) multiplier *= scenario.basketMention ? 1.35 : 1.12;
  if (path.includes("/ledger") || path.includes("/positions")) multiplier *= scenario.basketMention ? 1.3 : 1.1;
  return multiplier;
}

function buildWorkloadTranslation(client, scenario) {
  const architecture = client.architecture || EQUITY_ARCHITECTURE;
  const baselineTrades = client.id === "ClearOne" ? CLEARONE_BASELINE_EQUITY_TRADES : Math.max(1, client.salesTargets.equityTrades || CLEARONE_BASELINE_EQUITY_TRADES);
  const baseMultiplier = scenario.projectedOrders / baselineTrades;
  const endpointRows = architecture.endpoints.map((endpoint) => {
    const projectedRps = Math.round(endpoint.forecastRps * baseMultiplier * endpointScenarioMultiplier(endpoint, scenario));
    const ratio = Math.round((projectedRps / endpoint.safeRps) * 100);
    const status = ratio >= 125 ? "Critical" : ratio >= 100 ? "At Risk" : ratio >= 82 ? "Amber" : "Green";
    return { ...endpoint, projectedRps, ratio, status };
  }).sort((a, b) => b.ratio - a.ratio);
  const transactionDecomposition = [
    { label: "Projected equity orders", value: money.format(scenario.projectedOrders), detail: "Business forecast normalized from chat/sales target" },
    { label: "Basket parent orders", value: money.format(scenario.basketParentOrders), detail: `${scenario.basketMention ? "Scenario explicitly mentions baskets" : "Default synthetic basket mix"} at ${scenario.avgBasketLegs} legs average` },
    { label: "Estimated child orders", value: money.format(scenario.childOrders), detail: "Basket expansion load before routing/booking" },
    { label: "Buying power checks", value: money.format(scenario.projectedOrders + scenario.childOrders), detail: "Single orders plus basket child-order reservation pressure" },
    { label: "Margin calculations", value: money.format(Math.round((scenario.projectedOrders + scenario.childOrders) * (scenario.volatileMarket ? 1.35 : 1))), detail: "Pre-trade and intraday requirement checks" },
    { label: "CAT lifecycle events", value: money.format(Math.round((scenario.projectedOrders + scenario.childOrders) * 2.8)), detail: "Order, route, execution, allocation, correction/linkage events" },
    { label: "Ledger/position writes", value: money.format(Math.round((scenario.projectedOrders + scenario.childOrders) * 1.7)), detail: "Booking, money movement, position update, and recon input load" },
  ];
  return { endpointRows, transactionDecomposition };
}

function inferBottlenecks(client, scenario, workload, services, eventRisks) {
  const topEndpoints = workload.endpointRows.filter((endpoint) => endpoint.status !== "Green").slice(0, 7);
  const topServices = services.filter((service) => service.status !== "Green").slice(0, 7);
  const matchingPatterns = BOTTLENECK_PATTERN_LIBRARY.filter((item) => {
    const text = `${item.pattern} ${item.signal} ${item.likely}`.toLowerCase();
    return (scenario.marketOpen && text.includes("market-open")) ||
      (scenario.basketMention && text.includes("basket")) ||
      (scenario.allocationMention && text.includes("allocation")) ||
      (scenario.volatileMarket && text.includes("margin")) ||
      text.includes("buying power") ||
      text.includes("regulatory") ||
      eventRisks.length > 5;
  }).slice(0, 5);
  return { topEndpoints, topServices, matchingPatterns };
}

function confidenceModel(client, scenario, eventRisks) {
  const missing = [
    "p99 latency by endpoint during 9:30-9:45 AM window",
    "Redis hot-key distribution for buying power and margin balances",
    "Cloud SQL connection-pool saturation by service",
    "Pub/Sub consumer lag by subscription, not only topic",
    "Average basket leg count and partial-reject rate",
    "Allocation fan-out by account/sleeve/strategy",
    "Batch duration history for recon, confirms, settlement, margin rotation, and SOD files",
  ];
  let confidence = 86;
  if (eventRisks.length > 8) confidence -= 6;
  if (scenario.basketMention) confidence -= 4;
  if (scenario.volatileMarket) confidence -= 5;
  if (scenario.allocationMention) confidence -= 3;
  return { confidence: Math.max(58, confidence), missing: missing.slice(0, scenario.basketMention || scenario.allocationMention ? 7 : 5) };
}

function analyzeEquityArchitecture(client, overrideOrders, scenarioOverride = null) {
  const architecture = client.architecture || EQUITY_ARCHITECTURE;
  const baselineTrades = client.id === "ClearOne" ? CLEARONE_BASELINE_EQUITY_TRADES : Math.max(1, client.salesTargets.equityTrades || CLEARONE_BASELINE_EQUITY_TRADES);
  const forecastMultiplier = overrideOrders ? overrideOrders / baselineTrades : client.salesTargets.trades / baselineTrades;
  const scenario = scenarioOverride || extractScenario("", client);
  if (overrideOrders && !scenarioOverride) scenario.projectedOrders = overrideOrders;
  const workload = buildWorkloadTranslation(client, scenario);
  const dependencyFanOut = architecture.dependencies.reduce((map, [from]) => {
    map[from] = (map[from] || 0) + 1;
    return map;
  }, {});
  const eventByService = architecture.events.reduce((map, event) => {
    const service = event.topic.split(".")[0];
    map[service] = event;
    return map;
  }, {});
  const services = architecture.services.map((service) => {
    const endpoints = architecture.endpoints.filter((endpoint) => endpoint.service === service.name);
    const weakestEndpoint = endpoints[0];
    const workloadEndpoint = weakestEndpoint ? workload.endpointRows.find((endpoint) => endpoint.path === weakestEndpoint.path) : null;
    const projectedRps = workloadEndpoint ? workloadEndpoint.projectedRps : weakestEndpoint ? Math.round(weakestEndpoint.forecastRps * forecastMultiplier) : 0;
    const capacityRatio = weakestEndpoint ? projectedRps / weakestEndpoint.safeRps : 0.7;
    const event = architecture.events.find((candidate) => service.event === candidate.topic);
    const eventRatio = event ? event.throughput / event.safe : 0.55;
    const lagPenalty = event ? Math.min(20, Math.round(event.lag / 2500)) : 0;
    const fanOutPenalty = Math.min(12, (dependencyFanOut[service.name] || 0) * 4);
    const score = Math.max(35, Math.round(100 - Math.max(0, capacityRatio - 0.65) * 65 - Math.max(0, eventRatio - 0.75) * 35 - lagPenalty - fanOutPenalty));
    const status = scoreStatus(score);
    const bottleneck = weakestEndpoint
      ? `${weakestEndpoint.limiter}; ${service.risk}; projected ${projectedRps} RPS vs ${weakestEndpoint.safeRps} safe`
      : service.risk;
    const target = weakestEndpoint
      ? `Raise ${weakestEndpoint.path} safe capacity to ${Math.ceil(projectedRps * 1.18)} RPS and validate ${service.event} backlog under burst load`
      : `Validate ${service.name} with component-level load and event backlog tests`;
    return { name: service.name, score, status, bottleneck, target, gcp: service.gcp, event: service.event };
  });
  const eventRisks = architecture.events
    .filter((event) => event.throughput / event.safe > 0.82 || event.lag > 15000)
    .map((event) => ({ ...event, ratio: Math.round((event.throughput / event.safe) * 100) }));
  const bottlenecks = inferBottlenecks(client, scenario, workload, services, eventRisks);
  const confidence = confidenceModel(client, scenario, eventRisks);
  return { services, eventRisks, workload, scenario, bottlenecks, confidence };
}

function runScenarioModel(client, question) {
  const scenario = extractScenario(question, client);
  return analyzeEquityArchitecture(client, scenario.projectedOrders, scenario);
}

function login(id, password) {
  const user = USERS[id];
  if (!user || user.password !== password) {
    $("#login-error").textContent = "Invalid login. Try admin/admin or ClearOne/clear.";
    return;
  }
  state.session = { id, ...user };
  state.view = user.role === "admin" ? "admin-home" : "client-dashboard";
  $("#auth-screen").classList.add("hidden");
  $("#app-shell").classList.remove("hidden");
  render();
}

function logout() {
  state.session = null;
  $("#login-id").value = "";
  $("#login-password").value = "";
  $("#login-error").textContent = "";
  $("#app-shell").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
}

function render() {
  if (!state.session) return;
  $("#active-user").textContent = state.session.display;
  $("#active-role").textContent = state.session.role === "admin" ? "Admin console" : "Client workspace";
  $("#brand-logo").textContent = "";
  $("#brand-logo").setAttribute("aria-label", "Scalix");
  $("#brand-title").textContent = state.session.role === "client" ? "Scalix" : "Scalix Admin";
  renderNav();
  if (state.session.role === "admin") renderAdmin();
  else renderClient();
}

function renderNav() {
  const links =
    state.session.role === "admin"
      ? [
          ["admin-home", "Admin Home"],
          ["business-setup", "Business Setup"],
          ["setup-client", "Client Setup"],
          ["manage-clients", "Manage Clients"],
          ["customer-service", "Support"],
        ]
      : [
          ["client-dashboard", "Dashboard"],
          ["business-analytics", "Business Analytics"],
          ["architecture-inputs", "Architecture"],
          ["sales-targets", "Sales Forecast"],
          ["client-knowledge", "Knowledge Base"],
        ];
  $("#main-nav").innerHTML = links
    .map(([view, label]) => `<button class="${state.view === view ? "active" : ""}" data-view="${view}">${label}</button>`)
    .join("");
}

function renderAdmin() {
  if (state.view === "business-setup") return renderBusinessSetup();
  if (state.view === "setup-client") return renderSetupClient();
  if (state.view === "manage-clients") return renderManageClients();
  if (state.view === "customer-service") return renderCustomerService();
  renderAdminHome();
}

function renderAdminHome() {
  $("#workspace").innerHTML = `
    <section class="hero-card admin-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">Admin console</p>
        <h2>Build reusable business layers, onboard customers, and manage client capacity workspaces.</h2>
        <p>Admin users can prebuild a one-time business domain layer, set up client-specific knowledge bases, manage clients, or support customer questions.</p>
      </div>
    </section>
    <section class="option-grid">
      <article class="option-card" data-view-card="business-setup">
        <span>01</span>
        <h3>Business setup</h3>
        <p>Build or rebuild reusable business domain packs such as Clearing and Custody before client-specific RAG is created.</p>
      </article>
      <article class="option-card" data-view-card="setup-client">
        <span>02</span>
        <h3>Set up a new client</h3>
        <p>Guided onboarding form for business profile, architecture documents, dependency maps, endpoints, and RAG setup.</p>
      </article>
      <article class="option-card" data-view-card="manage-clients">
        <span>03</span>
        <h3>Manage existing client</h3>
        <p>Edit architecture changes, upload new documentation, rebuild knowledge graph, or delete fictional client records.</p>
      </article>
      <article class="option-card" data-view-card="customer-service">
        <span>04</span>
        <h3>Customer service</h3>
        <p>Review customer readiness questions, support requests, onboarding status, and knowledge-base health.</p>
      </article>
    </section>
  `;
}

function renderBusinessSetup() {
  const draft = state.businessSetupDraft;
  const selected = state.businessLayers.find((layer) => layer.id === draft.selectedPack) || state.businessLayers[0];
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div>
          <p class="eyebrow">One-time business setup</p>
          <h2>Prebuild reusable business domain layers before client onboarding</h2>
        </div>
        <span class="badge">${state.businessLayers.length} domain pack ready</span>
      </div>
      <p class="muted">This layer becomes the business vector DB and domain knowledge graph. For ClearOne, Scalix should answer common clearing/custody lifecycle questions from this pack first, then go to client RAG and LLM only when the question needs ClearOne-specific architecture, telemetry, or synthesis.</p>
      <form id="business-setup-form" class="setup-form business-setup-form">
        <label>Business domain pack
          <select name="selectedPack">
            <option value="clearing-custody" ${draft.selectedPack === "clearing-custody" ? "selected" : ""}>Clearing and Custody</option>
            <option value="retail-commerce">Retail Commerce</option>
            <option value="streaming-media">Streaming Media</option>
            <option value="banking-payments">Banking and Payments</option>
          </select>
        </label>
        <div class="knowledge-upload-intro">
          <h3>LLM-guided prebuild questions</h3>
          <p class="muted">Admin answers these once. Scalix uses them to build a reusable business layer with domain capabilities, transaction flows, service taxonomy, bottleneck patterns, telemetry checklist, and guardrails.</p>
        </div>
        <div class="form-grid">
          <label>Type of business<textarea name="businessSubtype" rows="4">${escapeHtml(draft.businessSubtype)}</textarea></label>
          <label>Similar businesses / examples<textarea name="similarBusinesses" rows="4">${escapeHtml(draft.similarBusinesses)}</textarea></label>
          <label>Products and flows in scope<textarea name="productScope" rows="5">${escapeHtml(draft.productScope)}</textarea></label>
          <label>Regulatory or business changes to include<textarea name="regulatoryFocus" rows="5">${escapeHtml(draft.regulatoryFocus)}</textarea></label>
        </div>
        <label>Reason for build or rebuild<textarea name="rebuildReason" rows="3">${escapeHtml(draft.rebuildReason)}</textarea></label>
        <div class="form-actions">
          <button type="button" class="ghost-button" data-rebuild-business-layer="${escapeHtml(selected.id)}">Ad hoc rebuild from latest regulation/change</button>
          <button type="submit">Build business layer</button>
        </div>
      </form>
    </section>
    ${businessLayerSummaryHtml(selected)}
  `;
}

function businessLayerSummaryHtml(layer) {
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Business domain pack output</p><h2>${escapeHtml(layer.name)} business layer</h2></div>
        <span class="pill ${statusClass(layer.status)}">${escapeHtml(layer.status)} · ${escapeHtml(layer.version)}</span>
      </div>
      <div class="business-layer-grid">
        <article class="panel"><h3>Domain analogs</h3><p class="muted">${escapeHtml(layer.examples)}</p></article>
        <article class="panel"><h3>Business vector DB</h3><p class="muted">${escapeHtml(layer.vectorDb)}</p></article>
        <article class="panel"><h3>Business knowledge graph</h3><p class="muted">${escapeHtml(layer.graph)}</p></article>
        <article class="panel"><h3>Prebuild questions</h3><ul class="mini-list">${layer.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>
        <article class="panel wide-panel"><h3>Prebuilt business capabilities</h3><p class="muted">${escapeHtml(layer.capabilities.join(", "))}</p></article>
      </div>
    </section>
  `;
}

function renderSetupClient() {
  const step = state.setupStep;
  const steps = ["Business profile", "Knowledge documents", "Data sources", "Architecture model", "Review + build"];
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div>
          <p class="eyebrow">New client setup</p>
          <h2>Build client knowledge base and RAG foundation</h2>
        </div>
        <span class="badge">Step ${step + 1} of 5</span>
      </div>
      <div class="stepper">${steps.map((label, index) => `<div class="${index <= step ? "active" : ""}"><b>${index + 1}</b><span>${label}</span></div>`).join("")}</div>
      <form id="setup-form" class="setup-form">${setupStepHtml(step)}</form>
    </section>
  `;
}

function setupStepHtml(step) {
  const draft = state.setupDraft;
  if (step === 0) {
    const types = ["Clearing House", "Retail Seller / Macy's style", "Streaming Media / Netflix style", "Banking", "Marketplace", "Logistics", "Healthcare", "Custom"];
    return `
      <div class="form-grid">
        <label>Business name<input name="businessName" value="${escapeHtml(draft.businessName)}" /></label>
        <label>Business details<textarea name="details" rows="5">${escapeHtml(draft.details)}</textarea></label>
      </div>
      <p class="field-label">Business type</p>
      <div class="radio-grid">${types.map((type) => `<label><input type="radio" name="businessType" value="${escapeHtml(type)}" ${draft.businessType === type ? "checked" : ""} /> ${escapeHtml(type)}</label>`).join("")}</div>
      ${setupButtons()}
    `;
  }
  if (step === 1) {
    return `
      <div class="knowledge-upload-intro">
        <h3>Upload client knowledge package</h3>
        <p class="muted">These documents become the source material for chunking, embeddings, RAG retrieval, the service knowledge graph, and ACRS explanations.</p>
      </div>
      <div class="document-upload-grid">
        ${knowledgeDocumentFields().map((field) => `
          <label class="upload-card">
            <span>${field.title}</span>
            <small>${field.help}</small>
            <input type="file" name="${field.name}" multiple />
          </label>
        `).join("")}
      </div>
      <label>Additional architecture documentation and details<textarea name="docs" rows="8">${escapeHtml(draft.docs)}</textarea></label>
      ${setupButtons()}
    `;
  }
  if (step === 2) {
    const sources = ["Datadog / Prometheus / Grafana", "Kubernetes / GCP / AWS / Azure metadata", "Kafka / Pub/Sub / database metrics", "API gateway logs", "Service catalog"];
    return `
      <div class="knowledge-upload-intro">
        <h3>Connect production data sources</h3>
        <p class="muted">In a real deployment these connectors continuously refresh telemetry, metadata, logs, capacity limits, and service ownership. For the demo, checked sources simulate active integrations.</p>
      </div>
      <div class="connector-grid">
        ${sources.map((source) => `
          <label class="connector-card">
            <input type="checkbox" name="connectedSources" value="${escapeHtml(source)}" ${draft.connectedSources.includes(source) ? "checked" : ""} />
            <b>${escapeHtml(source)}</b>
            <small>${connectorHelp(source)}</small>
          </label>
        `).join("")}
      </div>
      ${setupButtons()}
    `;
  }
  if (step === 3) {
    const architectures = ["Microservice", "Event Driven Microservice", "Monolithic", "Layered", "Serverless", "Hybrid"];
    return `
      <p class="field-label">Type of architecture</p>
      <div class="radio-grid">${architectures.map((type) => `<label><input type="radio" name="architectureType" value="${escapeHtml(type)}" ${draft.architectureType === type ? "checked" : ""} /> ${escapeHtml(type)}</label>`).join("")}</div>
      <div class="form-grid">
        <label>Dependency map document<input type="file" name="dependencyMapFile" multiple /></label>
        <label>Endpoint catalog document<input type="file" name="endpointCatalogFile" multiple /></label>
      </div>
      <label>Dependency map summary<textarea name="dependencyMap" rows="6">${escapeHtml(draft.dependencyMap)}</textarea></label>
      <label>Endpoint catalog summary<textarea name="endpoints" rows="6">${escapeHtml(draft.endpoints)}</textarea></label>
      ${setupButtons()}
    `;
  }
  return `
    <div class="review-card">
      <h3>${escapeHtml(draft.businessName)}</h3>
      <dl>
        <div><dt>Business type</dt><dd>${escapeHtml(draft.businessType)}</dd></div>
        <div><dt>Architecture</dt><dd>${escapeHtml(draft.architectureType)}</dd></div>
        <div><dt>Files</dt><dd>${draft.uploadedFiles.length ? draft.uploadedFiles.map(escapeHtml).join(", ") : "No files selected in demo"}</dd></div>
        <div><dt>Connected sources</dt><dd>${draft.connectedSources.map(escapeHtml).join(", ")}</dd></div>
        <div><dt>Dependency map</dt><dd>${escapeHtml(draft.dependencyMap || "Will be generated from onboarding inputs")}</dd></div>
        <div><dt>Endpoints</dt><dd>${escapeHtml(draft.endpoints || "Will be generated from service catalog import")}</dd></div>
      </dl>
      <p class="muted">On submit, Scalix will chunk all uploaded documents, extract entities and relationships, connect telemetry/data-source metadata, build a customer-specific knowledge graph, and initialize a vector database for RAG retrieval.</p>
    </div>
    ${setupButtons(true)}
  `;
}

function setupButtons(finalStep = false) {
  return `
    <div class="form-actions">
      <button type="button" class="ghost-button" data-setup-back ${state.setupStep === 0 ? "disabled" : ""}>Back</button>
      <button type="submit">${finalStep ? "Submit and build knowledge base" : "Next"}</button>
    </div>
  `;
}

function knowledgeDocumentFields() {
  return [
    { name: "serviceArchitectureFile", title: "Service architecture", help: "Services, ownership, runtime platform, pods, scaling rules, and system boundaries." },
    { name: "endpointCatalogFile", title: "Endpoint catalog", help: "API paths, methods, RPS, latency, SLOs, owners, and business mappings." },
    { name: "dependencyMapFile", title: "Dependency map", help: "Service-to-service calls, databases, Kafka/Pub/Sub topics, sync/async flows." },
    { name: "businessTransactionsFile", title: "Business transaction types", help: "Accounts, trades, payments, batch jobs, client onboarding, and peak windows." },
    { name: "sloSlaFile", title: "SLOs / SLAs", help: "Latency, availability, error-rate targets, capacity promises, and escalation thresholds." },
    { name: "knownCapacityFile", title: "Known capacity limits", help: "Safe RPS, pod limits, DB pools, Kafka partitions, queue limits, and tested ceilings." },
    { name: "runbooksFile", title: "Runbooks", help: "Operational playbooks, remediation steps, scale-up instructions, and known fixes." },
    { name: "performanceHistoryFile", title: "Performance test history", help: "Load tests, stress tests, soak tests, bottleneck findings, and target evidence." },
    { name: "incidentHistoryFile", title: "Incident history", help: "Past outages, latency spikes, retry storms, Kafka lag, DB saturation, and lessons learned." },
    { name: "batchDetailsFile", title: "Batch details", help: "EOD jobs, reconciliation, settlement windows, batch dependencies, and volume assumptions." },
  ];
}

function connectorHelp(source) {
  if (source.includes("Datadog")) return "Latency, errors, saturation, traces, alerts, dashboards, and historical trends.";
  if (source.includes("Kubernetes")) return "Pods, autoscaling, CPU/memory limits, cluster metadata, cloud capacity, and deployments.";
  if (source.includes("Kafka")) return "Topics, partitions, lag, throughput, DB metrics, pools, query latency, and backlog pressure.";
  if (source.includes("API gateway")) return "Request volume, endpoint traffic, auth failures, throttling, status codes, and access logs.";
  return "Service ownership, descriptions, endpoint inventory, business flow mappings, and dependency references.";
}

function captureSetupForm(form) {
  const data = new FormData(form);
  if (form.querySelectorAll('input[name="connectedSources"]').length) {
    state.setupDraft.connectedSources = data.getAll("connectedSources");
  }
  for (const [key, value] of data.entries()) {
    if (key === "connectedSources") continue;
    if (value instanceof File) {
      if (value.name) state.setupDraft.uploadedFiles.push(value.name);
    } else if (key in state.setupDraft) {
      state.setupDraft[key] = value;
    }
  }
}

function submitClientSetup() {
  const id = state.setupDraft.businessName.replace(/[^a-z0-9]/gi, "").slice(0, 16) || "NewClient";
  state.clients.push({
    id,
    name: state.setupDraft.businessName,
    businessType: state.setupDraft.businessType,
    status: "Active",
    logo: id.slice(0, 2).toUpperCase(),
    theme: "generic",
    details: state.setupDraft.details || "New client onboarded through Scalix admin setup.",
    architectureType: state.setupDraft.architectureType,
    knowledgeStatus: "Knowledge graph + vector DB built from documents and connectors",
    docs: state.setupDraft.docs,
    connectedSources: [...state.setupDraft.connectedSources],
    dependencyMap: state.setupDraft.dependencyMap,
    endpoints: state.setupDraft.endpoints,
    salesTargets: { accounts: 5000, trades: 750000, equityTrades: 450000, optionsTrades: 150000, newPositions: 80000, peakMultiplier: 2.4 },
    services: [
      { name: "Core API Service", score: 78, status: "Amber", bottleneck: "Needs baseline load test", target: "Establish safe RPS target" },
      { name: "Database", score: 73, status: "Amber", bottleneck: "Connection-pool unknowns", target: "Capture burst-level telemetry" },
    ],
    ragChunks: [
      "Service architecture, endpoint catalog, dependency map, transaction types, SLO/SLA, capacity-limit, runbook, performance-test, incident-history, and batch-detail documents imported.",
      "Telemetry connectors selected: " + state.setupDraft.connectedSources.join(", ") + ".",
      "Dependency map and endpoint details chunked for retrieval and linked into the customer knowledge graph.",
      "Initial ACRS thresholds created from default customer policy.",
    ],
  });
  state.setupStep = 0;
  state.setupDraft = { businessType: "Clearing House", businessName: "New Client", details: "", architectureType: "Event Driven Microservice", docs: "", connectedSources: ["Datadog / Prometheus / Grafana", "Kubernetes / Cloud metadata", "Kafka / Pub/Sub / database metrics", "API gateway logs", "Service catalog"], dependencyMap: "", endpoints: "", uploadedFiles: [] };
  state.view = "manage-clients";
  render();
}

function buildBusinessLayer(form) {
  const data = new FormData(form);
  state.businessSetupDraft.selectedPack = data.get("selectedPack") || "clearing-custody";
  state.businessSetupDraft.businessSubtype = data.get("businessSubtype") || "";
  state.businessSetupDraft.productScope = data.get("productScope") || "";
  state.businessSetupDraft.similarBusinesses = data.get("similarBusinesses") || "";
  state.businessSetupDraft.regulatoryFocus = data.get("regulatoryFocus") || "";
  state.businessSetupDraft.rebuildReason = data.get("rebuildReason") || "";
  const existing = state.businessLayers.find((layer) => layer.id === state.businessSetupDraft.selectedPack);
  if (!existing) return;
  const bump = Number(existing.version.replace("v", "")) + 0.1;
  existing.version = `v${bump.toFixed(1)}`;
  existing.status = "Ready";
  existing.rebuilt = "Just now";
  existing.examples = state.businessSetupDraft.similarBusinesses;
  existing.capabilities = [
    `${state.businessSetupDraft.businessSubtype}: ${state.businessSetupDraft.productScope}. Regulatory/business focus: ${state.businessSetupDraft.regulatoryFocus}.`
  ];
  existing.vectorDb = "Business vector DB rebuilt from LLM-guided domain questions, similar-business examples, clearing/custody lifecycle, known bottleneck patterns, regulatory/control flows, and telemetry checklist.";
  existing.graph = "Business knowledge graph rebuilt with reusable domain capabilities, transaction decomposition rules, service taxonomy, endpoint/event patterns, and common capacity risk paths.";
  renderBusinessSetup();
}

function renderManageClients(editId = null) {
  const editing = editId ? state.clients.find((client) => client.id === editId) : null;
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div>
          <p class="eyebrow">Client management</p>
          <h2>Edit, delete, or rebuild customer knowledge graphs</h2>
        </div>
        <span class="badge">${state.clients.length} clients</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Client</th><th>Business</th><th>Architecture</th><th>Knowledge status</th><th>Actions</th></tr></thead>
          <tbody>
            ${state.clients.map((client) => `
              <tr>
                <td><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.id)}</small></td>
                <td>${escapeHtml(client.businessType)}</td>
                <td>${escapeHtml(client.architectureType)}</td>
                <td><span class="pill ${statusClass(client.status)}">${escapeHtml(client.knowledgeStatus)}</span></td>
                <td>
                  <button class="small-button" data-edit-client="${escapeHtml(client.id)}">Edit</button>
                  <button class="small-button danger" data-delete-client="${escapeHtml(client.id)}">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      ${editing ? editClientHtml(editing) : ""}
    </section>
  `;
}

function editClientHtml(client) {
  return `
    <form id="edit-client-form" class="setup-form edit-form" data-client-id="${escapeHtml(client.id)}">
      <h3>Edit ${escapeHtml(client.name)}</h3>
      <div class="form-grid">
        <label>Business name<input name="name" value="${escapeHtml(client.name)}" /></label>
        <label>Business type<input name="businessType" value="${escapeHtml(client.businessType)}" /></label>
      </div>
      <label>Upload new architecture documentation<input type="file" name="newDoc" multiple /></label>
      <label>Architecture details<textarea name="docs" rows="5">${escapeHtml(client.docs)}</textarea></label>
      <label>Dependency map<textarea name="dependencyMap" rows="4">${escapeHtml(client.dependencyMap)}</textarea></label>
      <label>Endpoint details<textarea name="endpoints" rows="4">${escapeHtml(client.endpoints)}</textarea></label>
      <div class="form-actions">
        <button type="button" class="ghost-button" data-cancel-edit>Cancel</button>
        <button type="submit">Update knowledge graph</button>
      </div>
    </form>
  `;
}

function renderCustomerService() {
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Customer service</p><h2>Support queue and onboarding health</h2></div>
        <span class="badge">Demo queue</span>
      </div>
      <div class="ticket-grid">
        <article><b>ClearOne Clearing</b><span class="pill risk">At Risk</span><p>Question: How will market-open order surge affect Kafka and Trade DB?</p></article>
        <article><b>NorthBridge Retail</b><span class="pill amber">Onboarding</span><p>Waiting for endpoint catalog and dependency map upload.</p></article>
        <article><b>StreamArc Media</b><span class="pill green">Healthy</span><p>Knowledge base rebuilt successfully after architecture update.</p></article>
      </div>
    </section>
  `;
}

function renderClient() {
  const client = currentClient();
  if (state.view === "business-analytics") return renderBusinessAnalytics();
  if (state.view === "architecture-inputs") return renderArchitectureInputs();
  if (state.view === "sales-targets") return renderSalesTargets();
  if (state.view === "client-knowledge") return renderClientKnowledge();
  renderClientDashboard(false);
}

function renderClientDashboard(focusChat) {
  const client = currentClient();
  const businessLayer = state.businessLayers.find((layer) => layer.id === "clearing-custody");
  const readiness = clientReadiness(client);
  const analysis = analyzeEquityArchitecture(client);
  const bottlenecks = client.services.filter((s) => s.status !== "Green").slice(0, 3);
  const criticalCount = client.services.filter((s) => ["Critical", "At Risk"].includes(s.status)).length;
  $("#workspace").innerHTML = `
    <div class="enterprise-dashboard">
    <section class="cockpit-header">
      <div class="cockpit-titlebar">
        <div>
          <p class="eyebrow">ClearOne workspace</p>
          <h2>Capacity Readiness Dashboard</h2>
          <p>Six-month readiness view based on architecture, dependency matrix, telemetry assumptions, and sales forecast.</p>
        </div>
        <div class="client-chip">
          <div class="client-logo">${client.logo}</div>
          <div><strong>${client.name}</strong><span>${client.businessType}</span></div>
        </div>
      </div>
      ${chatBoxHtml(focusChat)}
    </section>
    <section id="chat-response" class="chat-response ${focusChat ? "" : "hidden"}"></section>
    <section class="executive-kpi-grid">
      <article class="acrs-card">
        <div class="acrs-card-top">
          <div><span>Overall ACRS</span><strong>${readiness.score}</strong></div>
          <b class="status-chip ${statusClass(readiness.status)}">${readiness.status}</b>
        </div>
        <div class="readiness-meter"><span style="width: ${readiness.score}%"></span></div>
        <p>AI Capacity Readiness Score. Capacity Risk: <strong>${readiness.risk}</strong>.</p>
      </article>
      <article class="metric-card"><span>Capacity risk</span><strong>${readiness.risk}</strong><p>Residual risk after modeled readiness.</p></article>
      <article class="metric-card"><span>At-risk services</span><strong>${criticalCount}</strong><p>Critical or At Risk in six-month view.</p></article>
      <article class="metric-card"><span>Forecast trades/day</span><strong>${money.format(client.salesTargets.equityTrades)}</strong><p>${client.salesTargets.peakMultiplier}x market-open peak.</p></article>
      <article class="metric-card"><span>Model confidence</span><strong>${analysis.confidence.confidence}%</strong><p>${businessLayer ? businessLayer.version : "v1.0"} business layer.</p></article>
    </section>
    <section class="executive-layout">
      <article class="score-card">
        <div class="card-top"><span>Executive summary</span><b class="status-chip ${statusClass(readiness.status)}">${readiness.status}</b></div>
        <h3>${readiness.status === "Green" ? "ClearOne is broadly ready for the current six-month target." : "ClearOne needs targeted capacity action before aggressive equity growth."}</h3>
        <p>The largest capacity pressure is concentrated around real-time buying power, basket and allocation fan-out, order capture, ledger/position writes, regulatory reporting, and overnight batch windows.</p>
        <p class="muted">Scalix recommends executive review before sending targets to engineering. Detailed score logic and evidence live in Business Analytics.</p>
      </article>
      <article class="panel">
        <p class="eyebrow">Top bottlenecks</p>
        ${bottlenecks.map((s) => `<div class="insight compact"><strong>${s.name}</strong><p>${summarizeBottleneck(s.bottleneck)}</p></div>`).join("")}
      </article>
      <article class="panel warning">
        <p class="eyebrow">Executive action focus</p>
        <ul class="compact-list">
          <li>Validate market-open peak targets for order, buying-power, margin, basket, and allocation flows.</li>
          <li>Watch Pub/Sub backlog, Redis hot keys, Cloud SQL pools, and overnight batch/SOD windows.</li>
          <li>Use Business Analytics for dependency matrix, endpoint pressure, score logic, and guardrails.</li>
        </ul>
      </article>
    </section>
    ${serviceStatusHtml(client)}
    </div>
  `;
}

function summarizeBottleneck(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(";").map((part) => part.trim()).filter(Boolean);
  const primary = parts[0] || cleaned;
  const projected = parts.find((part) => part.toLowerCase().includes("projected"));
  return projected ? `${primary}. ${projected}.` : primary;
}

function summarizeTarget(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (cleaned.startsWith("Raise ")) {
    const match = cleaned.match(/Raise\s+(.+?)\s+safe capacity to\s+([0-9,]+)\s+RPS/i);
    if (match) return `Raise ${match[1]} to ${match[2]} safe RPS`;
  }
  return cleaned.split(" and ")[0].replace(/\.$/, "");
}

function renderBusinessAnalytics() {
  const client = currentClient();
  const readiness = clientReadiness(client);
  const analysis = analyzeEquityArchitecture(client);
  $("#workspace").innerHTML = `
    <section class="block analytics-intro">
      <div class="section-title">
        <div>
          <p class="eyebrow">Business analytics</p>
          <h2>Model logic, guardrails, and architecture evidence</h2>
        </div>
        <span class="badge">ACRS ${readiness.score} / ${readiness.status}</span>
      </div>
      <p class="muted">This tab keeps the dashboard clean while preserving the deeper Scalix evidence trail: prediction pipeline, anti-hallucination rules, score calculation, event pressure, dependencies, and endpoint catalog.</p>
    </section>
    ${modelLayersHtml(analysis)}
    ${guardrailsHtml()}
    ${scoreCalculationHtml(client, readiness, analysis)}
    ${eventRiskHtml(client)}
    ${dependencyMatrixHtml(client)}
    ${endpointCatalogHtml(client)}
  `;
}

function scoreCalculationHtml(client, readiness, analysis) {
  const topEndpoints = analysis.workload.endpointRows.slice(0, 5);
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">How ACRS is calculated</p><h2>Readiness score logic used for the service RAG</h2></div>
        <span class="badge">Continuous model</span>
      </div>
      <div class="score-explain-grid">
        <article class="panel">
          <h3>Overall formula</h3>
          <p>ACRS is the average of modeled service readiness scores. Capacity Risk is calculated as <strong>100 - ACRS</strong>.</p>
          <p>Each service starts at 100 and is reduced by projected endpoint pressure, event throughput pressure, backlog/lag, and dependency fan-out.</p>
        </article>
        <article class="panel">
          <h3>Sales target impact</h3>
          <p>ClearOne uses a baseline of ${money.format(CLEARONE_BASELINE_EQUITY_TRADES)} equity trades/day. Lowering the six-month target lowers projected RPS, which should increase ACRS.</p>
          <p>Current target: <strong>${money.format(client.salesTargets.equityTrades)}</strong> equity trades/day with <strong>${client.salesTargets.peakMultiplier}x</strong> peak multiplier.</p>
        </article>
        <article class="panel">
          <h3>RAG thresholds</h3>
          <p>Default thresholds: Green >= 85, Amber 70-84, At Risk 55-69, Critical < 55. These are customer-configurable in the product vision.</p>
          <p>Current modeled confidence: <strong>${analysis.confidence.confidence}%</strong>. Missing telemetry lowers certainty and should force human review.</p>
        </article>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Endpoint</th><th>Projected RPS</th><th>Safe RPS</th><th>Pressure</th><th>Limiter</th></tr></thead>
          <tbody>
            ${topEndpoints.map((endpoint) => `
              <tr>
                <td><strong>${escapeHtml(endpoint.path)}</strong></td>
                <td>${endpoint.projectedRps}</td>
                <td>${endpoint.safeRps}</td>
                <td><span class="pill ${statusClass(endpoint.status)}">${endpoint.ratio}%</span></td>
                <td>${escapeHtml(endpoint.limiter)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function chatBoxHtml(focusChat) {
  return `
    <form id="scenario-chat" class="scenario-chat">
      <input id="scenario-question" ${focusChat ? "autofocus" : ""} placeholder="Ask a scenario, e.g. I'm expecting 4M orders peaking at 9:30 am. Any bottlenecks?" />
      <button type="submit">Ask Scalix</button>
    </form>
  `;
}

function modelLayersHtml(analysis) {
  const workloadRows = analysis.workload.endpointRows.slice(0, 6);
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Scalix prediction pipeline</p><h2>How Scalix predicts bottlenecks without full end-to-end performance testing</h2></div>
        <span class="badge">${analysis.confidence.confidence}% model confidence</span>
      </div>
      <div class="layer-grid">
        ${SCALIX_MODEL_LAYERS.map((layer, index) => `
          <article class="layer-card">
            <span>${index + 1}</span>
            <h3>${escapeHtml(layer.name)}</h3>
            <p>${escapeHtml(layer.detail)}</p>
          </article>
        `).join("")}
      </div>
      <div class="model-output-grid">
        <article class="panel">
          <p class="eyebrow">Business to workload translation</p>
          <div class="mini-metrics">
            ${analysis.workload.transactionDecomposition.slice(0, 4).map((item) => `
              <div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.detail)}</small></div>
            `).join("")}
          </div>
        </article>
        <article class="panel">
          <p class="eyebrow">Top inferred endpoint pressure</p>
          <ul class="mini-list">
            ${workloadRows.map((endpoint) => `<li><strong>${escapeHtml(endpoint.path)}</strong> ${endpoint.ratio}% of safe capacity · ${escapeHtml(endpoint.limiter)}</li>`).join("")}
          </ul>
        </article>
        <article class="panel">
          <p class="eyebrow">Bottleneck pattern library</p>
          <ul class="mini-list">
            ${analysis.bottlenecks.matchingPatterns.slice(0, 4).map((pattern) => `<li><strong>${escapeHtml(pattern.pattern)}</strong> — ${escapeHtml(pattern.likely)}</li>`).join("")}
          </ul>
        </article>
        <article class="panel warning">
          <p class="eyebrow">Missing data that lowers certainty</p>
          <ul class="mini-list">
            ${analysis.confidence.missing.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      </div>
    </section>
  `;
}

function guardrailsHtml() {
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">AI safety and answer guardrails</p><h2>How Scalix reduces hallucination risk</h2></div>
        <span class="badge">Grounded answer contract</span>
      </div>
      <div class="guardrail-grid">
        ${AI_GUARDRAILS.map((rule) => `
          <article class="guardrail-card">
            <h3>${escapeHtml(rule.name)}</h3>
            <p>${escapeHtml(rule.detail)}</p>
          </article>
        `).join("")}
      </div>
      <article class="panel warning guardrail-contract">
        <p class="eyebrow">Required chat answer contract</p>
        <p>Every executive answer must show: short answer, evidence used, modeled workload translation, top bottleneck hypotheses, confidence, missing telemetry, and executive-reviewed next actions. If Scalix does not have evidence, it must say so instead of filling the gap.</p>
      </article>
    </section>
  `;
}

function renderChatResponse(question) {
  const client = currentClient();
  const analysis = runScenarioModel(client, question);
  const scenario = analysis.scenario;
  const projectedOrders = scenario.projectedOrders;
  const marketOpen = scenario.marketOpen;
  const scenarioScore = Math.round(analysis.services.reduce((sum, service) => sum + service.score, 0) / analysis.services.length);
  const readiness = { score: scenarioScore, status: scoreStatus(scenarioScore), risk: 100 - scenarioScore };
  const redServices = analysis.services.filter((s) => ["Critical", "At Risk"].includes(s.status)).slice(0, 6);
  const eventRisks = analysis.eventRisks.slice(0, 5);
  const endpoints = analysis.bottlenecks.topEndpoints.slice(0, 5);
  const patterns = analysis.bottlenecks.matchingPatterns.slice(0, 4);
  $("#chat-response").classList.remove("hidden");
  $("#chat-response").innerHTML = `
    <article class="llm-card">
      <header><h3>Scalix scenario response</h3><span class="json-chip">RAG + ClearOne knowledge graph</span></header>
      <div class="mini-metrics chat-metrics">
        ${analysis.workload.transactionDecomposition.map((item) => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.detail)}</small></div>`).join("")}
      </div>
      <p><strong>Model path:</strong> Scalix first checks the reusable Clearing and Custody business layer, then decomposes your question into business volume, translates it into endpoint/event pressure, walks the ClearOne dependency matrix, matches known clearing-house bottleneck patterns, compares projected load to safe capacity, and applies a confidence discount based on missing telemetry.</p>
      <p><strong>Guardrail check:</strong> This answer is limited to the business domain layer, ClearOne's knowledge graph, endpoint catalog, dependency matrix, synthetic telemetry model, retrieved RAG chunks, and deterministic workload calculations. Any unobserved value is treated as modeled or missing rather than asserted as fact.</p>
      <p><strong>Short answer:</strong> Yes — at ${money.format(projectedOrders)} equity orders${marketOpen ? " peaking at the 9:30 AM market open" : ""}, Scalix expects bottlenecks in real-time buying power, basket child-order expansion, allocation, margin requirement calculation, PDT/day-trading checks, order capture/routing, trade booking, ledger posting, position updates, CAT/CAIS/FINRA reporting, investigation case queues, and overnight downstream processing. If this surge includes basket/block orders or is paired with a new-account campaign, amplification and CDD/KYC/AML manual-review queues become material risks.</p>
      <p><strong>Why:</strong> ClearOne's private knowledge graph maps account readiness through CIP/KYC/CDD/AML checks before FDIC sweep, FPSL, bank funding, and CAIS reporting; it maps equity order placement through GCP/GKE services, Redis buying-power cache, basket parent-child expansion, allocation rules, Cloud SQL/ledger writes, real-time margin requirements, position exposure, open-order reservations, PDT controls, Pub/Sub event topics, CAT/TRF regulatory reporting, Broadridge/DTCC-style booking, reconciliation files, exception/break workflows, investigation cases, confirms/statements, settlement, intraday/EOD margin rotation, margin calls, and SOD broker/client files. The highest-risk pattern is synchronous pre-trade fan-out plus basket order amplification plus allocation fan-out/rounding repair plus margin-rule recalculation plus event backlog plus CDD/manual-review backlog plus regulatory repair queues plus investigation case growth plus write amplification.</p>
      <ul>
        ${redServices.map((service) => `<li><strong>${service.name}:</strong> ${service.bottleneck}. Recommended target: ${service.target}.</li>`).join("")}
      </ul>
      <p><strong>Highest endpoint pressure:</strong> ${endpoints.map((endpoint) => `${endpoint.path} at ${endpoint.ratio}% of modeled safe capacity`).join("; ")}.</p>
      <p><strong>Relevant bottleneck patterns:</strong> ${patterns.map((pattern) => `${pattern.pattern} (${pattern.action})`).join(" ")}</p>
      <p><strong>Event-lag signals:</strong> ${eventRisks.map((event) => `${event.topic} at ${event.ratio}% safe throughput with ${money.format(event.lag)} lag`).join("; ") || "No event topic is above the default risk threshold."}</p>
      <p><strong>Confidence:</strong> ${analysis.confidence.confidence}%. This is a modeled prediction, not a replacement for performance testing. Missing data: ${analysis.confidence.missing.slice(0, 4).join("; ")}.</p>
      <p><strong>Executive recommendation:</strong> Treat the scenario as ${readiness.status === "Critical" ? "Critical" : "At Risk"} until the executive approves higher RPS targets, validates Redis hot-key behavior for account buying power, basket child-order fan-out limits, allocation fan-out/rounding controls, DB/ledger pool limits, margin-rule service capacity, PDT checks, Pub/Sub backlog, and overnight batch/SOD file windows.</p>
    </article>
  `;
}

function serviceStatusHtml(client) {
  const services = [...client.services].sort((a, b) => a.score - b.score);
  return `
    <section class="block service-status-block">
      <div class="section-title">
        <div><p class="eyebrow">Six-month RAG service status</p><h2>Lowest-readiness services first</h2></div>
        <span class="badge">Configurable thresholds</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Service</th><th>Score</th><th>Status</th><th>Primary limiter</th><th>Next action</th></tr></thead>
          <tbody>
            ${services.map((service) => `
              <tr>
                <td><strong>${service.name}</strong></td>
                <td>${service.score}</td>
                <td><span class="status-chip ${statusClass(service.status)}">${service.status}</span></td>
                <td>
                  ${escapeHtml(summarizeBottleneck(service.bottleneck))}
                  <details><summary>Details</summary>${escapeHtml(service.bottleneck)}</details>
                </td>
                <td>
                  ${escapeHtml(summarizeTarget(service.target))}
                  <details><summary>Full action</summary>${escapeHtml(service.target)}</details>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function eventRiskHtml(client) {
  const analysis = analyzeEquityArchitecture(client);
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Event-driven bottleneck signals</p><h2>Pub/Sub backlog and throughput pressure</h2></div>
        <span class="badge">${analysis.eventRisks.length} topics flagged</span>
      </div>
      <div class="event-grid">
        ${client.architecture.events.map((event) => {
          const ratio = Math.round((event.throughput / event.safe) * 100);
          const st = ratio > 95 || event.lag > 30000 ? "Critical" : ratio > 85 || event.lag > 15000 ? "At Risk" : ratio > 70 ? "Amber" : "Green";
          return `<article class="event-card">
            <span class="pill ${statusClass(st)}">${st}</span>
            <h3>${escapeHtml(event.topic)}</h3>
            <p>${money.format(event.throughput)} / ${money.format(event.safe)} msg/sec · ${money.format(event.lag)} lag</p>
            <div class="track"><span style="width:${Math.min(100, ratio)}%"></span></div>
          </article>`;
        }).join("")}
      </div>
    </section>
  `;
}

function dependencyMatrixHtml(client) {
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Dependency matrix</p><h2>Equity clearing service relationships</h2></div>
        <span class="badge">${client.dependencyMatrix.length} relationships</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>From service</th><th>To service</th><th>Dependency reason</th><th>Potential bottleneck</th></tr></thead>
          <tbody>
            ${client.dependencyMatrix.map(([from, to, reason]) => {
              const target = client.services.find((service) => service.name === to);
              return `<tr><td><strong>${escapeHtml(from)}</strong></td><td>${escapeHtml(to)}</td><td>${escapeHtml(reason)}</td><td>${escapeHtml(target ? target.bottleneck : "Dependency requires telemetry baseline")}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function endpointCatalogHtml(client) {
  return `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Endpoint catalog input</p><h2>Forecasted load vs modeled safe capacity</h2></div>
        <span class="badge">${client.endpointCatalog.length} endpoints</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Endpoint</th><th>Service</th><th>Current</th><th>Forecast</th><th>Safe</th><th>Limiter</th><th>Dependency</th></tr></thead>
          <tbody>
            ${client.endpointCatalog.map((endpoint) => `<tr><td><strong>${escapeHtml(endpoint.path)}</strong></td><td>${escapeHtml(endpoint.service)}</td><td>${endpoint.currentRps} RPS</td><td>${endpoint.forecastRps} RPS</td><td>${endpoint.safeRps} RPS</td><td>${escapeHtml(endpoint.limiter)}</td><td>${escapeHtml(endpoint.dependency)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderArchitectureInputs() {
  const client = currentClient();
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Working prototype inputs</p><h2>Dependency matrix, endpoint data, and GCP system architecture</h2></div>
        <span class="badge">Equity-only clearing model</span>
      </div>
      <form id="architecture-input-form" class="setup-form architecture-form">
        <label>System architecture JSON<textarea name="architectureJson" rows="9">${escapeHtml(JSON.stringify(client.architecture.services, null, 2))}</textarea></label>
        <label>Endpoint catalog JSON<textarea name="endpointJson" rows="9">${escapeHtml(JSON.stringify(client.endpointCatalog, null, 2))}</textarea></label>
        <label>Dependency matrix JSON<textarea name="dependencyJson" rows="9">${escapeHtml(JSON.stringify(client.dependencyMatrix, null, 2))}</textarea></label>
        <p class="muted">This prototype parses these inputs and refreshes the synthetic knowledge graph used by the bottleneck analyzer. In a production version, these would come from uploaded docs, service catalog imports, GCP metadata, Pub/Sub metrics, API gateway logs, and observability connectors.</p>
        <div class="form-actions"><button type="submit">Run bottleneck analysis from inputs</button></div>
      </form>
    </section>
    ${dependencyMatrixHtml(client)}
    ${endpointCatalogHtml(client)}
  `;
}

function renderSalesTargets() {
  const client = currentClient();
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">Sales target update</p><h2>Update ClearOne growth assumptions</h2></div>
        <span class="badge">Recalculates demo readiness</span>
      </div>
      <form id="sales-form" class="setup-form">
        <div class="form-grid">
          <label>No. of accounts expected<input name="accounts" type="number" value="${client.salesTargets.accounts}" /></label>
          <label>Trade volume expected<input name="trades" type="number" value="${client.salesTargets.trades}" /></label>
          <label>Equity trades expected<input name="equityTrades" type="number" value="${client.salesTargets.equityTrades}" /></label>
          <label>Options trades expected<input name="optionsTrades" type="number" value="${client.salesTargets.optionsTrades}" /></label>
          <label>New positions expected<input name="newPositions" type="number" value="${client.salesTargets.newPositions}" /></label>
          <label>Peak multiplier<input name="peakMultiplier" type="number" step="0.1" value="${client.salesTargets.peakMultiplier}" /></label>
        </div>
        <div class="form-actions"><button type="submit">Update forecast and readiness</button></div>
      </form>
    </section>
    ${serviceStatusHtml(client)}
  `;
}

function renderClientKnowledge() {
  const client = currentClient();
  const businessLayer = state.businessLayers.find((layer) => layer.id === "clearing-custody");
  $("#workspace").innerHTML = `
    <section class="block">
      <div class="section-title">
        <div><p class="eyebrow">ClearOne knowledge base</p><h2>Private architecture context used by RAG</h2></div>
        <span class="badge">${client.knowledgeStatus}</span>
      </div>
      <div class="rag-layout">
        ${businessLayer ? `<article class="panel wide-panel"><h3>Business domain layer</h3><p class="muted"><strong>${escapeHtml(businessLayer.name)} ${escapeHtml(businessLayer.version)}</strong> is loaded before ClearOne-specific RAG. ${escapeHtml(businessLayer.vectorDb)}</p><p class="muted">${escapeHtml(businessLayer.graph)}</p></article>` : ""}
        <article class="panel"><h3>Business context</h3><p class="muted">${escapeHtml(client.details)}</p></article>
        <article class="panel"><h3>Dependency map</h3><p class="muted">${escapeHtml(client.dependencyMap)}</p></article>
        <article class="panel"><h3>GCP platform context</h3><p class="muted">${escapeHtml(client.architecture.platform)}</p><ul class="mini-list">${client.architecture.gcpRisks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}</ul></article>
        <article class="panel"><h3>Business flows</h3><ul class="mini-list">${client.architecture.businessFlows.map((flow) => `<li>${escapeHtml(flow)}</li>`).join("")}</ul></article>
        <article class="panel wide-panel"><h3>Retrieved chunks</h3><div class="rag-chunks">${client.ragChunks.map((chunk) => `<article class="rag-chunk"><span>ClearOne vector DB</span><p>${escapeHtml(chunk)}</p></article>`).join("")}</div></article>
      </div>
    </section>
  `;
}

document.addEventListener("submit", (event) => {
  if (event.target.id === "login-form") {
    event.preventDefault();
    login($("#login-id").value.trim(), $("#login-password").value);
  }
  if (event.target.id === "business-setup-form") {
    event.preventDefault();
    buildBusinessLayer(event.target);
  }
  if (event.target.id === "setup-form") {
    event.preventDefault();
    captureSetupForm(event.target);
    if (state.setupStep === 4) submitClientSetup();
    else {
      state.setupStep += 1;
      render();
    }
  }
  if (event.target.id === "edit-client-form") {
    event.preventDefault();
    const id = event.target.dataset.clientId;
    const client = state.clients.find((item) => item.id === id);
    const data = new FormData(event.target);
    client.name = data.get("name");
    client.businessType = data.get("businessType");
    client.docs = data.get("docs");
    client.dependencyMap = data.get("dependencyMap");
    client.endpoints = data.get("endpoints");
    client.knowledgeStatus = "Knowledge graph rebuilt from latest architecture";
    renderManageClients();
  }
  if (event.target.id === "scenario-chat") {
    event.preventDefault();
    const question = $("#scenario-question").value.trim();
    if (question) renderChatResponse(question);
  }
  if (event.target.id === "sales-form") {
    event.preventDefault();
    const client = currentClient();
    const data = new FormData(event.target);
    Object.keys(client.salesTargets).forEach((key) => {
      client.salesTargets[key] = Number(data.get(key));
    });
    client.services = analyzeEquityArchitecture(client).services;
    state.view = "client-dashboard";
    render();
  }
  if (event.target.id === "architecture-input-form") {
    event.preventDefault();
    const client = currentClient();
    const data = new FormData(event.target);
    try {
      const services = JSON.parse(data.get("architectureJson"));
      const endpoints = JSON.parse(data.get("endpointJson"));
      const dependencies = JSON.parse(data.get("dependencyJson"));
      client.architecture.services = services;
      client.endpointCatalog = endpoints;
      client.architecture.endpoints = endpoints;
      client.dependencyMatrix = dependencies;
      client.architecture.dependencies = dependencies;
      client.endpoints = endpoints.map((endpoint) => endpoint.path).join(", ");
      client.dependencyMap = dependencies.map(([from, to, reason]) => `${from} -> ${to} (${reason})`).join("; ");
      client.services = analyzeEquityArchitecture(client).services;
      client.knowledgeStatus = "Knowledge graph rebuilt from architecture inputs";
      state.view = "client-dashboard";
      render();
    } catch (error) {
      alert("Could not parse one of the JSON inputs. Please check the architecture, endpoint, and dependency JSON.");
    }
  }
});

document.addEventListener("click", (event) => {
  const demo = event.target.closest("[data-demo-login]");
  if (demo) {
    if (demo.dataset.demoLogin === "admin") {
      $("#login-id").value = "admin";
      $("#login-password").value = "admin";
    } else {
      $("#login-id").value = "ClearOne";
      $("#login-password").value = "clear";
    }
  }
  const nav = event.target.closest("[data-view]");
  if (nav) {
    state.view = nav.dataset.view;
    render();
  }
  const card = event.target.closest("[data-view-card]");
  if (card) {
    state.view = card.dataset.viewCard;
    render();
  }
  if (event.target.matches("[data-setup-back]")) {
    state.setupStep = Math.max(0, state.setupStep - 1);
    render();
  }
  const edit = event.target.closest("[data-edit-client]");
  if (edit) renderManageClients(edit.dataset.editClient);
  const del = event.target.closest("[data-delete-client]");
  if (del) {
    state.clients = state.clients.filter((client) => client.id !== del.dataset.deleteClient || client.id === "ClearOne");
    renderManageClients();
  }
  if (event.target.matches("[data-cancel-edit]")) renderManageClients();
  const rebuild = event.target.closest("[data-rebuild-business-layer]");
  if (rebuild) {
    const form = $("#business-setup-form");
    if (form) {
      const reason = form.querySelector("[name='rebuildReason']");
      if (reason && !reason.value.includes("ad hoc")) reason.value = `${reason.value} — ad hoc rebuild requested`;
      buildBusinessLayer(form);
    }
  }
  if (event.target.id === "logout") logout();
});

$("#login-id").value = "ClearOne";
$("#login-password").value = "clear";

