import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  Journey,
  V,
  catalogueWorld,
  solveCalibration,
  integrate,
} from "../dist/journey.js";
const features = JSON.parse(
  fs.readFileSync(new URL("../dist/stars.json", import.meta.url)),
).features;
const make = (o = {}) =>
  new Journey(features, { seed: 42, spawnIndex: 123, ...o });
const act = (j, k, o) => j.commit(j.quote(k, o).id);
const calibrated = (o = {}) => {
  const j = make(o);
  j.delegate();
  act(j, "calibrate");
  return j;
};
test("unknown public boundary contains bearings but no seed, identity, position, range, or bearing home", () => {
  const j = make(),
    v = j.view();
  for (const k of [
    "seed",
    "spawnIndex",
    "position",
    "source",
    "home",
    "anchorId",
  ])
    assert.equal(v[k], undefined);
  assert.ok(
    v.observations.every(
      (o) => Object.keys(o).sort().join() === "bearing,label",
    ),
  );
  const q = j.quote("calibrate");
  assert.equal(q.detail.observations, undefined);
  assert.equal(j.view().phase, "unknown");
});
test("first, middle and last catalogue anchors solve from measurements; same seed repeats evidence", () => {
  assert.equal(features.length, 5044);
  for (const i of [0, 2522, 5043]) {
    const j = calibrated({ spawnIndex: i }),
      v = j.view(),
      sol = solveCalibration(v.observations, catalogueWorld(features));
    assert.equal(v.anchorId, features[i].id);
    assert.ok(sol.heldOutResidual < 1e-6);
    assert.ok(V.norm(V.sub(sol.position, v.position)) < 1e-7);
    assert.deepEqual(
      make({ spawnIndex: i }).view(),
      make({ spawnIndex: i }).view(),
    );
  }
});
test("insufficient, duplicate, coplanar and corrupted scans remain unresolved", () => {
  const v = calibrated().view(),
    cat = catalogueWorld(features);
  assert.throws(
    () => solveCalibration(v.observations.slice(0, 3), cat),
    /Unresolved/,
  );
  const corrupt = structuredClone(v.observations);
  corrupt[6].range += 0.01;
  assert.throws(() => solveCalibration(corrupt, cat), /disagree/);
  const dup = structuredClone(v.observations);
  dup[2] = dup[1];
  assert.throws(() => solveCalibration(dup, cat), /Duplicate/);
  const c = [
    [1, 0, 0],
    [0, 1, 0],
    [-1, 0, 0],
    [0, -1, 0],
    [1, 1, 0],
  ].map((p, id) => ({ id, p }));
  const obs = c.map((s) => {
    const d = V.sub(s.p, [0, 0, 2]);
    return {
      catalogueId: s.id,
      range: V.norm(d),
      bearing: V.scale(d, 1 / V.norm(d)),
    };
  });
  assert.throws(() => solveCalibration(obs, c), /Ambiguous/);
});
test("preview is same-state, separates gravity and impulse, and has no debit", () => {
  const j = calibrated(),
    before = j.view(),
    q = j.quote("launch-home"),
    p = j.preview(q.id);
  assert.deepEqual(j.view(), before);
  assert.deepEqual(p.current.path[0], p.proposed.path[0]);
  assert.deepEqual(p.initial.p, before.position);
  assert.deepEqual(p.initial.v, before.velocity);
  assert.ok(V.norm(V.sub(p.current.p, p.gravityOnly.p)) > 0.001);
  assert.ok(V.norm(V.sub(p.gravityOnly.p, p.proposed.p)) > 0.01);
  act(j, "launch-home");
  const after = j.view(),
    endpoint = integrate(
      {
        p: after.position,
        v: after.velocity,
        source: after.source,
        gravity: after.gravity,
      },
      p.years,
    );
  assert.ok(V.norm(V.sub(endpoint.p, p.proposed.p)) < 1e-9);
});
test("raw experiments work before calibration, change velocity, cost fuel, and expose only ship-frame previews", () => {
  const j = make();
  j.delegate();
  const q = j.rawQuote({ impulse: 0.01, gravity: 0 }),
    p = j.preview(q.id);
  assert.deepEqual(p.initial.p, [0, 0, 0]);
  assert.equal(q.cost.fuel, 8.5);
  j.commit(q.id);
  assert.equal(j.view().resources.fuel, 91.5);
  assert.equal(j.view().phase, "unknown");
  assert.equal(j.view().home, undefined);
  assert.throws(() => j.commit(q.id), /Stale/);
});
test("pause/resume preserves gross delegation and invalidates stale pending actions", () => {
  const j = calibrated();
  act(j, "launch-home");
  act(j, "coast");
  act(j, "coast");
  act(j, "coast");
  const q = j.quote("coast"),
    before = j.view();
  j.pause();
  assert.throws(() => j.commit(q.id), /Stale/);
  j.resume();
  assert.deepEqual(j.view().spent, before.spent);
  assert.deepEqual(j.view().budget, before.budget);
  assert.deepEqual(j.view().resources, before.resources);
});
test("less-fuel quote lowers speed and fuel and increases ETA without changing physical state", () => {
  const j = calibrated(),
    a = j.quote("launch-home");
  j.preference("less-fuel");
  const b = j.quote("launch-home");
  assert.ok(b.cost.fuel + b.detail.braking < a.cost.fuel + a.detail.braking);
  assert.ok(b.detail.years > a.detail.years);
  assert.ok(b.detail.speed < a.detail.speed);
  assert.throws(() => j.commit(a.id), /Stale/);
});
test("forged, replayed and revised quotes cannot debit or mint rewards", () => {
  const j = calibrated(),
    q = j.quote("survey");
  q.cost.credits = 0;
  q.reward.fuel = 999;
  j.commit(q.id);
  assert.equal(j.view().resources.credits, 21);
  assert.equal(j.view().resources.fuel, 100);
  assert.throws(() => j.commit(q.id), /Stale/);
  assert.throws(() => j.commit("fake"), /Stale/);
});
test("unaffordable calibration and insufficient arrival reserve are atomic", () => {
  const j = make({ balance: { credits: 5 } });
  j.delegate({ fuel: 75, credits: 5, lifetime: 900 });
  const before = j.view(),
    q = j.quote("calibrate");
  assert.throws(() => j.commit(q.id), /Insufficient credits/);
  assert.deepEqual(j.view(), before);
  const k = make({ balance: { fuel: 20 } });
  k.delegate({ fuel: 20, credits: 20, lifetime: 900 });
  act(k, "calibrate");
  const v = k.view(),
    r = k.quote("launch-home");
  assert.throws(() => k.commit(r.id), /reserve/);
  assert.deepEqual(k.view(), v);
});
test("finite mining journey accounts exactly, depletes once, and requires braking before arrival", () => {
  const j = calibrated();
  act(j, "survey");
  act(j, "launch-stop");
  while (j.view().target) act(j, j.options()[0]);
  const q = j.quote("extract");
  j.commit(q.id);
  assert.deepEqual(j.view().deposit, { fuel: 0, credits: 0 });
  assert.throws(() => j.commit(q.id), /Stale/);
  assert.throws(() => j.quote("extract"), /unavailable/);
  act(j, "launch-home");
  while (j.view().target.remaining > 1e-7) act(j, "coast");
  assert.ok(j.view().homeDistance < 0.002);
  assert.equal(j.view().phase, "travel");
  assert.ok(V.norm(j.view().velocity) > 0.01);
  act(j, "brake");
  const v = j.view();
  assert.equal(v.phase, "arrived");
  assert.equal(V.norm(v.velocity), 0);
  for (const key of ["fuel", "credits", "lifetime"]) {
    const start = { fuel: 100, credits: 30, lifetime: 1000 }[key],
      sum = v.ledger.reduce(
        (n, l) => n - l.cost[key] + (l.reward[key] ?? 0),
        start,
      );
    assert.ok(Math.abs(sum - v.resources[key]) < 1e-8);
    assert.equal(
      v.spent[key],
      v.ledger.reduce((n, l) => n + l.cost[key], 0),
    );
  }
  assert.equal(v.resources.credits, 27);
});
test("declining a purchased report gives no reward and direct home remains reachable", () => {
  const j = calibrated();
  act(j, "survey");
  assert.equal(j.view().resources.credits, 21);
  act(j, "launch-home");
  while (j.view().target) act(j, j.options()[0]);
  assert.equal(j.view().phase, "arrived");
  assert.equal(j.view().resources.credits, 21);
  assert.deepEqual(j.view().deposit, { fuel: 32, credits: 8 });
});
