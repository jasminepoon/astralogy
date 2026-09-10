// Bounded synthetic journey. Catalogue angles are real; all depths, tags and forces are game rules.
export const V = {
  add: (a, b) => a.map((v, i) => v + b[i]),
  sub: (a, b) => a.map((v, i) => v - b[i]),
  scale: (a, s) => a.map((v) => v * s),
  dot: (a, b) => a.reduce((s, v, i) => s + v * b[i], 0),
  cross: (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
  norm: (a) => Math.hypot(...a),
};
const unit = (a) => V.scale(a, 1 / V.norm(a));
const clone = (x) => structuredClone(x);
const rotate = (r, v) => r.map((row) => V.dot(row, v));
const transpose = (r) => r[0].map((_, i) => r.map((row) => row[i]));
const hash = (n) => {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
};
export function catalogueWorld(features) {
  return features.map((f) => {
    const [a, d] = f.geometry.coordinates.map((x) => (x * Math.PI) / 180),
      r = 6 + (12 * hash(Number(f.id))) / 2 ** 32;
    return {
      id: f.id,
      p: [
        r * Math.cos(d) * Math.cos(a),
        r * Math.sin(d),
        r * Math.cos(d) * Math.sin(a),
      ],
      mag: f.properties.mag,
    };
  });
}
function solve3(a, b) {
  a = a.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < 3; i++) {
    let k = i;
    for (let j = i + 1; j < 3; j++)
      if (Math.abs(a[j][i]) > Math.abs(a[k][i])) k = j;
    [a[k], a[i]] = [a[i], a[k]];
    if (Math.abs(a[i][i]) < 1e-7)
      throw Error("Ambiguous geometry: another landmark is needed.");
    const d = a[i][i];
    a[i] = a[i].map((v) => v / d);
    for (let j = 0; j < 3; j++)
      if (j !== i) {
        const s = a[j][i];
        a[j] = a[j].map((v, k) => v - s * a[i][k]);
      }
  }
  return a.map((r) => r[3]);
}
function basis(a, b) {
  const x = unit(a),
    z = unit(V.cross(x, b));
  if (!Number.isFinite(z[0]) || V.norm(V.cross(x, unit(b))) < 0.01)
    throw Error("Unresolved orientation");
  return transpose([x, V.cross(z, x), z]);
}
export function solveCalibration(observations, catalogue) {
  if (observations.length < 5)
    throw Error(
      "Unresolved: four ranges and an independent fifth landmark required.",
    );
  const map = new Map(catalogue.map((s) => [s.id, s.p]));
  if (
    new Set(observations.map((o) => o.catalogueId)).size !== observations.length
  )
    throw Error("Duplicate landmark");
  const pts = observations.map((o) => {
    if (
      !map.has(o.catalogueId) ||
      !Number.isFinite(o.range) ||
      o.range <= 0 ||
      o.bearing.length !== 3 ||
      !o.bearing.every(Number.isFinite) ||
      Math.abs(V.norm(o.bearing) - 1) > 1e-6
    )
      throw Error("Invalid measurement");
    return map.get(o.catalogueId);
  });
  const a = pts[0],
    d = observations[0].range;
  const rows = pts.slice(1, 4).map((b) => V.scale(V.sub(b, a), 2));
  const rhs = pts
    .slice(1, 4)
    .map(
      (b, i) =>
        V.dot(b, b) - V.dot(a, a) + d * d - observations[i + 1].range ** 2,
    );
  const p = solve3(rows, rhs),
    local = basis(observations[0].bearing, observations[1].bearing),
    world = basis(V.sub(pts[0], p), V.sub(pts[1], p));
  const lt = transpose(local),
    r = world.map((row) =>
      lt[0].map((_, j) => row.reduce((s, v, k) => s + v * lt[k][j], 0)),
    );
  const residuals = observations.map((o, i) =>
    V.norm(V.sub(V.add(p, rotate(r, V.scale(o.bearing, o.range))), pts[i])),
  );
  const residual = Math.max(...residuals);
  if (residual > 1e-6)
    throw Error("Observations disagree; position remains unresolved.");
  return {
    position: p,
    orientation: r,
    residual,
    heldOutResidual: Math.max(...residuals.slice(4)),
    landmarks: observations.length,
  };
}
export function integrate(
  snapshot,
  years,
  { gravity = snapshot.gravity, impulse = [0, 0, 0], steps = 400 } = {},
) {
  let p = [...snapshot.p],
    v = V.add(snapshot.v, impulse);
  const path = [p],
    h = years / steps;
  const acc = (p) => {
    const d = V.sub(snapshot.source, p),
      r2 = V.dot(d, d) + 0.04 ** 2;
    return V.scale(d, (gravity * 0.00008) / r2 ** 1.5);
  };
  for (let i = 0; i < steps; i++) {
    v = V.add(v, V.scale(acc(p), h / 2));
    p = V.add(p, V.scale(v, h));
    v = V.add(v, V.scale(acc(p), h / 2));
    if (i % 4 === 3) path.push(p);
  }
  return { p, v, path };
}
export class Journey {
  #catalogue;
  #truth;
  #quotes = new Map();
  #counter = 0;
  #state;
  constructor(
    features,
    { seed = Math.floor(Math.random() * 2 ** 32), spawnIndex, balance } = {},
  ) {
    this.#catalogue = catalogueWorld(features);
    const index = spawnIndex ?? hash(seed) % this.#catalogue.length;
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= this.#catalogue.length
    )
      throw Error("Invalid spawn index");
    const anchor = this.#catalogue[index],
      p = V.add(anchor.p, [0.22, 0.16, -0.18]),
      angle = (hash(seed + 7) / 2 ** 32) * Math.PI * 2,
      c = Math.cos(angle),
      s = Math.sin(angle),
      r = [
        [c, 0, s],
        [0, 1, 0],
        [-s, 0, c],
      ];
    this.#truth = { index, p, r };
    this.#state = {
      revision: 0,
      phase: "unknown",
      p,
      v: [0.003, -0.002, 0.004],
      source: anchor.p,
      gravity: 1,
      gravityUntil: 1000,
      time: 0,
      resources: { fuel: 100, credits: 30, lifetime: 1000, ...balance },
      spent: { fuel: 0, credits: 0, lifetime: 0 },
      budget: { fuel: 75, credits: 20, lifetime: 900 },
      active: false,
      preference: "balanced",
      calibration: null,
      report: null,
      deposit: { fuel: 32, credits: 8 },
      target: null,
      ledger: [],
      observations: [],
    };
    this.#state.observations = this.#measure(false);
  }
  #measure(identified) {
    const { p } = this.#state;
    const rt = transpose(this.#truth.r);
    return this.#catalogue
      .map((s) => ({ s, d: V.norm(V.sub(s.p, p)) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 8)
      .map(({ s, d }, i) => ({
        label: `L${i + 1}`,
        bearing: unit(rotate(rt, V.sub(s.p, p))),
        ...(identified ? { catalogueId: s.id, range: d } : {}),
      }));
  }
  get revision() {
    return this.#state.revision;
  }
  view() {
    const s = this.#state;
    const base = {
      revision: s.revision,
      phase: s.phase,
      resources: clone(s.resources),
      spent: clone(s.spent),
      budget: clone(s.budget),
      active: s.active,
      preference: s.preference,
      time: s.time,
      observations: clone(s.observations),
      ledger: clone(s.ledger),
      calibration: clone(s.calibration),
      report: clone(s.report),
    };
    if (s.calibration)
      Object.assign(base, {
        position: [...s.p],
        velocity: [...s.v],
        gravity: s.gravity,
        source: [...s.source],
        home: [0, 0, 0],
        homeDistance: V.norm(s.p),
        target: clone(s.target),
        deposit: clone(s.deposit),
        anchorId: this.#catalogue[this.#truth.index].id,
      });
    return base;
  }
  delegate(budget = this.#state.budget) {
    if (
      !["fuel", "credits", "lifetime"].every(
        (k) =>
          Number.isFinite(budget[k]) &&
          budget[k] >= 0 &&
          budget[k] <= this.#state.resources[k],
      )
    )
      throw Error("Budget must fit available resources");
    this.#state.budget = clone(budget);
    this.#state.spent = { fuel: 0, credits: 0, lifetime: 0 };
    this.#state.active = true;
    this.#invalidate();
  }
  resume() {
    this.#state.active = true;
    this.#invalidate();
  }
  pause() {
    this.#state.active = false;
    this.#invalidate();
  }
  preference(value) {
    if (!["balanced", "less-fuel", "faster", "skip-stop"].includes(value))
      throw Error("Unsupported preference");
    this.#state.preference = value;
    this.#invalidate();
  }
  #invalidate() {
    this.#state.revision++;
    this.#quotes.clear();
  }
  options() {
    const s = this.#state;
    if (s.phase === "unknown") return ["calibrate"];
    if (s.phase === "arrived") return [];
    if (s.target) {
      if (s.target.remaining > 1e-7) return ["coast"];
      return ["brake"];
    }
    if (s.phase === "at-stop" && s.deposit.fuel > 0)
      return ["extract", "launch-home"];
    return [
      ...(!s.report && s.deposit.fuel > 0 ? ["survey"] : []),
      ...(s.report && s.deposit.fuel > 0 ? ["launch-stop"] : []),
      "launch-home",
    ];
  }
  quote(kind, { speed } = {}) {
    const s = this.#state;
    if (!this.options().includes(kind))
      throw Error("Action unavailable in current state");
    speed ??=
      s.preference === "less-fuel"
        ? 0.025
        : s.preference === "faster"
          ? 0.065
          : 0.04;
    if (!Number.isFinite(speed) || speed < 0.02 || speed > 0.07)
      throw Error("Speed outside supported bounds");
    let cost = { fuel: 0, credits: 0, lifetime: 0 },
      reward = { fuel: 0, credits: 0 },
      detail = {},
      effect = {};
    if (kind === "calibrate") {
      cost.credits = 6;
      const observations = this.#measure(true);
      const solution = solveCalibration(observations, this.#catalogue);
      detail = {
        summary:
          "Resolve landmark tags, range four stars, recover position and attitude, then test four independent landmarks.",
        landmarks: 8,
      };
      effect = { observations, solution };
    }
    if (kind === "survey") {
      cost.credits = 3;
      const home = unit(V.scale(s.p, -1)),
        side = unit(
          V.cross(home, Math.abs(home[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]),
        );
      const p = V.add(s.p, V.add(V.scale(home, 0.35), V.scale(side, 0.14)));
      detail = {
        position: p,
        velocity: [0, 0, 0],
        radiusKm: 100,
        operationRadiusLy: 0.003,
        spinPeriodHours: 8,
        extractionSite: "Polar patch A",
        corridor: V.add(p, V.scale(side, 0.02)),
        gross: clone(s.deposit),
        extractionCost: { fuel: 3, credits: 2, lifetime: 2 },
        summary:
          "Stationary asteroid; approach its polar corridor, brake before extraction. Deposit measured by synthetic assay.",
      };
      effect = { report: detail };
    }
    if (kind.startsWith("launch-")) {
      const destination =
          kind === "launch-stop" ? s.report.position : [0, 0, 0],
        delta = V.sub(destination, s.p),
        distance = V.norm(delta);
      if (distance < 1e-7) throw Error("Already at target");
      const velocity = V.scale(delta, speed / distance),
        impulse = V.sub(velocity, s.v),
        gravityCost = s.gravity === 0 ? 0 : 6;
      cost.fuel = V.norm(impulse) * 250 + gravityCost;
      const years = distance / speed,
        braking = speed * 250;
      if (
        years + 2 > s.resources.lifetime ||
        years + 2 > s.budget.lifetime - s.spent.lifetime
      )
        throw Error("Insufficient lifetime for this route");
      // Reserve braking at the stop, a minimum onward launch and home braking; mining reward never finances upfront costs.
      const reserve =
        kind === "launch-stop" ? braking + 3 + 2 * 0.025 * 250 : braking;
      detail = {
        destination,
        distance,
        speed,
        years,
        braking,
        reserve,
        gravityBefore: s.gravity,
        gravityAfter: 0,
        gravityDuration: s.resources.lifetime,
        gravityCost,
        impulse,
        summary:
          "Suppress the local attraction, then change velocity. Coast in the resulting inertial frame.",
      };
      if (kind === "launch-stop") {
        const onwardYears = V.norm(destination) / speed,
          totalFuel = cost.fuel + braking + 3 + 2 * speed * 250;
        detail.miningComparison = {
          totalFuelSpent: totalFuel,
          grossFuel: s.deposit.fuel,
          netFuel: s.deposit.fuel - totalFuel,
          totalCreditsSpent: 5,
          grossCredits: s.deposit.credits,
          netCredits: s.deposit.credits - 5,
          totalYears: years + 2 + onwardYears,
        };
      }
      effect = {
        v: velocity,
        gravity: 0,
        target: {
          name: kind === "launch-stop" ? "asteroid" : "home",
          p: destination,
          remaining: years,
          speed,
        },
      };
    }
    if (kind === "coast") {
      const years = Math.min(50, s.target.remaining);
      cost.lifetime = years;
      const result = integrate(s, years, { steps: 100 });
      detail = {
        years,
        remaining: Math.max(0, s.target.remaining - years),
        summary:
          "Advance to the next checkpoint along the computed trajectory.",
      };
      effect = { p: result.p, v: result.v, remaining: detail.remaining };
    }
    if (kind === "brake") {
      const distance = V.norm(V.sub(s.p, s.target.p));
      if (distance > 0.002) throw Error("Outside arrival corridor");
      cost.fuel = V.norm(s.v) * 250;
      detail = {
        distance,
        speed: V.norm(s.v),
        summary: "Cancel relative velocity and verify position and speed.",
      };
      effect = {
        v: [0, 0, 0],
        phase: s.target.name === "home" ? "arrived" : "at-stop",
      };
    }
    if (kind === "extract") {
      if (
        V.norm(s.v) > 0.00001 ||
        V.norm(V.sub(s.p, s.report.position)) > 0.003
      )
        throw Error(
          "Mining requires a stopped ship inside the extraction corridor",
        );
      cost = { fuel: 3, credits: 2, lifetime: 2 };
      reward = clone(s.deposit);
      detail = {
        gross: reward,
        net: {
          fuel: reward.fuel - cost.fuel,
          credits: reward.credits - cost.credits,
        },
        summary:
          "Two-year extraction from finite polar patch A. Report fee is already spent.",
      };
      effect = { deplete: true };
    }
    const q = {
      id: `q${++this.#counter}`,
      revision: s.revision,
      kind,
      cost,
      reward,
      detail,
    };
    this.#quotes.set(q.id, { q: clone(q), effect });
    return clone(q);
  }
  rawQuote({ impulse = 0, gravity = this.#state.gravity } = {}) {
    const s = this.#state;
    if (s.target || s.phase === "arrived")
      throw Error(
        "Interrupt and finish the current flight leg before a raw experiment",
      );
    if (
      !Number.isFinite(impulse) ||
      Math.abs(impulse) > 0.02 ||
      ![0, 1].includes(gravity)
    )
      throw Error("Unsupported experiment");
    const dv = rotate(this.#truth.r, [impulse, 0, 0]);
    const q = {
      id: `q${++this.#counter}`,
      revision: s.revision,
      kind: "experiment",
      cost: {
        fuel: Math.abs(impulse) * 250 + (gravity !== s.gravity ? 6 : 0),
        credits: 0,
        lifetime: 0,
      },
      reward: { fuel: 0, credits: 0 },
      detail: {
        impulse: dv,
        gravityAfter: gravity,
        gravityDuration: s.resources.lifetime,
        summary:
          "Ship-axis impulse and local gravity multiplier; no homeward claim.",
      },
    };
    this.#quotes.set(q.id, {
      q: clone(q),
      effect: { v: V.add(s.v, dv), gravity },
    });
    return { ...clone(q), detail: { ...q.detail, impulse: [impulse, 0, 0] } };
  }
  preview(id) {
    const record = this.#quotes.get(id);
    if (!record || record.q.revision !== this.revision)
      throw Error("Stale quote");
    const s = this.#state,
      q = record.q;
    if (!q.kind.startsWith("launch-") && q.kind !== "experiment") return null;
    const years = Math.min(q.detail.years ?? 2, 8);
    const result = {
      years,
      initial: { p: [...s.p], v: [...s.v] },
      current: integrate(s, years),
      gravityOnly: integrate(s, years, { gravity: 0 }),
      proposed: integrate(s, years, {
        gravity: q.detail.gravityAfter,
        impulse: q.detail.impulse,
      }),
    };
    if (!s.calibration) {
      const rt = transpose(this.#truth.r),
        local = (p) => rotate(rt, V.sub(p, s.p));
      for (const key of ["current", "gravityOnly", "proposed"]) {
        result[key].path = result[key].path.map(local);
        result[key].p = local(result[key].p);
        result[key].v = rotate(rt, result[key].v);
      }
      result.initial = { p: [0, 0, 0], v: rotate(rt, s.v) };
    }
    return result;
  }
  commit(id) {
    const record = this.#quotes.get(id),
      s = this.#state;
    if (!record || record.q.revision !== s.revision)
      throw Error("Stale or already committed quote");
    if (!s.active) throw Error("Astra is paused; delegate before committing");
    const { q, effect } = record;
    for (const key of ["fuel", "credits", "lifetime"]) {
      if (s.resources[key] + 1e-9 < q.cost[key])
        throw Error(`Insufficient ${key}; rewards cannot pay upfront costs`);
      if (s.spent[key] + q.cost[key] > s.budget[key] + 1e-9)
        throw Error(`Delegated ${key} budget exceeded`);
    }
    const reserve =
      q.detail.reserve ??
      (s.target && q.kind !== "brake"
        ? s.target.speed * 250
        : s.calibration && q.kind !== "brake" && q.kind !== "calibrate"
          ? 2 * 0.025 * 250
          : 0);
    if (
      s.resources.fuel - q.cost.fuel + 1e-9 < reserve ||
      s.budget.fuel - s.spent.fuel - q.cost.fuel + 1e-9 < reserve
    )
      throw Error("Arrival fuel reserve would be breached");
    for (const key of ["fuel", "credits", "lifetime"]) {
      s.resources[key] -= q.cost[key];
      s.spent[key] += q.cost[key];
    }
    s.resources.fuel += q.reward.fuel;
    s.resources.credits += q.reward.credits;
    s.time += q.cost.lifetime;
    if (q.kind === "calibrate") {
      s.calibration = effect.solution;
      s.p = [...effect.solution.position];
      s.observations = effect.observations;
      s.phase = "calibrated";
    }
    if (q.kind === "survey") s.report = clone(effect.report);
    if (q.kind === "experiment") {
      s.v = effect.v;
      s.gravity = effect.gravity;
    }
    if (q.kind.startsWith("launch-")) {
      s.v = effect.v;
      s.gravity = effect.gravity;
      s.target = effect.target;
      s.phase = "travel";
    }
    if (q.kind === "coast") {
      s.p = effect.p;
      s.v = effect.v;
      s.target.remaining = effect.remaining;
    }
    if (q.kind === "brake") {
      s.v = effect.v;
      s.phase = effect.phase;
      s.target = null;
      if (s.phase === "arrived") s.active = false;
      if (s.phase === "arrived" && (V.norm(s.p) > 0.002 || V.norm(s.v) > 1e-5))
        throw Error("Arrival verification failed");
    }
    if (effect.deplete) {
      s.deposit = { fuel: 0, credits: 0 };
      s.phase = "mined";
    }
    s.ledger.push({
      sequence: s.ledger.length + 1,
      kind: q.kind,
      cost: clone(q.cost),
      reward: clone(q.reward),
      balance: clone(s.resources),
      time: s.time,
    });
    this.#invalidate();
    return this.view();
  }
}
