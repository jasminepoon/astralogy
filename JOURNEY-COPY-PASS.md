# Journey copy pass

Prepared 10 September 2026 against committed production e33ef1d and the ongoing selection/preview-context changes. This is implementation-ready editorial guidance, not a claim that the UI has been updated. The app owner should reconcile it with its current edits. SHOWCASE-QA.md records the completed star-first live run.

## One connected journey

Keep three story beats: locate ourselves; discover and shape the journey together; arrive home. The middle is a repeatable conversation: try or ask, inspect consequences, express a priority, receive a relevant recommendation, explore or act. Do not turn these into compulsory screens or numbered stages. Chapter links remain optional demo tools.

The scene heading names the current goal. The action card gives the next useful action and its consequence. Astra explains why a recommendation follows from the person's experiment or priorities. The status row identifies who has the helm and whether work is pending. Do not repeat one instruction across all four surfaces.

## Exact replacement copy

Braces below denote values from the current verified state or quote, never example constants. Show only fields supported by that state. Retain actual rejection reasons.

| State / surface | Suggested copy | Condition / placement |
| --- | --- | --- |
| Opening scene heading | Locate ourselves. | Root journey; not tied to a replay. |
| Opening action card | Which light is that? | Primary action: Select a bright light. |
| Opening instruction | Select a ringed light to investigate. | Only once target rings exist. Put push exploration in the quieter tool group. |
| Opening Astra line | Let's find where we are. You can also try a push before we move. | Once at startup, not on every render. |
| Selected light | Identify this light | Button: Identify light · {credits} credit(s). |
| Identification description | A spectral tag identifies this star. We'll still need measurements to locate the ship. | Keep the synthetic-instrument explanation in evidence. |
| Identified result | HIP {id} · {constellation} | Keep reference diagram and its existing catalogue-reference label. |
| Identified description | Star identified. Next, measure our position and home direction. | Only before calibration. Button: Locate ourselves · {remainingCredits} credits. |
| Calibration card title | Finding our position | Status: Measuring. |
| Calibration explanation | Four landmarks locate us; four more check the result. | Preserve investigation price and no fuel/time spending. Detailed attitude/range explanation belongs in evidence. |
| Calibration complete | Position verified. | Supporting line: Home direction is now known. No second paragraph repeating the solver. |
| Middle scene heading | Shape the way home. | Stable across discovery, dragging, revision and optional-stop consideration. |
| Push preview title | Preview a push | Before location: Home direction is still unknown. After location: Compare this push with the route home. |
| Field recommendation title | Bend the route home | One timely explanation: A temporary gravity field can redirect our motion. |
| Field recommendation reason | Direct push and braking need {directFuel} fuel; {availableFuel} is available. | Only when the computed direct route exceeds that available amount. Do not make it a universal claim. |
| Active handle label | Bend gravity | One instruction beside it: Drag to compare the route and fuel. |
| Plan release cue | Release to keep preview | Visible beside active manipulation; retain Preview on the ghost route. |
| Drive release cue | Release to apply · {immediateFuel} fuel | Use this gesture's exact quote; include immediate time debit when applicable. |
| Apply action | Apply & fly | In Plan. Preserve existing entry-to-Drive semantics; no implied Astra delegation. |
| Delegation action | Astra, take the helm | Keep distinct from Apply & fly. Choosing Drive alone does not delegate. |
| Original comparison | Original plan | Use a fixed, valid baseline from the same checkpoint. |
| Tradeoff | {fuelSaved} less fuel · {extraYears} more years vs original | Choose more/less independently from signed differences. Show costs in their own units. |
| Fuel revision request | Use less fuel | One visible button beside the active proposal. |
| Revision pending | Revising… | Keep previous proposal as comparison; do not mark success yet. |
| Accepted revision | Revised: {beforeFuel} → {afterFuel} fuel; {beforeYears} → {afterYears} years. | State whether comparison is against the person's latest edit or original plan. Include braking in both sides. |
| Unsupported revision | {actual reason}. Your current plan is unchanged. | Only say unchanged if the current quote and physical state are preserved. |
| Manual edit acknowledgment | Preview updated. | Avoid a new chat paragraph for every pointer movement. Let path and bars carry the result. |
| Astra setting the field | Setting the field | Keep Preview until commitment. If animated values are intermediate, label the selected target separately. |
| Committed field | Field applied. | One line: The ship is following the field. |
| Travel title | Heading home | Or Heading to the asteroid when appropriate. |
| Travel status | Travel accelerated | Show remaining time and resources. Move numerical checkpoint/integration narration into evidence. |
| Braking title | Braking for arrival | Do not show Home until both checks pass. |
| Arrival scene heading | Home. | Do not repeat Home in a second card heading. |
| Arrival receipt title | Arrival verified | Supporting line: Position and speed checked. Show actual trip time and remaining resources. |
| Pause | Paused. | Supporting cue: You have the helm. Retain original authority and actual accumulated state. |
| Connection failure | Astra couldn't respond. | Follow with the actual recoverable cause and available action. Preserve any previous spending; avoid broad “nothing was spent” claims. |
| Stale quote | This preview is out of date. | Action: Refresh the plan, if that operation is supported. Do not silently substitute a new charge. |
| Undo tooltip | Rewinds the field edit and all later travel, resources and ledger changes. | The scope must remain available before using Undo. |

## Budget and mining

Keep current inventory separate from permitted spending. Label the editable panel **Astra's budget**; use **Spending limits** before delegation and explicit units for used amounts afterward. Keep **Fuel cap left** and **Years cap left** on the projected bars when that is what they measure. Do not call cap remaining inventory, especially after mining.

Put the rule in budget details: **Recovered resources increase inventory, not these spending limits.** Keep any currently binding limit beside the rejected quote. The model must never present a larger balance as renewed permission.

Mining should first appear as **Investigate a resource stop · {reportCredits} credits**, after a route exists and the opportunity can be assessed. The report purchase is not acceptance of the detour. The recommendation must connect the computed detour and net resources to an expressed priority. If no priority favors the detour, report the tradeoff without inventing a need.

| Mining state | Suggested copy |
| --- | --- |
| Investigation pending | Checking the resource stop |
| Direct route also fits | The direct route fits. This stop is optional. |
| Full comparison | Full trip: {spentFuel} fuel spent · {recoveredFuel} recovered · {years} years. |
| Recommendation | For your priority of {supportedPriority}, {supportedRecommendation}, because {computedConsequence}. |
| Infeasible stop | This stop exceeds {bindingLimit}. {actualReason}. |
| Declined stop | Continuing directly. The report cost remains spent. |
| Extraction | Collecting resources |
| Extraction completed | Recovered {actualFuel} fuel and {actualCredits} credits. |

Preserve the full approach, braking, extraction and reserved onward costs in an inspectable comparison. Clearly distinguish full-trip net fuel from extraction-only net fuel. Do not advertise a gross yield as profit. A funded replay must retain its different starting allowances and scripted/computed setup label.

## Remove or relocate

- Remove numbered phase labels from the connected journey; they imply the discarded five-stage flow. Keep chapter names inside demo navigation.
- Remove duplicate writes to scene titles/descriptions in render(), rather than maintaining old wording that is immediately overwritten.
- Remove “The world can be quiet again,” “Make the same sky legible,” and “No corrective impulse is being added” from primary cards. Arrival imagery, measured results and technical evidence already serve those purposes.
- Move force equations, timestep details, synthetic catalogue setup, exact residuals and source/replay provenance into Evidence & ledger. Preserve a short synthetic-world disclosure in the rules.
- Hide empty metrics, empty explanations, unavailable mining shortcuts and redundant preset narration. Do not hide actionable errors, prices, pending states or interruption.
- Generate references to a previous push only when one exists. If the person adjusted a field, reference that supplied preview and its actual comparison instead.

## Acceptance check after integration

Use the actual connected root, without demo chapter jumps. Identify a star, calibrate, inspect a route, manually adjust the field, ask Astra about that exact result, request a supported tradeoff, consider or reject mining if relevant, delegate and verify arrival. Include one paused/rejected state separately.

At every moment the viewer must be able to answer: What can I do next? Does it spend resources or move the ship? What changed because of my action? Why does Astra suggest this next step?

Read the UI aloud with audio muted in the recording. Remove repetition only after ensuring release semantics, computed consequences, limits and control ownership remain clear. Validate desktop and narrow layouts with actual generated messages; shorter templates alone do not prove the screen is uncluttered.
