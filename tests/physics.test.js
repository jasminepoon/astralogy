import test from "node:test";
import assert from "node:assert/strict";
import { Experiment, G } from "../dist/physics.js";
import { skyTransform } from "../dist/astro.js";
test("Circular binary preserves energy, separation, barycenter, and phase for ten orbits", () => {
  const x = new Experiment(0.6, true),
    e = x.energy();
  for (let i = 0; i < 20480; i++) x.step();
  assert.ok(Math.abs((x.energy() - e) / e) < 1e-7);
  assert.ok(Math.abs(x.separation - 4) / 4 < 1e-5);
  const center = x.bodies[0].p.map(
    (p, k) => (p + 0.6 * x.bodies[1].p[k]) / 1.6,
  );
  assert.ok(Math.hypot(...center) < 1e-10);
  const phase = Math.atan2(
    x.bodies[1].p[2] - x.bodies[0].p[2],
    x.bodies[1].p[0] - x.bodies[0].p[0],
  );
  assert.ok(Math.abs(phase) < 3e-4);
  assert.ok(
    Math.abs(x.period - 2 * Math.PI * Math.sqrt(64 / (1.6 * G))) < 1e-12,
  );
});
test("Timeline seeking restores exactly the same binary state", () => {
  const x = new Experiment(1.3, true);
  x.seek(17.5);
  const result = structuredClone(x.bodies);
  x.seek(2);
  x.seek(25);
  x.seek(17.5);
  assert.deepEqual(x.bodies, result);
});
test("Changing companion state starts a fresh barycentric model", () => {
  const x = new Experiment(0.6, true);
  x.seek(5);
  x.reset(1.4, true);
  assert.equal(x.tick, 0);
  assert.equal(x.bodies.length, 2);
  assert.ok(Math.abs(x.separation - 4) < 1e-12);
  x.reset(0.6, false);
  x.seek(5);
  assert.deepEqual(x.bodies[0].p, [0, 0, 0]);
  assert.equal(x.bodies.length, 1);
});
test("Unsafe mass, date, observer, time and close encounters fail explicitly", () => {
  assert.throws(() => new Experiment(NaN, true));
  assert.throws(() => new Experiment(20, true));
  const x = new Experiment(0.6, true);
  assert.throws(() => x.seek(Infinity));
  assert.throws(() => x.seek(-1));
  assert.throws(() => x.seek(31));
  x.bodies[1].p = [...x.bodies[0].p];
  assert.throws(() => x.step(), /Close encounter/);
  assert.throws(() => skyTransform(new Date("invalid"), 0, 0));
  assert.throws(() => skyTransform(new Date("2026-01-01Z"), 91, 0));
  assert.throws(() => skyTransform(new Date("1800-01-01Z"), 0, 0));
});
test("Sirius horizontal transform matches Python Astronomy Engine fixtures", () => {
  for (const [utc, lat, lon, alt, az] of [
    ["2000-01-01T12:00Z", 0, 0, -73.262768706, 182.751716671],
    ["2026-01-01T00:00Z", 51.4779, 0, 21.774682502, 179.054891208],
    ["1900-01-01T00:00Z", 40.7128, -74.006, 0.791660808, 112.900102441],
    ["2100-01-01T00:00Z", 40.7128, -74.006, -0.532022159, 111.960032705],
  ]) {
    const [e, u, s] = skyTransform(new Date(utc), lat, lon)(101.2872, -16.7161);
    assert.ok(Math.abs(Math.hypot(e, u, s) - 1) < 1e-12);
    assert.ok(Math.abs((Math.asin(u) * 180) / Math.PI - alt) < 1e-6);
    assert.ok(
      Math.abs((((Math.atan2(e, -s) * 180) / Math.PI + 360) % 360) - az) < 1e-6,
    );
  }
});
test("Equivalent wrapped right ascensions have identical sky directions", () => {
  const f = skyTransform(new Date("2026-01-01T00:00Z"), -33.86, 151.2);
  const a = f(-90, 20),
    b = f(270, 20);
  assert.ok(Math.hypot(...a.map((x, i) => x - b[i])) < 1e-12);
});
test("Timeline endpoint remains loadable for every supported mass", () => {
  for (let m = 2; m <= 20; m++) {
    const x = new Experiment(m / 10, true);
    x.seek(30);
    assert.ok(x.time <= 30);
    const y = new Experiment(m / 10, true);
    y.seek(x.time);
    assert.deepEqual(y.bodies, x.bodies);
  }
});
test("A rejected integration step preserves its last complete state", () => {
  const x = new Experiment(0.6, true);
  x.bodies[1].v = [-1000000, 0, 0];
  const initial = structuredClone(x.bodies);
  x.bodies[1].p = [x.bodies[0].p[0] + 0.001, 0, 0];
  const unsafe = structuredClone(x.bodies);
  assert.throws(() => x.step());
  assert.deepEqual(x.bodies, unsafe);
  assert.equal(x.tick, 0);
});

test("Eccentric orbit matches analytic periapsis, period and conserved angular momentum", async () => {
  const { orbitalElements } = await import("../dist/physics.js");
  const speed = Math.sqrt((G * 1.6) / 4) * 0.7;
  const x = new Experiment(0.6, true, [0, 0, speed]);
  const el = orbitalElements(x.bodies),
    e = x.energy();
  let min = 4;
  x.seek(el.period / 2);
  min = x.separation;
  assert.ok(Math.abs(min - el.periapsis) < 2e-4);
  x.seek(el.period);
  assert.ok(Math.abs(x.separation - 4) < 2e-4);
  assert.ok(Math.abs((x.energy() - e) / e) < 1e-5);
  const r = x.bodies[1].p.map((v, k) => v - x.bodies[0].p[k]);
  const v = x.bodies[1].v.map((v, k) => v - x.bodies[0].v[k]);
  assert.ok(Math.abs(r[0] * v[2] - r[2] * v[0] - 4 * speed) < 1e-10);
});
test("Complete noncircular snapshots round trip through JSON and replay identically", () => {
  for (const mass of [0.2, 0.6, 1.3, 2]) {
    const x = new Experiment(mass, true, [-0.4, 0, 3.7]);
    x.seek(4.1);
    const snapshot = JSON.parse(JSON.stringify(x.snapshot()));
    const y = Experiment.fromSnapshot(snapshot);
    assert.deepEqual(y.snapshot(), snapshot);
    x.seek(9);
    y.seek(9);
    assert.deepEqual(y.bodies, x.bodies);
    y.seek(1);
    y.seek(9);
    assert.deepEqual(y.bodies, x.bodies);
    snapshot.bodies[0].v[0] = 123;
    assert.notEqual(y.bodies[0].v[0], 123);
  }
});
test("Comparison branches preserve source, share initial positions, and remain independent", async () => {
  const { compareTrajectories } = await import("../dist/physics.js");
  const x = new Experiment(0.6, true);
  x.seek(3);
  const s = x.snapshot(),
    saved = structuredClone(s);
  const a = compareTrajectories(s, [0, 0, 3]);
  assert.deepEqual(s, saved);
  assert.deepEqual(x.snapshot(), saved);
  assert.deepEqual(
    a.baseline.start.bodies.map((b) => b.p),
    a.alternative.start.bodies.map((b) => b.p),
  );
  assert.notDeepEqual(a.baseline.end.bodies, a.alternative.end.bodies);
  const baseline = structuredClone(a.baseline);
  a.alternative.path[0].positions[0][0] = 999;
  assert.deepEqual(a.baseline, baseline);
  const y = Experiment.fromSnapshot(a.alternative.start);
  y.seek(a.alternative.end.tick * a.alternative.end.h);
  assert.deepEqual(y.bodies, a.alternative.end.bodies);
});
test("Escaping and radial close-passage outcomes are explicit and replayable", async () => {
  const { compareTrajectories } = await import("../dist/physics.js");
  const x = new Experiment(0.6, true);
  const escape = compareTrajectories(x.snapshot(), [0, 0, 8]);
  assert.equal(escape.alternative.status, "complete");
  assert.ok(escape.alternative.elements.eccentricity > 1);
  assert.ok(escape.alternative.maxEnergyError < 1e-4);
  const radial = compareTrajectories(x.snapshot(), [-2, 0, 0]);
  assert.equal(radial.alternative.status, "unresolved");
  assert.ok(radial.alternative.end.tick * radial.alternative.end.h < 12);
  const y = Experiment.fromSnapshot(radial.alternative.end);
  y.seek(12);
  assert.equal(y.stopped, true);
  assert.deepEqual(y.snapshot(), radial.alternative.end);
  assert.throws(() => new Experiment(0.6, true, [13, 0, 0]));
  assert.throws(() => Experiment.fromSnapshot({ ...x.snapshot(), h: 1 }));
});

test("Return probes verify an excursion and agree with independent 8/10/12-year fixtures", async () => {
  const { probeReturn } = await import("../dist/physics.js");
  const snapshot = new Experiment(0.6, true).snapshot();
  for (const [period, expectedApo] of [
    [8, 5.357],
    [10, 6.858],
    [12, 8.261],
  ]) {
    const circular = new Experiment(0.6, true).period;
    const factor = Math.sqrt(2 - (circular / period) ** (2 / 3));
    const p = probeReturn(snapshot, factor, period + 0.1);
    assert.equal(p.status, "returned");
    assert.ok(Math.abs(p.returnEvent.years - period) < 0.0001);
    assert.ok(Math.abs(p.maxSeparation - expectedApo) < 0.002);
    assert.ok(p.minSeparation >= 3.9999);
    assert.ok(Math.abs(p.returnEvent.separation - 4) < 0.0001);
    assert.ok(p.maxEnergyError < 1e-5);
  }
  assert.equal(
    probeReturn(snapshot, 1, 10).returnEvent,
    null,
    "circular baseline is not an outward excursion",
  );
  assert.equal(
    probeReturn(snapshot, 1.1, 4).returnEvent,
    null,
    "half orbit is not a return",
  );
});
test("Deadline boundary, late, escaping, and impossible probes cannot be ranked as verified returns", async () => {
  const { probeReturn } = await import("../dist/physics.js");
  const x = new Experiment(0.6, true),
    s = x.snapshot(),
    f = Math.sqrt(2 - (x.period / 8) ** (2 / 3));
  assert.equal(probeReturn(s, f, 8).status, "unresolved");
  assert.match(probeReturn(s, f, 8).reason, /deadline/);
  const late = probeReturn(s, 1.2, 10);
  assert.equal(late.analyticBound, true);
  assert.equal(late.returnEvent, null);
  const escape = probeReturn(s, 1.45, 10);
  assert.equal(escape.analyticBound, false);
  assert.equal(escape.returnEvent, null);
  for (const factor of [1, 1.05, 1.1, 1.3])
    assert.notEqual(probeReturn(s, factor, 5).status, "returned");
  for (const h of [undefined, NaN, Infinity, 0, -1])
    assert.throws(() => Experiment.fromSnapshot({ ...s, h }));
});
