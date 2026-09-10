# Local validation — 10 September 2026

Local preview: http://localhost:4173 · run with `python3 server.py`.

## Actual live model runs

These were live `gpt-6-astra` calls through the existing Codex ChatGPT login, not fixtures or fallback narration. Results vary across requests.

| Request | Astra latency | Verified outcome | Retained negative probe |
|---|---:|---|---|
| Widest excursion returning within 10 years | 15.03 s | factor 1.1234; max separation 6.841 AU; observed return 9.977 yr | factor 1.125: analytically bound, no return observed before deadline |
| Bring them back within eight years | 14.40 s | factor 1.0692; max separation 5.337 AU; observed return 7.975 yr | factor 1.071: analytically bound, no return observed before deadline |
| Return within five years with masses/pericenter fixed | 12.66 s | Explicitly infeasible; circular reference alone takes 6.325 yr | All three proposed small excursions retained without observed returns |

Full exported records are local artifacts in `output/validation/live-10-to-8-years.json` and `output/validation/live-five-year-infeasible.json` (ignored by Git). They retain actual request state, public model response, inputs, numerical settings, sampled paths, outcomes and selections. No credentials are present. The coordinating task independently reproduced the 10→8-year loop and play/revert with separate live calls.

## Checks completed

- **14 numerical tests passed:** existing sky fixtures/circular conservation; eccentric analytic periapsis/period/angular momentum; JSON snapshot replay and branch independence; escaping and unresolved close passages; 8/10/12-year return fixtures; no instant/circular/half-orbit false return; near-deadline unresolved status; fixed-family five-year infeasibility; nonfinite timestep rejection.
- **9 bridge tests passed:** request/output bounds and nonfinite rejection, history/snapshot validation, origin restrictions, malformed/oversized requests, busy/unavailable responses, and request/revision echo. These isolate model inference rather than spending live calls for each error case.
- **Desktop 1440×900:** actual live proposals, baseline/candidate paths, retained failures, eight-year correction, candidate selection. Coordinating task additionally verified live play/revert.
- **Mobile 390×844:** controls drawer, manual noncircular comparison, play/pause, save→reset→load (0.15 years and 5.50-year period restored), five-year live request, and pointer-drag painting. Camera framing keeps the bodies above the bottom interaction panel.
- **Stale live response:** changed outcome during an actual model call; the result was discarded and did not add a candidate.
- **Unavailable connection:** stopped the local backend, submitted through the UI, and observed “Astra unavailable … No substitute proposal was used.” Restarted the backend afterward.

## Limits

This is a bounded local demonstration, not independent validation of new physical laws or measured research benefit. Return-event interpolation carries finite-step uncertainty; near-deadline candidates remain unresolved. A finite history is retained in browser memory until exported, and snapshot restoration validates structure and supported initial settings rather than authenticating an externally supplied current state against a full independent replay. Paint is artistic, not replayable, and excluded from numerical evidence. No public repository, hosted live backend, or public screen/audio demo is included in this local delivery.
