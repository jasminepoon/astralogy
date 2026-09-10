# Stellar Atelier — sky explorer and physics sandbox plan

Status: first playable prototype implemented September 10, 2026. This document retains the broader roadmap; README.md records implemented scope and scientific limits, and REFERENCE-AND-VALIDATION.md records validation evidence.

## Intended experience

Enter a date, time, and place, or bring a natal chart, and explore the corresponding sky. Select a star and enter an experimental space where dragging feels like smearing acrylic paint: luminous material stretches, folds, and curls around the gesture. Add a companion star, change its initial motion, and move through time to explore the consequences. Return to the original sky whenever desired. “Stellar Atelier” is a working title.

The first release should make this journey work: **open a real sky → select a star → open an experiment → brush a luminous tracer field → add a companion → advance or replay time → return to the original sky.**

The latest user direction prioritizes direct manipulation, a painterly environment, physically meaningful stellar behavior, time exploration, and the ability to introduce new stars or energy. Build a custom Three.js interface. Stellarium serves as a reference for astronomical checks. The phrase “use your physics knowledge to Memphis” is not yet interpreted as a specific design requirement.

## Inspiration from the supplied article

Both supplied links resolve to [Building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra). Its useful lessons are to define the experience first, establish visual references, keep simulation separate from rendering, expose inspectable state, use repeatable scenes, and measure performance alongside hands-on review. Its treatment of observer-relative coordinates is relevant to later travel across stellar distances.

Our application of those ideas: build one complete exploration journey, give it deterministic astronomy fixtures and browser checks, and refine its appearance and controls through use. Catalogue measurements will determine star positions. Generated artwork may guide interface styling or constellation illustrations.

### Thomas Ricouard implementation references

Use Thomas Ricouard’s projects as explicit references during implementation, as requested by the user. Identity links: [X / Dimillian](https://x.com/Dimillian), [GitHub / Dimillian](https://github.com/Dimillian).

| Project | Documented behavior to study | Application to this project |
|---|---|---|
| [Void Explorer](https://developers.openai.com/showcase/void-explorer) · [live demo](https://void-explorer.openai.chatgpt.site) | Direct targeting, visual navigation, continuous travel, and coherent detail transitions | Make a selected star feel like a destination; preserve orientation while entering and leaving the local experiment |
| [Sunwake](https://developers.openai.com/showcase/sunwake) · [live demo](https://sunwake-the-last-light.openai.chatgpt.site) | Boat movement connected to buoyancy, wakes, and spray; alternative water treatments | Tie visible disturbance to the user’s gesture and retain a consistent field as visual style changes |
| [Hollowflux](https://developers.openai.com/showcase/hollowflux) · [live demo](https://tideglass-drowned-vein.openai.chatgpt.site) | Currents move objects; attacks leave persistent wakes, eddies, and foam; interface simplification | Make brush strokes leave evolving traces that interact with subsequent gestures, while keeping the selected star readable |

Evidence status: the author’s article and all three showcase descriptions were inspected on September 10, 2026. Subsequent bounded live checks of Sunwake and Void Explorer are recorded in REFERENCE-AND-VALIDATION.md; Hollowflux was inspected only to its start screen. The checked GitHub listing and search did not establish public source repositories for these three games. X could not be read through the web tool. Do not describe their implementation as code-audited or their performance as independently verified.

Before implementing the gesture system, run a focused reference session with the available demos: observe targeting, camera response, input-to-disturbance behavior, persistence, and recovery after rapid input. Record browser/device, actions, screenshots, and useful failure cases in a reference log. If public source becomes available, record a commit and inspect only the relevant modules and license before considering reuse. Implement a small comparable interaction here and measure it locally. These references establish interaction and rendering ideas; astronomy and stellar physics require their own validation.

## Scope and defaults

These are recommendations, not preferences the user has already confirmed.

| Decision | Proposed default |
|---|---|
| First platform | Desktop browser, with mouse and trackpad controls |
| First mode | Earth-based sky connected to a local stellar experiment |
| Appearance | Painterly luminous matter, rich color mixing, tactile trails, minimal interface |
| Initial data | Curated bright-star catalogue; Orion as the first detailed constellation |
| Initial date coverage | 1900–2100, subject to validation of the selected engines and time data |
| Initial input | Date, time, location; a synthetic example available immediately |
| Astrology | Add chart overlays after the sky and coordinate pipeline are validated |
| Storage | Local saved moments; no account required for the prototype |
| Hosting | Local development first; choose private or public sharing later |

An optional “reveal below horizon” setting allows exploration of the full celestial sphere while clearly indicating what is below ground. Daylight visibility and a revealed star field should be distinguishable. The first version will not simulate local buildings, terrain, weather, or light pollution.

## Observation and experimentation

An observed sky and an experiment have separate state. Opening an experiment copies a selected star’s usable properties, records assumptions for missing values, and preserves its source. Changes never overwrite the catalogue or natal chart. Use a persistent “Experiment” indicator and a one-action “Return to sky” control. A nearby star in a constellation drawing is not automatically a physically nearby companion.

Star coordinates do not supply everything needed for an experiment. Stellar mass, radius, age, composition, and full velocity may be missing or uncertain. Use attributed measurements where available; otherwise start from a clearly labeled Sun-like model rather than inventing properties of the selected star.

### Navigation

**Observer mode:** the camera stays at the selected Earth location. Time changes rotate the sky and update calculated positions. The horizon, compass directions, ecliptic, constellation lines, and labels can be toggled. A focus action turns the camera toward the selected object; a return action restores the saved view.

**Local experiment, first prototype:** orbit a selected star model with a bounded surrounding tracer field and one optional companion. Provide depth-aware placement using a visible plane and distance control; a screen coordinate alone cannot place a star in 3D.

**Spatial mode, later:** move through a distance-qualified subset of the catalogue. Show the Earth viewpoint as a reference and illustrate how constellation shapes depend on that viewpoint. Unknown or unreliable distances must remain explicit. Travel speed may be accelerated for usability; displayed distances retain physical units. Define the relationship between model time and light-travel time before describing this mode as an accurate view from another star.

## Interaction and physics design

### What each gesture means

| Interaction | Experience | Model and limits |
|---|---|---|
| Select a star | Focus smoothly; open its identity and properties; enter its experiment | Preserve the catalogue identity and distinguish measured from assumed properties |
| Brush through space | Stretch colored trails into folds and vortices | First prototype: artistic tracer field with a velocity brush; tracer particles feel stellar gravity but do not exert gravity or represent stellar plasma |
| Add a star | Place a companion and drag an initial velocity arrow; see a predicted path | Newtonian gravity between a small number of massive bodies; initial mass and motion are explicit |
| Move through time | Pause, accelerate, scrub, return to a saved state | Separate calendar time, orbital duration, and stellar age; use saved states and deterministic replay for experiment rewind |
| Add heat or fuel, later | Compare expansion, temperature, and luminosity responses | A reduced stellar model with defined inputs and valid ranges; energy input is an intervention rather than an arbitrary explosion |
| Explore fusion, later | Inspect how composition and core conditions relate to a star’s evolution | Precomputed stellar evolution sequences or a validated reduced model; interpolate only within their supported conditions |

**Fusion is the relevant starting point.** Normal stars generate energy through nuclear fusion; pressure gradients support them against gravity. Fission is not their ordinary power source. An added energy pulse can be an experiment, but it should not be labeled as a realistic fission-powered star. [NASA: Stars](https://science.nasa.gov/universe/stars/)

The acrylic sensation is an art and interaction goal. Stellar plasma involves compressibility, radiation, and magnetic fields; a viscous paint solver cannot stand in for all of that. Start with a beautiful tracer field and honest orbital motion. Consider a bounded gas simulation later, with its approximation visible in the experiment information. Browser fluid projects demonstrate possible interaction techniques, not astrophysical fidelity. [WebGPUMPM project](https://github.com/chetan-parthiban/WebGPUMPM)

### Physics implementation boundaries

- Keep body mass, position, velocity, radius, and simulation time in explicit physical units. Use consistent internal units and camera-relative rendering.
- Begin with a small isolated Newtonian system and a fixed-step leapfrog integrator. Accelerate time by executing controlled substeps, never by tying the physical timestep directly to frame duration.
- Qualify timestep limits with orbit tests. Pause at stellar contact or an unresolved close approach in the first version. A point-mass solver cannot establish a credible collision, merger, or disruption outcome.
- Record mass insertion, velocity changes, and brush impulses as interventions. Show energy and momentum drift between interventions; adding a star deliberately changes those totals.
- Tracer glow, thickness, viscosity-like effects, and display size are presentation controls. A star’s visible disc may be enlarged for selection while its physical radius remains separate.
- For stellar evolution, investigate precomputed tracks from a tool such as MESA. Treat arbitrary accretion or heating as additional modeling work: normal evolution tracks do not automatically predict interventions. [MESA documentation](https://docs.mesastar.org/en/stable/using_mesa/running.html)
- Full radiation magnetohydrodynamics, nuclear reaction networks running in real time, and predictive stellar collisions are outside the initial scope.

### Three time controls

**Sky date** reconstructs an observer’s sky within the validated date range. **Experiment time** advances local dynamics, with units appropriate to the system. **Stellar age** explores slow evolution, often over millions or billions of years. Each has its own labeled scale; stars should not visibly evolve merely because the sky date moves forward a few days.

Rewind restores a checkpoint and replays the event log. New edits after rewinding create a branch. Do not attempt to undo dissipative tracer motion by simply using a negative timestep.

## Data and calculation design

Use a shared, versioned scene description between the astronomy engine and renderer. Three.js handles drawing and interaction; the astronomy layer supplies coordinates and metadata.

| Layer | Proposed choice and responsibility |
|---|---|
| Browser | TypeScript, Vite, Three.js; start with WebGL2 and assess WebGPU only if needed |
| Local dynamics | Small deterministic gravity solver in a Web Worker; state snapshots and intervention log |
| Painterly field | GPU tracer rendering; benchmark a bounded velocity field, with optional WebGPU compute and a reduced fallback |
| Stellar evolution, later | Precomputed model tracks and a documented interpolation domain |
| Star calculations | Python/Skyfield with a curated Hipparcos subset; prepare full scene snapshots for arbitrary supported moments |
| Chart calculations | Swiss Ephemeris adapter for fixed stars and planets when chart matching is introduced |
| Star knowledge | Cached, attributed SIMBAD records and curated descriptions |
| Later spatial catalogue | Selected Gaia records with assessed distance quality, supplemented for bright stars |
| Reference viewer | Stellarium desktop configured with matching date, location, and relevant calculation settings |

Skyfield documents catalogue-based star calculations; Swiss Ephemeris supports fixed-star calculations and equatorial output. SIMBAD supplies identifiers, measurements, and bibliography. Gaia supplies astrometric measurements, but distance selection requires care. Sources: [Skyfield](https://rhodesmill.org/skyfield/stars.html), [Swiss Ephemeris](https://www.astro.com/swisseph/swephprg.htm), [SIMBAD](https://simbad.unistra.fr/simbad/), [Gaia DR3](https://www.cosmos.esa.int/web/gaia/dr3), [Stellarium](https://stellarium.org/en_US/).

The initial technical spike will decide whether the Python calculations run as a small local service or produce snapshots for the browser. Keep the interface stable so deployment can change later. Rendering remains responsive while a new snapshot is calculated; discard superseded requests when the user scrubs time rapidly.

### Scene contract

- **Moment:** original local date and time, IANA time zone, resolved UTC instant, latitude, longitude, elevation, and any uncertainty in the supplied time.
- **Calculation settings:** source catalogue/version, coordinate frame, reference epoch/equinox where applicable, apparent versus astrometric convention, refraction setting, and engine version.
- **Star:** stable identifier, aliases, right ascension, declination, magnitude, proper motion where available, and distance with provenance/quality when available.
- **Calculated output:** observer-relative direction, altitude/azimuth, optional chart longitude/latitude, and source identifiers.
- **Presentation:** selected star, camera orientation, field of view, active layers, and saved moment identifier.
- **Experiment:** source scene, measured/assumed body properties, initial conditions, model version, integration step, tracer seed, intervention log, checkpoints, and branch identifier.

Specify units explicitly. Convert local time with historical daylight-saving rules and surface ambiguous times. Treat proper motion, precession, nutation, aberration, and refraction as calculation choices handled consistently by the engine. Avoid applying a correction again to imported coordinates that already include it.

### Import path

1. Inspect one actual AstroDienst or other software output before promising a parser for that format.
2. Prefer CSV, structured text, or JSON. A PDF/chart image can be inspected, but extracted numbers need a review step.
3. Normalize names, units, date, coordinate system, and calculation settings; report unresolved entries.
4. Use right ascension/declination or ecliptic longitude/latitude when supplied with adequate metadata.
5. If only zodiac longitude is supplied, resolve the named object against the catalogue and calculate its sky position independently. Preserve the imported longitude as chart data.
6. Match tropical/sidereal settings and ayanamsha before comparing chart values. House systems and conjunction rules become explicit settings when those features are added.

A zodiac longitude alone does not specify a direction in the sky. Zodiac signs and astronomical constellation boundaries need separate labels and overlays.

## Delivery sequence and completion criteria

| Stage | Deliverable | Completion criteria |
|---|---|---|
| 1. Visual and physics spike | A paint-like gesture study, a two-body orbit fixture, and a catalogue-backed sky fixture | Establish tactile direction; verify an orbit analytically; compare named sky positions with a reference |
| 2. First interactive journey | Select a real sky object, open a local experiment, brush tracers, add one companion, control time, return | Complete the journey through real controls; catalogue state remains intact; replay reproduces body motion |
| 3. Learning and polish | Attributed star cards, decluttering, keyboard controls, reduced motion, local saves | Save/reload preserves both the source moment and the experimental branch; unknown properties remain explicit |
| 4. Natal-chart connection | Import the supplied sample format and display selected chart overlays | Every row is either mapped or explained; matching settings reproduce the sample within its reported precision |
| 5. Stellar evolution experiments | Age slider and comparison of supported stellar models; separately scoped heat/fuel experiments | Outputs match reference tracks within declared interpolation errors; unsupported interventions are identified |
| 6. Broader spatial exploration | Distance-qualified stars, free navigation, Earth-reference view | Relative geometry is stable; uncertain distances are disclosed; returning reproduces the original observer view |

Stage 2 is the first reviewable prototype. Stages 3–6 expand it after feedback. A phone sensor mode, VR, procedural planets, landing, accounts, and an AI conversational guide are future options rather than first-release requirements.

## Validation and review

Create repeatable scenes for Orion, a southern-hemisphere observer, a near-horizon star, a daylight moment, and a time-zone transition. Include numerical fixtures for RA wraparound, polar directions, and local-time conversion.

For the sandbox, test circular and eccentric two-body orbits against analytic solutions, timestep convergence, conservation between interventions, contact/close-approach pauses, and deterministic body-state replay. Set tolerances during the spike before claiming physics accuracy. GPU tracer appearance may vary across hardware; require repeatability of the physical body states and event history, not bit-identical pixels. Browser checks also cover depth placement, brush input, timeline branching, and returning to the unchanged source sky.

Proposed positional acceptance target: within 1 arcminute of a matched reference for test stars above 10° altitude with refraction disabled over the initial date range. Confirm this target during the data spike; investigate differences in catalogue and coordinate conventions before calling a discrepancy a renderer bug. Near-horizon refracted positions require a separate tolerance and atmosphere assumptions. Screenshots check appearance; numerical comparisons check accuracy.

Expose development-only scene state: UTC, observer, frame, selected object, camera, calculation readiness, and performance counters. Browser tests should exercise actual rotation, selection, time changes, and save/restore. Record screenshots of the named scenes and measure frame-time percentiles during interaction on the target device. Aim for smooth 60 fps desktop interaction, then set a supported catalogue size from measurements. Keep software-rendered test timings separate from hardware performance claims.

User review focuses on whether navigation feels natural, stars and labels are readable, and the experience encourages exploration. Each review should identify a specific scene or action that needs improvement.

## Decisions before broader distribution

Confirm catalogue redistribution terms and retain attribution. Swiss Ephemeris offers AGPL or a professional license; choose the applicable path before integrating it into a distributed service. This is a release dependency, not a reason to delay the standalone sky prototype. [Swiss Ephemeris licensing statement](https://www.astro.com/swisseph/swephprg.htm)

Keep personal birth details out of public example fixtures and shared URLs by default. Choose hosting access and any server retention when sharing is requested. No paid service or runtime AI API is required by the proposed first prototype.

## What I need from you

### Most useful for the next step

1. **One example moment:** date, local time, and city/country. A fictional example is fine; say if the time is approximate. Default if omitted: January 15, 2000, 10:00 p.m., New York City, explicitly labeled as demo data.
2. **First experiment preference, optional:** paint the surrounding field, add a companion star, or explore a star’s interior. The revised default combines painting with one companion; interior/fusion modeling follows later.
3. **A few favorites:** three to ten stars or constellations you want to explore. Default: Orion, Sirius, and the Pleiades.
4. **A reference for the paint sensation, optional:** an artwork, animation, or a description of thickness and motion. The user has already specified acrylic-like smearing; default to thick luminous trails that stretch and curl with the gesture.

### Needed when implementing the relevant feature

| Input | When it is needed | Why |
|---|---|---|
| One AstroDienst output, with its settings if available | Import stage | Establish actual fields, precision, units, and parser scope |
| Tropical or sidereal; ayanamsha if sidereal | Chart overlays | Match the chart’s zodiac convention |
| Preferred astrology tradition and reference sources | Interpretive content | Attribute interpretations consistently |
| Computer/phone and usual browser | Prototype testing | Set interaction and performance targets; default to desktop first |
| Personal tool or intended public/commercial product | Distribution planning | Decide hosting, licensing, privacy, and operating costs |

You do not need to provide all of these before development can begin. The default demo supports the first two stages without a personal chart or export. The next work would be the gesture and physics spikes, then the complete interaction journey; the first playable implementation is now described in README.md.
