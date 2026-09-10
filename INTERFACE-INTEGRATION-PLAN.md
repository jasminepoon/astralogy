# Apply the approved control study to the core demo

User direction, 10 September 2026: the interface study looks great and must be applied to the core app, not remain a disconnected prototype. This authorizes integration into the isolated active demo. It supersedes the earlier instruction to hold study styling pending user review. Existing behavior, physics and delegation semantics remain authoritative.

## Outcome and ownership

The full unfamiliar-sky → delegation → calibration → proposed gravity edit → human fuel revision → Astra execution → arrival flow should share the study's type, button hierarchy, interaction states and visual feedback. The final pitch and recording must use this integrated application, not the specimen page at port 4182.

Application implementation remains exclusively owned by “Build 3D star position viewer” (01a08c0a-05df-7e40-9a9c-23fa22ed1a79) in `/Users/jasminepoon/src/astra-exp-brush`. Main coordinator (01a08c25-7b30-7a02-85d3-58160cc28cd0) reviews recovery/physics; rehearsal task (01a08cab-f925-7291-bcf1-0a75a88157de) records the final integrated flow after stability confirmation. This plan does not authorize another concurrent app writer or changes to the preserved original demo.

Study source: `/Users/jasminepoon/src/astra-button-prototype/astra-button-prototype`. Inspect `src/App.tsx`, `src/prototype.css`, generated `src/components/ui/button.tsx`, `src/index.css`, `components.json`, and `DESIGN-NOTES.md`.

## 1. Establish real state before applying appearance

Map the existing engine/bridge states to ready, investigating, proposal available, revising, executing/travelling, interrupted, unavailable/error, and arrived. The study's local timers, sample route curves, fixed costs and artificial arrival transitions must not be copied. In the app, state and quote identity/revision drive labels, enabled controls, selected preference and metrics.

Do not relabel a requested “Use less fuel” preference as successfully applied until a supported revised proposal exists. During revision, show acknowledgement/working state and retain the prior quote as the comparison. An unavailable or unaffordable alternative needs an honest explanation, not a success check.

## 2. Port the selected preset and reusable control variants

Preset `b5XkwJTfHs`: Radix Vega, zinc base, cyan theme, Public Sans body, Roboto Slab headings, Phosphor icons, default radius, subtle menu accent. The generated study stylesheet is the source of truth for exact preset values. Keep midnight space imagery; cyan identifies actions, not all scene content. The preset's pink chart palette does not require recoloring existing route semantics.

Use the existing vanilla app architecture. Port the required token values and a small shared button class system; reuse/copy required locally served font files and a bounded subset of properly licensed Phosphor assets with notices. A React/Tailwind migration or runtime component framework is unnecessary for this scope. If generated component CSS is extracted, isolate it to app controls so a reset does not alter canvas layout or unknown-state visibility.

Required button variants: primary filled cyan, secondary outline, supporting ghost, selected/toggle, disabled, busy, and neutral interrupt/resume. Keep focus-visible rings and native keyboard behavior. Primary actions and important touch targets should have at least 44px usable hit height. Icon-only controls require accessible names; preserve adjacent text where the meaning is consequential. Reduced-motion presentation must still communicate state.

## 3. Apply to the core surfaces, not only the delegate button

| Actual app surface | Study pattern to apply | Required live behavior |
| --- | --- | --- |
| `#budget-panel`, `#budget-fuel`, `#budget-credits`, `#budget-lifetime`, `#delegate` | Study type, spacing, input/focus treatment; one filled delegation action | Preserve visible editable caps, current balances and distinction between inventory and gross spending. Delegation state replaces repeatable launch affordance when active. |
| `#astra-strip`, `#driver-status`, `#astra-message`, `#chat-form` | Compact companion/status row and consistent action area | Display real bridge status and useful messages. Keep chat input working. Busy state must not block interruption. |
| `#less-fuel` and supported preference controls | Outline revision button; pending/selected treatment | Request changes through the real bridge; update preference, quote, path and total cost together on accepted revision. No fabricated savings. Preserve a pre-commit revision opportunity. |
| `#outcome-card`, `#outcome-metrics`, `#outcome-actions`, `#execution-notice` | One contextual proposal card with clear metric hierarchy and the same button variants | All dynamically generated actions use the shared styles. Preview/committed states are explicit. Include braking, ETA, remaining budget and any binding constraint from current quote. Keep the original path visible for comparison. |
| `#interrupt` and dynamically rendered Continue/Resume | Neutral outline Interrupt; primary Resume when paused | Interrupt immediately invalidates pending execution. Resume stays within the existing authority. Do not use destructive red for normal pausing or imply paused work is still running. |
| `#brush-mode`, `#look-mode`, `#recenter`, `#undo` | Compact selected tool group; ghost support actions | Preserve pointer semantics and `aria-pressed`. Undo availability follows the actual snapshot; its text explains full-scenario rewind. Recenter does not move the ship. |
| `#gravity-handle`, `#handle-hint`, path legend | Compatible cyan/focus/selected visual language, with state cues on the canvas | Keep the handle a real spatial control. Preserve quoted release semantics and the shared human/Astra action path; show its preview and execution. Do not replace the gesture with a generic settings panel. |
| `#details-toggle`, `#detail-drawer`, close/export/reset controls | Quiet secondary/ghost controls and consistent typography | Details and ledger remain accessible. Reset is visually separate from primary journey action; keep original/comparison navigation available outside the pitch's main focus. |
| Arrival state and receipt | Same type/control language; world and Earth image dominate | Show actual arrival/braking receipt. Retain a quiet restart/replay action. Never borrow the study's timed arrival trigger. |

## 4. Preserve the approved autonomous flow

The specimen's “Apply field” exists to exercise a primary button. It does NOT imply an extra mandatory confirmation in the delegated run. After “Get us home. You drive.”, Astra can execute within the granted cap after the existing interruptible preview. A user-operated preview may expose Apply where the current app already supports it.

Use one visually dominant next action per stage. Do not display a bright delegate action, bright apply action and bright resume action simultaneously. Use a filled action for a decision the human can currently take, and a quieter labelled working state while Astra is acting. Interrupt remains reachable. A persistent displayed progress state is not a new approval request.

Keep the scene, current position, camera and user stroke continuous across stages. The change in knowledge and action is the story; the UI should not switch to an unrelated dashboard. Preserve the fuel/budget panel the user likes. Do not copy the prototype's specimen sidebar, preset labels, stage selector, sample-data banners or explanatory design copy into the product.

## 5. Integrate in two reviewable passes

Pass A — shared tokens and controls: apply fonts, semantic colors, radii, variant classes, focus states and icon sizing to static AND dynamically generated controls. Preserve IDs/handlers and validate no interaction regression.

Pass B — state and composition: align the budget, proposal card and Astra strip; ensure before/after route, graphical handle, quote metrics and revision action can be seen together. Check ready, busy, revised, executing, interrupted, rejected/unavailable and arrived states. Avoid decorative polishing that hides the cause-and-effect sequence.

Do not restart the implementation or delay current correctness fixes. Incorporate these passes before declaring the final pitch build ready. If the ongoing browser run is already in progress, finish its diagnostic evidence first, then apply this visual pass and refresh the readiness declaration.

## 6. Final verification and handoff

Use `DEMO-RUNTHROUGH.md` for the actual presenter sequence. The final rehearsal must run on the integrated build with live Astra and real quotes. A previous run remains useful evidence, but its screenshots cannot prove the newly integrated UI.

Acceptance checks:

- Same recognizable preset and hierarchy across delegation, proposal/revision, interrupt/resume, canvas tools, budget inputs and arrival—not a single reskinned CTA.
- Before calibration, no unsupported home direction. After calibration, the displayed cost/constraint is computed, including braking.
- The human's fuel correction is possible before commitment, changes the actual proposal, and visibly updates route/metrics. New selected state cannot be stale or fabricated.
- Astra's field gesture is legible with audio muted; the real ship follows the predicted result. Preview and commit remain distinguishable.
- No duplicate requests or debits from repeated clicks, no stale quote enabled after change, and no loss of keyboard access/focus indication. Busy animation does not disable Interrupt.
- Actual post-edit Undo and pause/resume work and preserve their documented accounting/authority semantics.
- Desktop and narrow layouts keep consequential controls reachable without obscuring the main gesture. Generated surround cannot intercept input or overlap essential UI.
- Optional mining and evidence controls adopt consistent style but remain outside the short primary pitch; preserve their corrected calculations.
- Final receipt comes from the engine. Capture a final revised-proposal state, a real execution state, and arrival, plus the complete timed run if supported.

Handoff should state integrated build URL/revision, surfaces completed, relevant checks, final recording/evidence paths and any material limitation. Do not call the interface integrated merely because the standalone study builds or looks good.
