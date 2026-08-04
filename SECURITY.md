# Scalix Public Demo Security

## Public GitHub Pages modes

- **Deterministic mode** is the default. It requires no API key and makes no model call.
- **Analysis mode (BYOK)** is optional. A visitor may enter their own OpenAI project API key to run the analyst and reviewer against Scalix's synthetic ClearOne evidence package.
- Scalix keeps the BYOK value in `sessionStorage`, not source code or GitHub. It is cleared when the tab session ends or when the visitor selects **Disconnect key**.
- The key is sent directly from the visitor's browser to `https://api.openai.com/v1/responses`. Scalix has no hosted backend on GitHub Pages and does not receive or log the value.
- Model requests use `store: false`. Deterministic ACRS remains the source of truth, model output is validated locally, and production actions remain disabled.

## Important limitation

OpenAI's production guidance recommends that API keys never be used in client-side browser environments and that API requests be routed through a backend. Public BYOK exists only to demonstrate the capstone's live analyst/reviewer loop. It is not the recommended design for a customer or production launch.

For this capstone mode, visitors should use only a temporary, restricted project key with a low spending limit, avoid entering proprietary or regulated data, disconnect the key immediately after the demo, and rotate or delete the key afterward.

## Additional controls in this repository

- No API key is committed or embedded in the public files.
- React and ReactDOM are vendored locally; the page does not execute a third-party CDN script.
- A Content Security Policy limits scripts to this site and network connections to this site plus the OpenAI API.
- ClearOne architecture, telemetry, sales, and scenario data are synthetic.
- Every recommendation remains behind an Executive approval, edit, reject, or escalation gate.

## Production design

A production deployment should disable browser BYOK and route model requests through an authenticated backend using a server-side secret manager, least-privilege project keys, tenant isolation, rate limits, audit logs, redaction, retention controls, and formal privacy/security/model-risk review.
