# Stellar Atelier

A browser sky explorer and painterly stellar sandbox, built with Three.js.

## Run locally

From this directory, run `python3 -m http.server 5173 --bind 127.0.0.1`, then open `http://127.0.0.1:5173/dist/`. The distributable is the authored `dist/` directory; there is no bundler step. The two runtime libraries and astronomy data are vendored. Google Fonts is optional and falls back to system fonts.

Run the numerical tests with `npm test` (Node 18+). No npm dependencies are required.

## First playable version

- 5,044 catalogue stars, 88 constellation line sets, and 21 named-star profiles.
- Direct sky selection, named-star search, camera navigation, UTC observation time, latitude/longitude, and horizon display.
- Separate Sun-like experiment inspired by the selected star, with a 14,000-particle painterly field. Brush strokes emit color and disturb nearby existing tracers.
- A companion star with adjustable mass and barycentric circular initial conditions at 4 AU separation.
- Fixed-step leapfrog gravity, pause/play, speed control, deterministic body-state scrubbing, reset, and device-local save/load.
- Desktop and compact mobile controls, keyboard navigation, and a small WebMCP surface.

## Scientific boundaries

The sky uses J2000 D3 Celestial coordinates and Astronomy Engine's EQJ-to-horizontal rotation. It includes Earth rotation, precession, and nutation; it omits proper motion, stellar parallax, annual aberration, and atmospheric refraction. It is not certified to the original plan's 1-arcminute accuracy target across the entire date range. Coordinates shown in the star card are catalogue RA/declination, while altitude is calculated for the observation time.

The studio always uses an explicitly assumed 1-solar-mass primary, not an inferred mass or radius for the selected catalogue star. Stars have exaggerated visual radii. Body dynamics use AU, Julian years, and nominal solar masses, with G=39.476926408897626. Contact/underresolved encounters pause the model. Only safe circular companion seeds are offered.

Paint is massless artistic material with softened, scaled gravity and drag; it does not model plasma or perturb the stars. Paint evolves with wall-clock artistic time while bodies use simulation years. Moving the time slider refreshes paint; only body motion is deterministically replayed. Saved moments preserve model parameters, camera, sky, and body time, but not painted trails.

The current prototype accepts explicit UTC input. Automatic birthplace/time-zone resolution, AstroDienst import, free companion placement/velocity, fusion and heating experiments, stellar evolution, and interstellar travel remain future work. The two-body workload runs on the main thread; a Worker is unnecessary at this bounded scale and can be added if the model expands.

## Data and licenses

- [D3 Celestial / Olaf Frohn](https://github.com/ofrohn/d3-celestial): `stars.6.json`, `constellations.lines.json`; catalogue provenance includes XHIP. BSD-3 notice in `dist/vendor/D3-CELESTIAL-LICENSE.txt`.
- [Three.js](https://github.com/mrdoob/three.js), version 0.170.0; MIT notice in `dist/vendor/THREE-LICENSE.txt`.
- [Astronomy Engine](https://github.com/cosinekitty/astronomy), version 2.1.19; MIT notice in `dist/vendor/ASTRONOMY-LICENSE.txt`.
- Star profiles link to HIP identifier records in [SIMBAD](https://simbad.cds.unistra.fr/simbad/). Introductory stellar physics: [NASA Stars](https://science.nasa.gov/universe/stars/).

## Reference implementations

Thomas Ricouard's [Void Explorer](https://developers.openai.com/showcase/void-explorer), [Sunwake](https://developers.openai.com/showcase/sunwake), and [Hollowflux](https://developers.openai.com/showcase/hollowflux) informed targeting, scene-centered interfaces, and reactive material. See `REFERENCE-AND-VALIDATION.md` for what was actually inspected. No source code or assets from those games were copied.
