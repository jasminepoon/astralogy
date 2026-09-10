# Astra bends gravity: demo build and rehearsal brief

User-approved direction, 10 September 2026. This brief specifies the focused hackathon demonstration. It narrows the presentation, not the whole application's capabilities. Timing below is a rehearsal target, not a verified event submission limit.

## What the audience should understand

One environment becomes more understandable and controllable through Astra. The human makes an uninformed but reversible attempt; Astra finds the relevant evidence, proposes an affordable field edit, accepts a human priority change, and acts visibly in the same workspace. The resulting flight follows the computed physics and reaches home within the chosen budget.

Suggested presenter introduction: “We built this interactive space with Astra. Now live Astra can use its controls with us: find where we are, reshape a fictional gravity field, and get us home within a budget.”

Distinguish build-time assistance from runtime agency. Runtime Astra selects and operates supported, validated controls; do not suggest it generates a new physics tool or edits source live unless a separate real demonstration actually does so. Describe gravity manipulation as the sandbox's fictional power. The engine computes outcomes; model narration does not establish success.

## The primary run: about two to three minutes, subject to measured latency

| Beat | Presenter / human | Required visible result | Target presentation time |
| --- | --- | --- | --- |
| 1. Unfamiliar sky | “I can act, but I don't yet know the way home.” Drag one free brush preview. | Immersive sky, ship, attempted stroke and quoted cost; home bearing remains unknown. No debit or forced bad move. | 10 seconds |
| 2. Delegate and locate | “Astra, get us home. You drive.” Use the existing budget controls. | Live Astra receives delegation and performs calibration. Supported evidence and home direction appear in the same scene. Waiting state is clear. | 20–35 seconds plus measured model latency |
| 3. Establish the constraint | Briefly point to the direct route and budget. | After calibration only: computed direct correction including braking exceeds available fuel or delegated cap, identified accurately. Show which constraint binds. | 5–10 seconds |
| 4. Propose the graphical edit | Let Astra propose the gravity route. | Original path stays faint; proposed route, handle, field response, total fuel including braking, ETA and remaining budget are legible together. Preview is clearly distinct from commitment. | 10–15 seconds |
| 5. Human revision | “Use less fuel.” Send before the field is committed. | Live Astra changes its proposal; old and revised costs/ETAs are numerically comparable from the same starting state. Handle/trajectory visibly change. Show the time tradeoff. | 15–25 seconds plus measured model latency |
| 6. Astra acts | Let Astra execute under existing delegation. | A visible on-scene handle gesture commits the same validated action representation the human can use. Dust, force field and predicted path agree. Camera stays fixed during the edit. | 10 seconds |
| 7. Travel and brake | “The ship follows the environment we changed.” | Actual integrated travel follows prediction, field expires without hidden velocity correction, resources update, final braking is charged. Presentation acceleration may shorten waiting without skipping simulated accounting. | 20–40 seconds |
| 8. Home | Let the world dominate the ending. | Earth plate appears only after verified arrival and braking. Small receipt: fuel spent, elapsed simulated years, resources remaining. | 5–10 seconds |

Allow extra time for live model calls; do not promise the target duration until timed. If the actual UI currently commits before the human can revise, add a clear interruptible preview opportunity inside delegation rather than another permission form. Astra dialogue should reflect the actual quote; presenter lines are cues, not required fixed model output.

The “Astra bends gravity → use less fuel” story is a proposal/revision/commit sequence: the first bend may be a preview. Do not spend resources and then silently roll back to manufacture a same-state comparison. If demonstrating a correction after commitment instead, explicitly use full-scenario Undo and show what it restores; keep that alternate path out of the short primary run.

## Build priorities and ownership

Latest priority: complete the gravity-interaction clarity pass in `DEMO-PRIORITIES.md` before final rehearsal. The AI-only Astra Light leaderboard is documented there as a later stretch goal, not part of the current demo build.

Existing application owner: task “Build 3D star position viewer” (01a08c0a-05df-7e40-9a9c-23fa22ed1a79), isolated checkout `/Users/jasminepoon/src/astra-exp-brush`. Keep a single writer for application and engine changes.

Main coordination and independent verification: task “Adapt relativistic travel concept” (01a08c25-7b30-7a02-85d3-58160cc28cd0). Coordinate checks against a stable build; avoid running UI tests in a browser tab the implementation owner is using.

This side conversation owns the present brief and generated asset handoff, not concurrent application edits.

1. Finish the core sequence above, including a reliable pre-commit opportunity for “Use less fuel.” Keep mining optional and outside the primary run; it must not be required to understand or complete the main demonstration.
2. Verify the four signals are simultaneously visible during the edit: original path, changed handle, changed trajectory, changed fuel estimate. The action should be understandable with audio muted.
3. Integrate existing assets without replacing live stars or controls. Preserve fuel/budget panel. Check foreground overlap, input interception, narrow layout, reduced motion and readable contrast.
4. Rehearse on the stable build with actual live Astra and record timings, measured quotes, arrival evidence and any recovery. Fix failures within the existing scope.
5. Produce a short presenter-ready launch/reset checklist and a local recording if capture is available. Do not publish or claim the local bridge works through the old static URL.

## Definition of ready

- One complete live run reaches home after the human's fuel revision, with no manual state patching, hidden teleport, hidden corrective impulse, or mocked response labelled live.
- Before calibration, neither UI nor model-facing observation reveals unsupported home direction/location. Free preview has no resource debit.
- Original/revised route comparisons use the same position, velocity, time and relevant force state. Actual quote totals include braking and respect both resource balances and delegated gross-spending caps.
- Human and Astra use the same field-edit semantics. The displayed gesture corresponds to the chosen quote; it is not disconnected decorative animation.
- Force commit preserves instantaneous velocity; integrated flight matches prediction; field expiry preserves resulting velocity. Arrival checks distance AND speed.
- A visibly adverse handle change worsens the predicted result or is clearly rejected. Not every gesture magically succeeds.
- Undo restores the whole promised scenario state and pauses execution. Interrupt invalidates pending work; stale/failed calls cannot spend or duplicate actions. These recovery checks may be rehearsed separately from the short run.
- Revised fuel use and ETA genuinely differ; claims of savings include the relevant full trip costs. Remaining lifetime is sufficient.
- Window/dust assets do not mask controls or invent calibration evidence. The Earth image is gated on verified arrival.
- Record actual wall-clock duration including model waiting. Capture evidence of the key action and final receipt. Clearly distinguish an edited recording from an uninterrupted live run.

## Known evidence and remaining uncertainty

As of this brief, main-thread independent engine checks report direct-to-home field routes at both tested speeds reaching home and braking, consistent prediction/flight, and passing Undo/invalid-drag checks. Reported focused-preset examples were approximately 14.7 fuel / 471 years for the slower route versus 20 fuel / 295 years for the faster route. These are reported engine results, not a completed UI rehearsal, and should be re-read from the actual final build instead of hardcoded into narration.

The optional mining branch had a reported mismatch between its displayed onward-cost assumption and the field-based onward route, plus a faster-detour delegated-budget constraint. Keep it out of the primary run. The owner must resolve or clearly constrain that branch before presenting it as a verified alternative; do not loosen budget rules to hide the problem.

Live latency, the complete graphical proposal/revision/commit sequence, current asset composition, and recording readiness remain to be checked on the final build.

## Presenter setup and fallback

Before rehearsal: use the new isolated build's verified URL, verify local bridge/model authentication, reset the comparison preset, check displayed fuel/credits/lifetime caps, choose a legible desktop viewport, and close the details drawer. Preserve the original demo for comparison. Do not reset another person's active session.

If the bridge is unavailable: pause and show a clearly labelled previously recorded run if available. Do not substitute scripted responses as live Astra. If live waiting exceeds the presentation slot, explain the wait or use a labelled edited recording. Presentation time controls can skip waiting only while preserving actual simulated travel and accounting.

## Supporting deliverables

- Asset files, exact generation prompts and usage notes: `/Users/jasminepoon/src/astra-exp/output/imagegen/immersion-v1/README.md` and sibling files.
- Existing storyboard/handoff: `/Users/jasminepoon/src/astralogy/brush-first-interface-handoff.md` and referenced storyboard images. Images guide atmosphere, not authoritative geometry, labels or extra props.
- Development provenance: `/Users/jasminepoon/src/astra-exp/DEVELOPMENT-PROVENANCE.md`. Keep baseline versus new work clear. Event dates, eligible work, required format and public submission destinations remain unverified; this brief does not assert specific event rules.
- Rehearsal record to create after execution: final build revision, verified launch URL, preset, wall-clock timings, actual before/after quotes, live-model evidence, arrival receipt, recording path if produced, and unresolved issues. Do not mark this complete from engine tests alone.
