# Journey experience: agreed direction

User-approved decisions, 10 September 2026. This consolidates the side conversation's latest direction for the current implementation pass. It supersedes earlier descriptions of discovery, revision, and mining as separate mandatory stages. It does not declare production integration complete.

## Three connected experiences, five demo entry points

1. **Locate ourselves.** Select an unidentified light, identify the star, inspect its constellation reference, then obtain the measurements that establish position and home direction. Reuse existing catalogue and constellation capabilities. Recognition supplies reference context; a constellation name alone is not a position fix. Preserve uncertainty until the observations justify a solution, and distinguish Earth-reference patterns from the displaced ship's sky.
2. **Discover and shape the journey together.** Capability discovery, experimentation, co-planning, and contextual recommendations form one continuous middle experience. The person asks or tries something; Astra offers a supported simulation, demonstration, or control; the person explores its consequences; Astra recommends a next step based on those results and the person's expressed priorities. Bending gravity demonstrates how AI assistance expands what the person can understand, judge, and do. It is not the entire purpose of this scene.
3. **Arrive home.** Execute the selected journey, including an optional resource stop when chosen. Account for actual motion, time, resources, and final braking. Show the home ending only after position and speed checks pass, with a small inspectable receipt.

Retain five focused demo entry points: Locate ourselves; Discover capabilities; Shape the plan; Consider mining; Arrive home. These allow inspection and repeatable demonstrations without imposing five screens or compulsory gates on the connected experience.

## Contextual mining

Recommend investigating or choosing a resource stop only after a route or simulation makes its relevance intelligible. Explain actual prerequisites, reachable resources, extraction costs, full detour time, braking, and the feasible onward route. Show how the opportunity relates to the person's priorities.

Do not invent a missing resource, hazard, gravity requirement, or future use of leftover fuel to force a recommendation. If the direct plan is already feasible, say so. Mining can be optional or rejected. A focused funded replay may demonstrate the branch under explicitly different starting allowances. Recovered inventory never silently renews a gross-spending allowance or pays a cost that must be affordable upfront.

## Interaction and resource feedback

- Preserve Plan/Drive authority and accounting boundaries from `PLAN-DRIVE-INTERACTION.md`. Hypothetical predictions and actual journey advancement are both simulations, but only the latter changes the current mission. Selecting Drive alone does not delegate or resume execution.
- Use continuous field manipulation, a usable pointer target, pointer capture/cancel handling, keyboard adjustments, and a slower precision gesture. Accumulate small pointer deltas without rounding them away. Human and Astra edits must use the same validated operation semantics.
- Keep predicted route, original comparison, and resource consequences visible near the active control. Fuel and time bars show the proportion of each named allowance used and left, exact amounts, a fixed original-plan marker, and the numerical change from that baseline. Do not compare unlike units as if they were interchangeable.
- Recompute from the actual engine, including braking and any onward leg. Preserve deficits and infeasibility visibly. Distinguish allowance remaining from inventory remaining, particularly after mining. Credits remain secondary when the current manipulation does not affect them.
- Recommendations follow actual interactions and expressed preferences; acknowledging a request in dialogue does not count as revising a plan. Do not label scripted guidance as live Astra or imply that prebuilt controls were generated live.

## Demo and completion contract

Each focused entry must have an intelligible question, actual interaction, inspectable evidence, computed consequence, and repeatable reset. Inspection of an active mission must preserve it; explicit demo replays need isolated state and clearly labeled setup. Pending replies and execution authority must not cross between sessions.

Prioritize getting all five underlying experiences right. Finish the current implementation pass before adding further features. Then inspect a playable candidate as a connected journey: initial uncertainty -> useful evidence -> discovery and experimentation -> consequential human revision -> contextual recommendation -> execution and verified arrival. Engine checks, screenshots, and isolated chapters do not replace that final live walkthrough.

The core rubric remains: evidence -> usable location; human correction -> changed plan; plan -> verified outcome. The resource bars support informed human choice rather than decoration or a claim that the lowest-fuel route is universally best.

## Executed side-conversation contribution

`prototypes/five-scene-way-home.html` is a self-contained interactive rehearsal using a frozen copy of the production journey engine and the existing catalogue. It is not the production app, and guidance is scripted. Its recognition sequence is explicitly an Earth-reference catalogue exercise; production still needs identification of an actual selected ship-view light followed by separate calibration.

Engine source at capture: `dist/journey.js` in the `brush-first-demo` checkout; SHA-256 `fb03a19c86d853f658d9eb714d3fa48216e8df7278e6b7ac8d983ba0011de2e8`. Do not replace a newer production engine with this snapshot.

Browser-verified through actual controls:

- Reference identification, Orion reveal, and paid engine calibration; eight landmarks, four held-out checks.
- Discovery and midpoint co-planning: approximately 17.34 fuel and 362.8 years, saving 2.62 fuel for 67.9 additional years. These computed times replace the older illustrative interpolation.
- Connected 22-fuel journey: mining investigation is rejected as unaffordable; deterministic direct-route continuation reaches home with approximately 4.66 fuel, 6 credits, and 137.2 years left after the report cost. Final speed is zero; distance approximately 1.76e-12 ly.
- Separate funded mining rehearsal (35 fuel / 15 credits / 550 years): approach, braking, extraction, direct onward flight and home braking complete. Final inventory approximately 38.23 fuel / 12 credits / 75.4 years, with 31 ledger actions and zero final speed. The fuel reward is inventory, not renewed spending authority.
- Narrow 390px viewport: content width and scroll width both 358px; no horizontal overflow. No browser page errors in the exercised flows.

`prototypes/shape-a-way-home.html` preserves the earlier compact interaction study. Its intermediate route values are explicitly illustrative interpolation; do not use them as production physics or authoritative costs.

The main thread has received both the implementation reference and the corrected narrative. Production integration, actual selected-light recognition, live Astra recommendation behavior, and the final connected live rehearsal remain separately owned and must be verified before claiming completion.
