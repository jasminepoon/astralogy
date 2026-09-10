# Astralogy

**Find your way home from deep space—with Astra beside you.**

Astralogy is a playable space adventure about what you can understand and do together with AI. Explore an unfamiliar sky, shape your route home, and decide how much fuel and time the journey should cost.

## The experience

1. **Find yourself.** Identify a star and gather measurements to locate your ship.
2. **Try a different route.** Drag a gravity-field handle and watch the predicted path, fuel, and travel time change.
3. **Think it through with Astra.** Ask, “Can we use this route and still leave me at least 140 years?” Astra evaluates your actual adjustment against your priorities.
4. **Hand over the helm.** Let Astra execute the chosen plan, then inspect the arrival and resources remaining.

The central idea is a shared world where your experiment changes the AI's plan. You can see the consequences, question them, and change your mind before committing. Resource stops offer an optional detour when they make sense for your journey.

## Run locally

Requires Python 3 and Node.js 18+. The browser assets are bundled; no package installation or build step is needed.

```sh
git clone https://github.com/jasminepoon/astralogy.git
cd astralogy
python3 server.py
```

Open [localhost:4174](http://localhost:4174), the server's default address. Set `STELLAR_PORT` to use another port.

Live Astra also requires an authenticated Codex CLI with access to the configured `gpt-6-astra` model. The current bridge expects the CLI at `/opt/homebrew/bin/codex`; update the `CODEX` path in `server.py` if your installation differs. Node.js must be on `PATH`. Model access is required separately; cloning this repository does not provide it.

The server runs locally and keeps authentication out of the browser. Manual controls can be explored without live AI; Astra planning and delegation require a working model connection. Connection failures are shown in the interface.

## How it works

Three.js renders the world. A deterministic simulation calculates trajectories, full-trip costs, and arrival checks. Astra receives observations and supported choices through a Python bridge; human and AI adjustments use the same validated controls. Planning previews do not spend fuel or advance journey time. Paid investigations spend credits, and executing a route applies its costs.

This is a fictional navigation game using real star catalogue references with synthetic distances, measurements, and gravity controls. It does not demonstrate real spacecraft navigation or AI discovering physical laws. Game credits and journey years are separate from model usage and real elapsed time.

## Checks

```sh
npm test
python3 -m unittest discover -s tests -p 'test_*.py'
```

These cover simulation behavior and bridge validation. A live walkthrough additionally requires the model connection above.

## Credits

- [Three.js](https://github.com/mrdoob/three.js) — rendering; [MIT notice](dist/vendor/THREE-LICENSE.txt).
- [D3 Celestial / Olaf Frohn](https://github.com/ofrohn/d3-celestial) — star and constellation data; [BSD-3 notice](dist/vendor/D3-CELESTIAL-LICENSE.txt).
- [Astronomy Engine](https://github.com/cosinekitty/astronomy) — astronomy calculations; [MIT notice](dist/vendor/ASTRONOMY-LICENSE.txt).

The earlier sky explorer and orbital studio are available locally at `/atelier.html`.
