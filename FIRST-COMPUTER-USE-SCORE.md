# First computer-use run — 10 September 2026

Status: **arrived, position and braking verified by the app**. First informal baseline, not a ranked Astra Light benchmark.

Played through native Safari computer use in a newly opened tab at `http://localhost:4174/`. No source edits, direct game APIs, state injection, reset, Undo or manual travel acceleration were used. The app's own delegated driver ran the journey. Operator had prior knowledge of the demo and build notes; this was not a blind evaluation.

| Metric | Observed result |
| --- | --- |
| Scenario | Comparison preset, 35 fuel / 15 fictional credits / 550 simulated years |
| Start | 2026-09-10 19:33:27.375 UTC, immediately before clicking Get us home. You drive. |
| Arrival first observed | 2026-09-10 19:34:23.116 UTC |
| Time to observed arrival | 55.741 seconds, including model waits and computer-use overhead; upper bound on actual completion time because observations were discrete |
| Simulated journey | 294.9 years displayed |
| Fuel spent | Approximately 19.96 including braking; ledger displays 9.987 for field placement and 9.968 for braking, rounded independently |
| Fuel remaining | 15.04 displayed in receipt |
| Fictional credits spent / remaining | 6 / 9 |
| Lifetime remaining | 255.1 years |
| Ledger entries | 22: calibration, field, 19 motion advances, final brake/verify |
| Real model usage, cost, call count | Not measured through this UI |
| Runtime model | Build note names gpt-6-astra; exact runtime identity not independently exposed/verified in this run. Do not label this Astra Light. |
| Version / seed | Not exposed in the inspected receipt; final code revision not pinned. Not yet suitable for reproducible ranked comparison. |

## Actions and outcome

1. Opened a fresh game tab and read the initial balances. The revised opening labels were visible: Preview a push and Move view, with instructions explaining direction and length.
2. Clicked Get us home. You drive. No initial push was applied; this was a score attempt rather than the full presenter script.
3. Observed the calibrated proposal at 34.169 seconds from start. It showed Bend gravity, 19.96 fuel including braking, 294.9 years ETA, and a direct correction of 45 fuel exceeding the 35 cap. Three seconds remained in the displayed execution countdown.
4. Attempted Use less fuel through its accessibility element. The computer-use action failed because the element was invalidated; refetch found multiple matching elements. The next observation showed committed flight. No fuel-saving revision was accepted and no revised quote appeared.
5. Let the original route finish. Observed “We made it,” “Braking and arrival verified,” and the receipt. Opened Inspect receipt and expanded the resource ledger to verify field and braking charges.

No human intervened during play. The external AI operator attempted a revision while the in-app AI drove, so classify this as **computer-use operator plus app driver, default route, unsuccessful revision attempt**. It is not an unassisted in-app-agent-only benchmark. Retain the attempted input in any future analysis rather than treating it as a clean no-input run.

## Demo observations

- The purpose-based opening and gravity labels are present in this served build. The initial screenshot kept the sky dominant and budgets visible.
- The proposal instruction explicitly says dragging changes the field/path/fuel and release applies it. This is clearer than “brush-only.” Actual pointer-drag behavior was not tested in this run.
- Revision timing is a practical risk: only three seconds remained when the proposal was first inspected, and the action became stale before it completed. This observation does not establish a simulation bug; it demonstrates that a presenter or slower computer-use loop can miss the window.
- Two visible Use less fuel controls were present in the proposal state, and the computer-use refetch reported multiple matches. This needs consideration in the final rehearsal and accessibility review.
- Arrival receipt and detailed accounting were inspectable. This run did not capture the field gesture visually or prove the complete audio-muted cause/effect sequence.

This completes the requested first score log. It does not replace the final integrated human-revision rehearsal or start leaderboard implementation.
