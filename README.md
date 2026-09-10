# Latest: Astra-led journey home

The local root now opens the playable calibration-to-arrival journey. See [JOURNEY-BUILD.md](JOURNEY-BUILD.md) for the three-minute demo, controls, model rules and validation. The complete original observatory and orbital studio remain at `/atelier.html`. Run `python3 server.py` and open http://localhost:4173. This existing-Site edit has not been deployed.

# Stellar Atelier

A browser sky explorer and painterly stellar sandbox, built with Three.js.

## Run locally

Run `python3 server.py`, then open [localhost:4173](http://localhost:4173). Enter the stellar studio, add a companion, and choose **Explore with Astra**. Refine the outcome in the text field or use the eight-year correction. Select a tested candidate to compare its gold trajectory with the cyan circular reference; **Play selected** replays it and **Revert** restores the original body snapshot.

The backend uses `/opt/homebrew/bin/codex` with the configured supported `gpt-6-astra` route and existing ChatGPT login. Node must be on PATH. No browser API keys are used. The loopback-only server accepts same-origin requests, validates snapshots and proposals, limits each request to five probes, disables CLI tools, and terminates model requests after 100 seconds. CLI installation alone does not establish a successful model connection; the UI reports failures without substituting a scripted response.

The authored `dist/` files need no bundler. A plain static server can still serve the observatory, paint, and manual comparison, but live Astra requires `server.py`. The current hosted static site has not been updated or connected to this local backend. Runtime libraries and astronomy data are vendored; Google Fonts is optional.

Run the numerical tests with `npm test` (Node 18+) and bridge checks with `python3 -m unittest discover -s tests -p 'test_*.py'`. No npm dependencies are required.

## First playable version

- 5,044 catalogue stars, 88 constellation line sets, and 21 named-star profiles.
- Direct sky selection, named-star search, camera navigation, UTC observation time, latitude/longitude, and horizon display.
- Separate Sun-like experiment inspired by the selected star, with a 14,000-particle painterly field. Brush strokes emit color and disturb nearby existing tracers.
- A companion star with adjustable mass and barycentric circular initial conditions at 4 AU separation.
- Fixed-step leapfrog gravity, pause/play, speed control, deterministic body-state scrubbing, reset, and device-local save/load.
- Desktop and compact mobile controls, keyboard navigation, and a small WebMCP surface.

## Scientific boundaries

The sky uses J2000 D3 Celestial coordinates and Astronomy Engine's EQJ-to-horizontal rotation. It includes Earth rotation, precession, and nutation; it omits proper motion, stellar parallax, annual aberration, and atmospheric refraction. It is not certified to the original plan's 1-arcminute accuracy target across the entire date range. Coordinates shown in the star card are catalogue RA/declination, while altitude is calculated for the observation time.

The studio always uses an explicitly assumed 1-solar-mass primary, not an inferred mass or radius for the selected catalogue star. Stars have exaggerated visual radii. Body dynamics use AU, Julian years, and nominal solar masses, with G=39.476926408897626. Contact/underresolved encounters pause the model. Manual comparisons support bounded explicit relative velocities up to 12 AU/year at the initial 4 AU separation. Integration steps are selected from estimated periapsis and passage speed, with a lower step limit and explicit unresolved-contact guards. Snapshots include model version, masses, initial and current positions/velocities, timestep, tick, and stopped state.

Paint is massless artistic material with softened, scaled gravity and drag; it does not model plasma or perturb the stars. Paint evolves with wall-clock artistic time while bodies use simulation years. Moving the time slider refreshes paint; only body motion is deterministically replayed. Saved moments preserve complete body snapshots, camera and sky, but not painted trails. The artistic paint layer can be hidden independently; it is excluded from measured trajectories.

The current prototype accepts explicit UTC input. Automatic birthplace/time-zone resolution, AstroDienst import, free companion placement, fusion and heating experiments, stellar evolution, and interstellar travel remain future work. The two-body workload runs on the main thread; a Worker is unnecessary at this bounded scale and can be added if the model expands.

## Data and licenses

- [D3 Celestial / Olaf Frohn](https://github.com/ofrohn/d3-celestial): `stars.6.json`, `constellations.lines.json`; catalogue provenance includes XHIP. BSD-3 notice in `dist/vendor/D3-CELESTIAL-LICENSE.txt`.
- [Three.js](https://github.com/mrdoob/three.js), version 0.170.0; MIT notice in `dist/vendor/THREE-LICENSE.txt`.
- [Astronomy Engine](https://github.com/cosinekitty/astronomy), version 2.1.19; MIT notice in `dist/vendor/ASTRONOMY-LICENSE.txt`.
- Star profiles link to HIP identifier records in [SIMBAD](https://simbad.cds.unistra.fr/simbad/). Introductory stellar physics: [NASA Stars](https://science.nasa.gov/universe/stars/).

## Reference implementations

Thomas Ricouard's [Void Explorer](https://developers.openai.com/showcase/void-explorer), [Sunwake](https://developers.openai.com/showcase/sunwake), and [Hollowflux](https://developers.openai.com/showcase/hollowflux) informed targeting, scene-centered interfaces, and reactive material. See `REFERENCE-AND-VALIDATION.md` for what was actually inspected. No source code or assets from those games were copied.

## Live orbital proposals

The creative goal is the widest **verified tested** excursion that returns before a finite deadline while preserving the starting closest approach. The first family fixes masses, launches tangentially from 4 AU, and supports 1–1.5 times circular speed with a 1–30-year deadline. Astra interprets the outcome and proposes speeds; deterministic physics supplies results. This is not AI discovery of orbital laws or a claim of global optimization.

A return requires an excursion exceeding 0.01 AU, passage through the opposite half-plane, and a full revolution back to the launch ray within 0.01 AU of 4 AU. Minimum sampled separation must stay at least 3.99 AU. Event time is interpolated between full integration steps. A return close to the deadline (within two timesteps) remains unresolved; energy drift above 0.01% of the initial binding-energy scale also invalidates verification. Paths are decimated for display; extrema are measured at every integration step. Classification as analytically bound is kept separate from an observed return. Probes have a 250,000-step budget; unresolved and late probes remain inspectable.

The interface retains each proposal, its source snapshot, measured probes, and selection in memory. **Export experiment record** saves these as JSON. Records are not automatically persisted across reloads. Body moments can separately be saved on the device. Changing a request or model state invalidates any pending response; prior probes sent to Astra are restricted to the current mass and model version.

See [LOCAL-VALIDATION.md](LOCAL-VALIDATION.md) for actual run evidence and [DEVELOPMENT-PROVENANCE.md](DEVELOPMENT-PROVENANCE.md) for event eligibility boundaries.
