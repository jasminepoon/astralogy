# One-minute showcase QA — 10 September 2026

Production candidate: e33ef1d, http://localhost:4174/. Dedicated 1440 × 900 browser session. Actual pointer and button interactions; live Astra requests. No production source edits in this review.

## Verified so far

- Default Plan, actual catalogue star clicked at viewport (952,480): selection opened. Identify spent exactly 1 credit and revealed HIP 60718 / Crux, with its catalogue reference. Resources 22 / 14 / 500.
- Locate ourselves: live planning calibrated and proposed gravity-home. Total identification plus calibration was 6 credits; resources 22 / 9 / 500. Proposal 19.96 fuel / 294.9 years.
- Human dragged the gravity handle 35 pixels right: proposal changed to 17.76 fuel / 349.9 years. Resources stayed 22 / 9 / 500 in Plan.
- Use less fuel: live Astra revised that proposal to 14.72 fuel / 471.5 years. Displayed comparison against fixed original: 5.23 fuel saved / 176.6 extra years. No movement commitment.
- Astra, take the helm: live Astra retained the economical preference, displayed the countdown and applied the field. Fuel became 13.5 before later braking. Arrival check follows below when complete.

## Recording priorities

1. P1 — Make selection discoverable in the connected root, not only the locate replay. The opening says Try a push twice and provides no star-selection hint. Actual star clicking works, but Move view handles all clicks as camera gestures, the ship hit region takes priority, and decorative lights are not catalogue objects. Add a clearly named Select a light mode or reuse the existing Select a bright light helper in the opening. Highlight selectable targets on hover and explicitly distinguish camera drag. Preserve opaque observation-token binding and paid identification. Retest real click plus camera/push controls.
2. P1 — Remove the unconditional preserved-push-reference assumption from the takeHelm request when no push exists. In this star-first flow Astra visibly says the preserved push comparison was not supplied. Generate that request clause only when game.attempt() exists; this is a presentation defect, not a failed route.
3. P2 — Reduce duplicated opening and proposal narration; preserve Plan/Drive, release charge, route comparison and resource bars. Defer cosmetic restructuring until after recording.

Immediate recording workaround: default Plan plus Preview a push selected, click a real bright catalogue point outside the ship ring. At the tested 1440 × 900 initial view, (952,480) selected HIP 60718. Coordinates are viewport-specific. The locate replay also offers Select a bright light, but is a separate replay and must not be presented as the same uninterrupted journey.

## Complete connected result

The same star-first session reached Home. UI explicitly reported position and speed passed the arrival check. Displayed balances: 7.3 fuel / 9 credits / 28.5 years. No reset, manual Apply or recovery was used. Screenshots: output/showcase-qa-revised.png and output/showcase-qa-arrival.png. All six proposed showcase steps were exercised in this one session. This confirms functionality; selection discoverability and the absent-push narration issue remain.
