# Demo priority: explain the gravity interaction; benchmark later

User direction, 10 September 2026: delegate the brush fix first for a compelling demo. Document the AI-only leaderboard as a later stretch goal. This order supplements `DEMO-RUNTHROUGH.md` and `INTERFACE-INTEGRATION-PLAN.md`.

## 1. Make the interaction's purpose visible now

The existing application owner, “Build 3D star position viewer” (01a08c0a-05df-7e40-9a9c-23fa22ed1a79), owns this change in the isolated comparison app. Keep one app writer and fold this into the ongoing interface integration before final rehearsal.

The approved main interaction reshapes a bounded fictional gravity field: move its glowing handle, see the predicted trajectory and cost change, then let the ship follow the computed motion toward home. “Brush-only” and “Brush” describe an input technique without explaining its purpose. This is more than a copy change: the visible control, instruction and actual effect must agree.

Implementation sequence:

1. Inspect the current rendered preview and actual pointer handlers. Identify which control previews a ship impulse and which edits the gravity field. Do not label an impulse control “Bend gravity.”
2. Make the gravity edit the clear centerpiece after calibration. Suggested label: **Bend gravity**. Suggested contextual instruction: **Drag the glowing handle to bend your route home. Watch the path and fuel estimate change.** Use this only when the handle and home direction are actually available.
3. Before calibration, retain a meaningful free preview with an accurate instruction. If it remains an impulse gesture, label it **Preview a push** and explain that its direction and length change the proposed push; do not imply a known home bearing. Camera movement remains separately labelled.
4. Remove ambiguous “brush-only” or implementation-comparison copy from the main pitch surface. Update visible hints, tooltips, accessible names and dynamic state text consistently. Preserve the distinction between preview, commitment and travel; do not introduce another permission step into existing delegation.
5. Keep original and revised paths, the real handle, field response and computed total fuel/ETA visible together. The human and Astra must use the same validated field edit. Preserve the pre-commit “Use less fuel” opportunity and real budget/accounting rules.
6. Verify the integrated browser flow with audio muted: a viewer can identify what to drag, what physical proposal it changes, why that helps reach home, and whether it has been applied. Record the revised proposal, real execution and verified arrival. Report any mismatch between the intended gesture and implemented behavior rather than covering it with copy.

Completion evidence: updated build URL/revision, before/after wording, confirmed gesture semantics, screenshots or recording of the causal sequence, and relevant interaction checks. Rehearse the live run only after these changes are integrated.

## 2. Follow-up approved after the first computer-use run

The user approved these demo refinements after reviewing `FIRST-COMPUTER-USE-SCORE.md`. Implement with the existing app owner before final rehearsal:

1. Give the proposal enough time to read the handle, route, full-trip fuel and ETA together. Use a provisional 20-second interruptible preview rather than the documented 12 seconds, then tune from an actual rehearsal. Start the countdown only when the complete proposal is rendered and actionable. Keep the existing ability to execute sooner; do not add a mandatory confirmation to delegated execution. A revision request must immediately cancel the pending commit and give the accepted revised proposal a fresh inspection interval. Preserve stale-action and exactly-once protections.
2. Render one visible **Use less fuel** action at a time. During a proposal, put it beside the proposal's route/cost comparison; elsewhere it may live in the companion area when meaningful. Share the real handler and pending/accepted state, retain keyboard access, and avoid duplicate accessible targets. Do not claim a requested revision has succeeded until a valid revised quote exists.
3. Make the actual handle movement and early field response legible before accelerated coasting. Keep the camera stable and the original path visible. Lengthen presentation of the real integrated motion as needed; do not insert a decorative route animation, hidden impulse or altered accounting. Reduced-motion users still need clear state and outcome cues.
4. Verify through a dedicated browser run: inspect initial proposal, successfully request less fuel before commitment, observe changed handle/path/fuel/ETA, observe real field execution and then verified arrival. Measure preview and wall-clock timing. Include an audio-muted inspection of the causal sequence and a stale/repeated-input check appropriate to any timing changes.

The 20-second interval is an implementation starting point, not a user-specified duration or a measured optimum. Keep the first score intact; save the new rehearsal separately. Return actual URL/revision, timing, evidence and any limitations.

## 3. Approved comparison-preset experiment

User approved testing **22 fuel / 15 fictional credits / 500 simulated years**, with matching delegated caps, after the pacing refinements. Apply to the dedicated comparison preset only. Recompute and verify both complete routes including braking: previous outcomes suggest fast ~19.96 fuel / 294.9 years and economical ~14.72 fuel / 471.5 years. Both must remain valid. Preserve random defaults and the original score. Coordinate with the rehearsal owner before changing an active run.

The intended choice is fuel remaining versus lifetime remaining. Unused fuel currently has limited demonstrated value after arrival; do not invent hazards or future costs to justify it. Present this as the person's preference among feasible outcomes, not proof that the slower route is universally better.

## 4. Later stretch: AI-only Astra Light leaderboard

Documented backlog only. Do not build the leaderboard or begin benchmark runs before the core demo and final rehearsal are complete.

Goal: measure how effectively Astra Light gets home without human assistance, both on the fixed demo problem and when spawned in a random area.

- Separate fixed-scenario and random-spawn tracks. Store reproducible seeds, scenario/engine version, starting resources, model identifier/settings, allowed actions and objective. Use the same seed suite for comparisons; do not expose hidden starting information to the agent.
- Start real elapsed timing when the run is launched, including calibration, model waits, actions and travel presentation. Record simulated journey time separately, with presentation acceleration/settings recorded for comparability.
- Record gross fuel spent, net resources remaining, fictional game credits, real model usage/cost when available, model calls, actions, success/failure and timeout. Mark unavailable real usage as unavailable; never substitute game credits.
- Rank fastest verified completion and lowest resource use separately under declared constraints. Avoid an arbitrary combined score until its tradeoffs are specified.
- Across random seeds report success rate and time/resource distributions, including failed and timed-out attempts. A lucky successful run alone is not evidence of general performance.
- Arrival must pass the engine's position and braking checks. Keep a run record with action history, quotes, resource ledger, final receipt and replay information. Human intervention disqualifies an AI-only entry or moves it to a separate assisted category.
- Build timing and provenance capture first, a small repeatable evaluation second, and a leaderboard display last. Do not invent results or present engine-only runs as live model runs.

Readiness gate for starting this stretch: the core gravity interaction is clear, the live proposal → human revision → execution → arrival demonstration works, and its measured rehearsal evidence is saved.
