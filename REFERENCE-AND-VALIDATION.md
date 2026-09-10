# Reference and validation log

Date: September 10, 2026.

## Thomas Ricouard references

Reviewed the author’s [build article](https://developers.openai.com/blog/how-to-build-games-with-astra) and the three official showcase pages linked in PLAN.md. Source repositories for those three games were not established by the public listing/search; no code audit or reuse is claimed.

Live browser observations:

- Sunwake: entered the game, engaged cruise using R, observed the cruise control change state and the speed increase. A screenshot showed the boat's wake, faceted water, and sparse controls framing the scene. This supports the choice to keep the scene central and tie gestures to visible disturbance. The game's FPS label was not treated as a benchmark for this app.
- Void Explorer: started an expedition, selected Cinder Wake from the visible destinations, and observed the waypoint switch with a confirmation and updated range. This supports direct selection with a clear identity and destination state.
- Hollowflux: opened its start screen and inspected its advertised movement/strike controls. The reference tab became unavailable before gameplay testing, so persistent-fluid behavior remains supported by the author's description, not independently observed here.

## Numerical validation

Eight Node tests pass:

1. Ten complete circular binary orbits preserve energy and separation within specified tolerances, retain the barycenter, and have small phase error.
2. Seeking backward and forward reproduces identical body positions and velocities.
3. Companion/mass resets produce new initial conditions and reset time.
4. Invalid input and unresolved encounters fail explicitly.
5. Sirius altitude/azimuth matches four fixtures produced by the Python Astronomy Engine implementation, including 1900 and 2100. These check implementation consistency, not independent astrophysical accuracy.
6. Wrapped right ascensions give equivalent sky directions.
7. The 30-year timeline endpoint remains valid for save/load across all supported companion masses.
8. A rejected step leaves the previous body state intact.

The original plan's independent Stellarium angular-accuracy comparison has not been completed. The prototype's omitted proper motion and other corrections are disclosed in the UI and README.

## Browser validation

Tested in the Codex in-app browser at its normal desktop size and at a temporary 390×844 viewport:

- Catalogue and lines load; initial Rigel altitude is 40.6° for the demo moment.
- Enter studio, drag a paint stroke, and inspect its visible trail.
- Configure a 0.6-solar-mass companion; separation displays 4.000 AU and period 6.32 years.
- Scrub to 6.32 years, save, reset, and load; body time and orbit restore and paint refresh is disclosed.
- Mobile control drawer opens, exposes the tools, and supports return to the original sky.
- Advance sky time one hour; UTC changes from 03:00 to 04:00 and Rigel altitude changes to 37.0°.
- All three WebMCP tools register and execute. Out-of-range mass is rejected and subsequent readback confirms state was not corrupted.

Performance figures exposed through the read tool are recent animation-frame samples, not GPU timings or a certified hardware benchmark. No 60-fps guarantee is made.
