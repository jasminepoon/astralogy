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
