# Astralogy

**Find your way home from deep space—with Astra beside you.**

Astralogy is a playable space adventure about what you can understand and do together with AI. Explore an unfamiliar sky, shape your route home, and decide how much fuel and time the journey should cost.

## Play or Demo

**Play** starts in an unknown sky. Identify a star, locate the ship, shape a route, and decide what matters. **Demo** starts with a clearly labeled prepared route so you can immediately drag the gravity grip, ask Astra about your adjustment, and hand over the helm. Other demo scenarios live in the Journey menu.

The two experiences keep separate state in the current tab. Switching pauses execution, cancels pending replies, and preserves the outgoing journey, conversation, preview and camera. Returning never grants flight authority. Reload starts fresh; there is no saved-game import. New Play journeys retain one previous journey for recovery. Restarting Demo leaves Play untouched.

Plan keeps a free preview. **Take the helm** delegates the reviewed route; **Interrupt** pauses at a checkpoint. Advanced gesture behavior is in Journey. Zoom and Fit route only change the camera.

## Choose the mission

- **Home** is the default. Full-route quotes include braking, and arrival is verified from position and velocity.
- **Home can wait · YOLO** changes the objective to mining. Choose among three fixed asteroids, preview approach/braking/extraction, collect a finite deposit, and choose again. There is no automatic trip home or renewed spending authority. Recovered inventory can fund explicitly increased spending limits. Plot a course home remains available, without promising it will fit.
- **Visit a star system** uses actual HIP catalogue identities and directions. Select an identified light or visit the nearby measured system. Travel depths and the 0.01-ly approach offset are simulated. On arrival, browse all 88 constellations and all 5,044 available catalogue stars, or highlight constellation members in the local sky. Complete charts use Earth-reference coordinates; the local sky uses the ship's actual simulated position. No planet ephemerides, landing or orbital dynamics are supplied.

A contextual YOLO invitation appears when every affordable tested home route leaves at most 25% of the available fuel or lifetime allowance, or none fits—and at least one mining target fits upfront. Forecasts test guided field and direct home routes at 0.02, 0.025, 0.04, 0.065 and 0.07 ly/year, including braking. This is a bounded route search, not a proof over every possible trajectory. Objective changes preserve current position, velocity, inventory, time and ledger; an active gravity field must finish before changing destination.

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

Star identities and catalogue directions are real; distances, range/tag measurements, asteroid deposits and gravity controls are game rules. The gravity grip operates a ship-controlled field, not a discovered planet. It does not demonstrate real spacecraft navigation or AI discovering physical laws. Game credits and journey years are separate from model usage and real elapsed time.

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
