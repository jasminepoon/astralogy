# The way home — integrated local demo

10 September 2026. Isolated branch `brush-first-demo`, served on http://localhost:4174. The original checkout and running comparison at port 4173 are separate. Nothing is deployed.

## Run

Run `python3 server.py` in this checkout. `STELLAR_PORT` overrides the default 4174. Local Codex authentication and access to `gpt-6-astra` are required; model latency varies.

1. Choose **Preview a push**, then drag outward from the ship to retain a free, bounded vector impulse preview. No home direction or source identity is available before calibration.
2. Select **Get us home. You drive.** The visible caps are 35 fuel, 15 fictional credits, 550 simulated years. Astra performs the six-credit calibration and proposes a direct-home gravity edit.
3. During its twelve-second preview select **Use less fuel**. The shared handle and route change, with fuel and ETA shown before and after. The original human stroke remains a same-state reference.
4. Astra visibly moves and releases the same handle available to the human. The ship then travels under the edited force, coasts after expiry, and explicitly brakes. Arrival requires both position and speed checks.
5. **Interrupt** invalidates pending replies and actions. **Undo field edit** restores the complete pre-field physical state, ledger, resources and time, then pauses. **Reset same sky** starts again.

Mining is optional and excluded from the primary prompt. Evidence & ledger includes original random runs, the synthetic measurement explanation and JSON export. Full optional mining plans reserve the exact slow direct onward leg, including extraction costs and lifetime.

## Physics and provenance

The 5,044 catalogue directions are rendered as anonymous ship-frame bearings against decorative image layers. Synthetic depths and measured correspondences determine position and attitude only after calibration. The server accepts only a strict public observation envelope. No hidden position or identity is sent before calibration.

The graphical field is a bounded harmonic acceleration `a = center - position`, active within 0.3 light-years of its origin for pi/2 years, with center offset capped at 0.1 light-years. Field placement costs `6 + 100 × offset` fuel. Committing the edit changes the force without changing velocity. Integration uses fixed global 1/512-year ticks, splits expiry exactly, and then coasts inertially. Preview, tracers and actual flight use the same force function. Numerical shooting chooses the guided center; dragging off the guide changes the actual center and may produce a rejected miss. Repeated Apply uses that displayed center, without silently repairing it.

This is an explicitly synthetic demonstrator, not realistic interstellar engineering. Decorative cockpit, dust, wisp and arrival images are in `dist/assets/immersion/`, alongside their provenance and prompts. They do not supply scientific observations. Earth appears only after verified arrival. The preserved observatory remains at `/atelier.html`; its original build record is `JOURNEY-ORIGINAL-BUILD.md`.

## Validation

- 34 JavaScript tests and 17 Python boundary tests pass.
- Additional coverage verifies the harmonic oracle, expiry, dt/2 convergence, preview/flight parity, same-state brush comparison, malformed/stale/replayed quotes, unaffordable edits, full-state Undo and exact optional mining accounting.
- Independent engine comparison: balanced field plus brake costs 19.9558 fuel and takes 294.8897 years; slower version costs 14.7224 fuel and takes 471.481 years. Both reach home. Direct correction plus braking exceeds the 35-fuel cap.
- Actual live browser runs completed both balanced and human-revised direct-home journeys. Revised receipt: 471.5 years traveled, 20.28 fuel, 9 credits and 78.5 years remaining. Before commitment the visible comparison changed 19.96 → 14.72 fuel and 294.9 → 471.5 years.
- Browser inspection covered the full starfield, shared control, separate budget form and persistent top resource totals. Independent rehearsal and adverse UI checks are recorded separately when complete.

## Approved interface integration

The selected Radix Vega zinc/cyan preset now covers budget fields and delegation, Astra status/chat, all dynamically generated proposal actions, pending/accepted fuel revisions, neutral Interrupt, primary Resume, selected Preview a push / Move view tools, Recenter/Undo, field handle cues, details and arrival receipt. Exact tokens, locally served Public Sans / Roboto Slab fonts and a bounded Phosphor subset are documented in `dist/assets/controls/README.md` with licenses. No runtime framework migration or prototype sample state was introduced.

Before calibration the gesture is accurately called **Preview a push**. After calibration **Bend gravity** identifies the separate glowing field handle; its guidance describes path/cost change and release-to-apply. The model prompt uses the same purpose-based vocabulary. A supported computed revision drives the selected state; pending requests and errors do not fabricate acceptance. Interrupt and important actions have at least 44-pixel height. There is one primary Resume while paused; delegated execution introduces no new confirmation gate.

Integrated browser checks: a live revised route completed at the expected 471.5 years after a recoverable pre-commit request rejection; a later restored-state live revision completed without errors. A separate fresh WebKit run caught the human revision before commitment and paused on its genuine lower-cost proposal for responsive inspection. These diagnostic runs do not replace the final uninterrupted timed rehearsal.

The 1280×720 inspection found and corrected clipped quote metrics; compact cards retain fuel, ETA and the binding constraint. The 390×844 layout and reduced-motion ready state were rendered and inspected. Narrow field labels were adjusted to avoid the home label and viewport edge. Local diagnostic images are in `output/playwright/` (ignored by git). Full-scenario Undo restored 35 fuel, 9 credits and 550 years after the field journey, retaining the paid calibration. Arrival artwork is removed immediately by Undo/reset.

Final rehearsal and independent adverse/recovery checks are coordinated against the committed integrated build; their final evidence is maintained by the rehearsal task. The AI-only leaderboard remains a documented future stretch; no benchmark or leaderboard was built.
