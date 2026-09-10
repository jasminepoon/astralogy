# Development provenance

Recorded 10 September 2026. The official event window has not been confirmed. No claim is made that all existing work qualifies for the hackathon.

## Existing baseline

Commit `45a0cac` (10 September 2026, 12:26:18 EDT) contains the original Stellar Atelier: catalogue sky, Three.js rendering, paint material, circular two-body model, timeline, save/load and static Sites publication. These components must be marked as existing work in any submission unless their event eligibility is established separately. Vendored Three.js, Astronomy Engine and catalogue assets are third-party components with retained notices.

## This extension

Built after that baseline: explicit noncircular launch velocities, complete versioned body snapshots, independent measured trajectory branches, finite return-event probes, live Astra proposal bridge, correction and candidate-selection flow, failure/stale handling, experiment-record export, mobile framing changes, and expanded tests. Inspect the Git diff from the baseline for exact code provenance. The local live backend has not been publicly deployed.

Astra was used to implement this extension and for independent read-only reviews of the bridge and numerical return-event design. Astra also participates at runtime: actual Codex CLI calls produced the recorded 10-, 8-, and 5-year proposals. Physics results are calculated by authored deterministic code, not taken from the model's narration.

## Submission work still separate

Confirm official event dates and identify the eligible changes before describing the submission. A public source repository and publicly accessible one-minute screen/audio demo are not created by this local delivery. Do not imply the existing static hosting URL runs the new local Astra bridge. The event demo should show live proposal, measured candidate selection, the eight-year correction, and honest failed probes; it should credit the existing sky/paint components.
