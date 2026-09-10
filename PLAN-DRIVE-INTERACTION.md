# Plan and Drive: one clear action boundary

User approved proposal and implementation, 10 September 2026. Implement with the existing app owner in the isolated comparison build. Preserve the completed dd9e9c0 build/recording as the prior version; do not overwrite the first score or its evidence. This supersedes ambiguous mixed release semantics and integrates the hierarchy/copy decisions below. No rename, random-spawn expansion or leaderboard implementation is included.

## Decision

Use **Plan / Drive** to distinguish exploring consequences from changing the current journey. Both are simulations; avoid treating “simulation” and “real flight” as opposing worlds. A gravity drag reshapes a force field, not a directly steerable ship or an arbitrary path that must succeed.

Default to Plan. Present one prominent next action. Keep the scene and budget continuous across modes. Keep camera movement separately named Move view; it never edits physics. Display who has the helm separately and quietly: You or Astra. Selecting Drive does not itself delegate control to Astra.

## Interaction contract

| Action | Plan | Drive |
| --- | --- | --- |
| Drag ship push or gravity handle | Update a free hypothetical proposal, path and quote | Update a pre-release proposal and quote against current state |
| Release gesture | Retain preview; no physical commitment or fuel debit | Commit that valid quoted push/field exactly once; show the immediate charge before release |
| Ship / time | Solid ship remains at the current state; predicted ghost/path is separate; no journey-time advance | Solid ship follows actual integrated state; resource and time accounting advance normally |
| Astra assistance | Investigate within displayed credit budget and propose/revise; stop before movement commitment | Execute only after explicit take-helm/resume instruction within existing budget |
| Invalid or unaffordable action | Explain rejection and preserve current journey | Reject without spending; never silently repair the gesture into a valid route |

Calibration is an explicitly priced investigation, not a free physics preview. **Help me plan · 6 credits** may establish location; no unsupported home bearing is exposed beforehand. Keep Plan's physical-action restriction separate from hypothetical affordability so meaningful route quotes can still be computed against the selected trip budget.

Use a shared enforcement point for all supported action paths, including model replies, scheduled commits, early-apply actions, pointer/keyboard releases and chat. Model wording cannot grant execution authority. Plan must not execute fuel-spending or time-advancing actions merely because an older message says “continue driving.”

## Transition rules

- **Apply & fly** in Plan commits the displayed valid proposal and enters Drive. It applies a reviewed action; it does not silently grant Astra additional authority. Show immediate debit and total expected trip cost including braking distinctly.
- **Astra, take the helm** explicitly enters Drive and delegates execution within the displayed budget. This preserves the existing direct “Get us home. You drive.” path for people who want to skip planning. Do not require another approval for each routine step.
- Choosing **Drive** alone changes subsequent gesture behavior, without committing a retained preview or silently resuming an old Astra sequence.
- Choosing **Plan** during driving first pauses at the current physical checkpoint and invalidates pending replies, gestures and commits. Keep the actual accumulated time, position, velocity and spending; no hidden rewind. Retain useful evidence/history and regenerate any proposal invalidated by the new state.
- **Interrupt** pauses execution and invalidates pending actions as before. **Undo** remains an explicit full-scenario restoration, separate from changing mode.
- On mode change mid-drag, cancel that drag; release must not unexpectedly adopt the new mode. On Drive release, revalidate the displayed quote against the current state. A stale quote is rejected, not replaced by an unreviewed charge.
- While a person is dragging, prevent concurrent automatic advancement/commit from invalidating the control beneath them. Preserve the current valid starting state or visibly pause and re-quote. Never spend two competing actions.

## Visual hierarchy and concise copy

1. Persistent mode switch near the manipulation tools: **Plan | Drive**. State is communicated by text and selected styling, not color alone.
2. One recommended next action near the scene. Opening Plan cue: **Try a push** with **Free preview · ship stays here**. Offer quieter **Help me plan · 6 credits** and an explicit route to **Astra, take the helm**; do not make experimentation mandatory.
3. Planning proposal: one short recommendation explaining why the field helps, a ghost route, and fuel/time consequences. Example for this preset only: **Direct push: 45 fuel. Available: 22. Try bending gravity.** Render computed values, not fixed claims.
4. Beside the active handle, show mode-specific release semantics: **Release to keep preview** versus **Release to apply · [immediate charge] fuel**. The proposal summary separately includes total trip fuel and braking. The selected field handle must visibly drive the prediction.
5. Keep the actual ship solid and its current location stable during planning. Predicted ship/path is ghosted and labelled **Preview**. During actual journey advancement label **Driving** and use the solid ship. Reduced motion must preserve this distinction.
6. Preserve one **Use less fuel** action adjacent to the quote. In Plan it revises and stays in Plan; in delegated Drive it interrupts pending commitment and restores a full revised-preview interval.
7. Keep budgets, busy/revising/rejected states, Interrupt/Resume, actual receipt and Evidence & ledger. Remove duplicate headings, repeated drag explanations, implementation assurances, preset labels and decorative narration from the main scene. Technical detail stays accessible in evidence.

The prototype's Simulate action represents obtaining or inspecting a computed prediction. Reuse the existing preview engine; do not add a second solver, fake progress or a forced click if prediction is already available. In production, Plan itself can provide continuously updated predictions. The teaching sequence is recommendation → visible prediction → informed choice, not a wizard of mandatory steps.

## Verification and handoff

Use dedicated sessions and coordinate live bridge access with the rehearsal owner.

1. In default Plan, preview both push and field through real pointer actions. Release, wait beyond the old countdown, and verify physical position/velocity/time and fuel are unchanged. Credit debits must match only explicit investigation actions.
2. Ask Astra to plan and then use less fuel. Verify supported calibration, changed quote/path and no automatic movement commitment. Check a stale “continue driving” reply cannot cross the Plan boundary.
3. Apply a displayed preview once, observing the actual charge and mode change. Separately test Drive drag-release, pointer cancel, keyboard equivalent, invalid drag and stale quote. No duplicate debit.
4. Switch to Plan during a pending Astra action and during travel. Verify pause without rewind, no delayed spend, and fresh proposals from current state. Switch to Drive without silently applying the old preview or resuming delegation.
5. Verify the explicit just-drive path still reaches home, supports a pre-commit fuel revision, and respects 22/15/500 including braking. Preserve the existing 20-second preview and clear field gesture where applicable.
6. In an audio-muted visual check, a viewer should identify what to try first, whether release spends fuel, which ship/path is hypothetical, who has the helm, and how to proceed or interrupt.

Return revision/URL, behavioral changes, relevant checks, a Plan preview and Drive execution capture, actual receipt from the revised journey, and any limitations. Do not declare success from labels alone. Random-spawn experience follows this stable first build; leaderboard remains deferred.
