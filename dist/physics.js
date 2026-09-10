export const G = 39.476926408897626;
export class Experiment {
  constructor(mass = 0.6, companion = false, relativeVelocity = null) {
    this.reset(mass, companion, relativeVelocity);
  }
  reset(mass = 0.6, companion = false, relativeVelocity = null) {
    if (!Number.isFinite(mass) || mass < 0.2 || mass > 2)
      throw Error("Mass must be 0.2–2 solar masses");
    if (typeof companion !== "boolean")
      throw Error("Companion must be a boolean");
    this.mass = mass;
    this.companion = companion;
    this.period = 2 * Math.PI * Math.sqrt(64 / (G * (1 + mass)));
    this.h = this.period / 2048;
    this.tick = 0;
    this.stopped = false;
    const v = Math.sqrt((G * (1 + mass)) / 4);
    this.bodies = companion
      ? [
          {
            m: 1,
            p: [(-4 * mass) / (1 + mass), 0, 0],
            v: [0, 0, (-v * mass) / (1 + mass)],
          },
          { m: mass, p: [4 / (1 + mass), 0, 0], v: [0, 0, v / (1 + mass)] },
        ]
      : [{ m: 1, p: [0, 0, 0], v: [0, 0, 0] }];
    if (relativeVelocity !== null) {
      if (
        !companion ||
        !validVector(relativeVelocity) ||
        Math.hypot(...relativeVelocity) > 12
      )
        throw Error(
          "Relative velocity must be a finite vector of at most 12 AU/year for a binary",
        );
      for (let k = 0; k < 3; k++) {
        this.bodies[0].v[k] = (-relativeVelocity[k] * mass) / (1 + mass);
        this.bodies[1].v[k] = relativeVelocity[k] / (1 + mass);
      }
    }
    if (companion) {
      const elements = orbitalElements(this.bodies);
      const q = Math.max(0.02, elements.periapsis);
      const mu = G * (1 + mass);
      const vp = Math.sqrt(Math.max(0, 2 * (elements.specificEnergy + mu / q)));
      this.h = Math.max(
        this.period / 65536,
        Math.min(
          this.h,
          0.008 * Math.sqrt(q ** 3 / mu),
          (0.008 * q) / Math.max(vp, 1e-12),
        ),
      );
    }
    this.reason = null;
    this.initial = structuredClone(this.bodies);
    this.checkpoints = new Map([[0, structuredClone(this.bodies)]]);
  }
  acceleration() {
    const a = this.bodies.map(() => [0, 0, 0]);
    if (this.companion) {
      const d = this.bodies[1].p.map((x, i) => x - this.bodies[0].p[i]),
        r = Math.hypot(...d);
      if (
        !Number.isFinite(r) ||
        r < 0.02 ||
        this.h > 0.02 * Math.sqrt(r ** 3 / (G * (1 + this.mass))) ||
        this.h *
          Math.hypot(
            ...this.bodies[1].v.map((v, k) => v - this.bodies[0].v[k]),
          ) >
          0.02 * r
      ) {
        this.stopped = true;
        throw Error(
          "Close encounter: experiment paused before unresolved contact.",
        );
      }
      for (let k = 0; k < 3; k++) {
        a[0][k] = (G * this.mass * d[k]) / r ** 3;
        a[1][k] = (-G * d[k]) / r ** 3;
      }
    }
    return a;
  }
  step() {
    if (this.stopped) return;
    const before = structuredClone(this.bodies);
    try {
      let a = this.acceleration();
      for (let j = 0; j < this.bodies.length; j++)
        for (let k = 0; k < 3; k++) {
          this.bodies[j].v[k] += (a[j][k] * this.h) / 2;
          this.bodies[j].p[k] += this.bodies[j].v[k] * this.h;
        }
      a = this.acceleration();
      for (let j = 0; j < this.bodies.length; j++)
        for (let k = 0; k < 3; k++)
          this.bodies[j].v[k] += (a[j][k] * this.h) / 2;
      this.tick++;
      if (this.tick % 256 === 0)
        this.checkpoints.set(this.tick, structuredClone(this.bodies));
    } catch (e) {
      this.bodies = before;
      this.stopped = true;
      this.reason = e.message;
      throw e;
    }
  }
  seek(years) {
    if (!Number.isFinite(years) || years < 0 || years > 30)
      throw Error("Time must be between 0 and 30 years");
    const target = Math.min(
      Math.floor(30 / this.h),
      Math.round(years / this.h),
    );
    if (target < this.tick) {
      const t = Math.floor(target / 256) * 256;
      const key = this.checkpoints.has(t) ? t : 0;
      this.bodies = structuredClone(this.checkpoints.get(key));
      this.tick = key;
      this.stopped = false;
      this.reason = null;
    }
    while (this.tick < target && !this.stopped) this.step();
    return this.time;
  }
  snapshot() {
    return structuredClone({
      modelVersion: MODEL_VERSION,
      mass: this.mass,
      companion: this.companion,
      h: this.h,
      tick: this.tick,
      stopped: this.stopped,
      reason: this.reason,
      initial: this.initial,
      bodies: this.bodies,
    });
  }
  static fromSnapshot(s) {
    if (
      !s ||
      s.modelVersion !== MODEL_VERSION ||
      typeof s.companion !== "boolean" ||
      !validBodies(s.initial, s.mass, s.companion) ||
      !validBodies(s.bodies, s.mass, s.companion) ||
      !Number.isFinite(s.h) ||
      s.h <= 0 ||
      !Number.isInteger(s.tick) ||
      s.tick < 0 ||
      typeof s.stopped !== "boolean" ||
      !(s.reason === null || typeof s.reason === "string")
    )
      throw Error("Invalid body snapshot");
    const v = s.companion
      ? s.initial[1].v.map((v, k) => v - s.initial[0].v[k])
      : null;
    const x = new Experiment(s.mass, s.companion, v);
    if (
      Math.abs(s.h - x.h) > 1e-14 * x.h ||
      s.tick * s.h > 30 ||
      s.initial.some(
        (b, i) =>
          b.p.some((v, k) => v !== x.initial[i].p[k]) ||
          b.v.some((v, k) => Math.abs(v - x.initial[i].v[k]) > 1e-14),
      )
    )
      throw Error("Unsupported snapshot settings");
    x.h = s.h;
    x.initial = structuredClone(s.initial);
    x.checkpoints = new Map([[0, structuredClone(s.initial)]]);
    x.bodies = structuredClone(s.bodies);
    x.tick = s.tick;
    x.stopped = s.stopped;
    x.reason = s.reason;
    return x;
  }
  get time() {
    return this.tick * this.h;
  }
  get separation() {
    return this.companion
      ? Math.hypot(...this.bodies[0].p.map((x, i) => x - this.bodies[1].p[i]))
      : 0;
  }
  energy() {
    let e = this.bodies.reduce(
      (s, b) => s + 0.5 * b.m * b.v.reduce((s, x) => s + x * x, 0),
      0,
    );
    return this.companion ? e - (G * this.mass) / this.separation : e;
  }
}

export const MODEL_VERSION = "newtonian-binary-v2";
const validVector = (v) =>
  Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const validBodies = (b, mass, companion) =>
  Array.isArray(b) &&
  b.length === (companion ? 2 : 1) &&
  b.every(
    (x, i) =>
      x && x.m === (i ? mass : 1) && validVector(x.p) && validVector(x.v),
  );
export function orbitalElements(bodies) {
  const r = bodies[1].p.map((v, k) => v - bodies[0].p[k]);
  const v = bodies[1].v.map((v, k) => v - bodies[0].v[k]);
  const mu = G * (bodies[0].m + bodies[1].m),
    distance = Math.hypot(...r);
  const cross = [
    r[1] * v[2] - r[2] * v[1],
    r[2] * v[0] - r[0] * v[2],
    r[0] * v[1] - r[1] * v[0],
  ];
  const h2 = cross.reduce((s, x) => s + x * x, 0);
  const specificEnergy = v.reduce((s, x) => s + x * x, 0) / 2 - mu / distance;
  const eccentricity = Math.sqrt(
    Math.max(0, 1 + (2 * specificEnergy * h2) / mu ** 2),
  );
  return {
    specificEnergy,
    eccentricity,
    periapsis: h2 / (mu * (1 + eccentricity)),
    period:
      specificEnergy < 0
        ? 2 * Math.PI * Math.sqrt((-mu / (2 * specificEnergy)) ** 3 / mu)
        : null,
  };
}
export function compareTrajectories(snapshot, relativeVelocity, horizon = 12) {
  if (!Number.isFinite(horizon) || horizon <= 0 || horizon > 30)
    throw Error("Comparison horizon must be 0–30 years");
  const source = Experiment.fromSnapshot(snapshot);
  if (!source.companion) throw Error("Add a companion to compare orbits");
  const originalV = source.initial[1].v.map(
    (v, k) => v - source.initial[0].v[k],
  );
  return {
    modelVersion: MODEL_VERSION,
    horizon,
    baseline: run(new Experiment(source.mass, true, originalV)),
    alternative: run(new Experiment(source.mass, true, relativeVelocity)),
  };
  function run(x) {
    const start = x.snapshot(),
      energy = x.energy(),
      elements = orbitalElements(x.bodies);
    let minSeparation = x.separation,
      maxEnergyError = 0;
    const path = [{ time: 0, positions: x.bodies.map((b) => [...b.p]) }];
    const stride = Math.max(1, Math.ceil(horizon / x.h / 1200));
    const steps = Math.min(Math.floor(horizon / x.h), 250000);
    for (let i = 0; i < steps; i++) {
      try {
        x.step();
      } catch {
        break;
      }
      minSeparation = Math.min(minSeparation, x.separation);
      maxEnergyError = Math.max(
        maxEnergyError,
        Math.abs(x.energy() - energy) / ((G * x.mass) / 4),
      );
      if (x.tick % stride === 0)
        path.push({ time: x.time, positions: x.bodies.map((b) => [...b.p]) });
    }
    const budgetLimited = !x.stopped && x.tick < Math.floor(horizon / x.h);
    const inaccurate = maxEnergyError > 1e-4;
    path.push({ time: x.time, positions: x.bodies.map((b) => [...b.p]) });
    return {
      start,
      end: x.snapshot(),
      elements,
      path,
      minSeparation,
      maxEnergyError,
      status:
        x.stopped || budgetLimited || inaccurate ? "unresolved" : "complete",
      reason:
        x.reason ||
        (budgetLimited
          ? "Integration budget reached"
          : inaccurate
            ? "Energy tolerance exceeded"
            : null),
    };
  }
}

// Return means a full relative revolution through the launch ray, within 0.01 AU.
export function probeReturn(snapshot, speedFactor, deadlineYears) {
  const source = Experiment.fromSnapshot(snapshot);
  if (
    !source.companion ||
    !Number.isFinite(speedFactor) ||
    speedFactor < 1 ||
    speedFactor > 1.5 ||
    !Number.isFinite(deadlineYears) ||
    deadlineYears < 1 ||
    deadlineYears > 30
  )
    throw Error(
      "Return probes require a binary, speed factor 1–1.5 and deadline 1–30 years",
    );
  const speed = Math.sqrt((G * (1 + source.mass)) / 4) * speedFactor;
  const x = new Experiment(source.mass, true, [0, 0, speed]),
    start = x.snapshot();
  const elements = orbitalElements(x.bodies),
    energy = x.energy(),
    scale = (G * x.mass) / 4;
  let minSeparation = 4,
    maxSeparation = 4,
    maxEnergyError = 0,
    halfTurn = false,
    returnEvent = null,
    eventRejected = false;
  const path = [{ time: 0, positions: x.bodies.map((b) => [...b.p]) }];
  const target = Math.floor(deadlineYears / x.h),
    steps = Math.min(target, 250000),
    stride = Math.max(1, Math.ceil(steps / 1000));
  let prior = [4, 0, 0];
  for (let i = 0; i < steps; i++) {
    try {
      x.step();
    } catch {
      break;
    }
    const r = x.bodies[1].p.map((v, k) => v - x.bodies[0].p[k]);
    minSeparation = Math.min(minSeparation, x.separation);
    maxSeparation = Math.max(maxSeparation, x.separation);
    maxEnergyError = Math.max(
      maxEnergyError,
      Math.abs(x.energy() - energy) / scale,
    );
    if (r[0] < 0) halfTurn = true;
    if (
      !returnEvent &&
      !eventRejected &&
      maxSeparation > 4.01 &&
      halfTurn &&
      prior[2] < 0 &&
      r[2] >= 0 &&
      r[0] > 0
    ) {
      const f = -prior[2] / (r[2] - prior[2]);
      const separation = Math.hypot(...prior.map((v, k) => v + f * (r[k] - v)));
      if (Math.abs(separation - 4) <= 0.01)
        returnEvent = {
          years: (x.tick - 1 + f) * x.h,
          bracketEnd: x.time,
          separation,
          toleranceAU: 0.01,
        };
      else eventRejected = true;
    }
    prior = r;
    if (x.tick % stride === 0)
      path.push({ time: x.time, positions: x.bodies.map((b) => [...b.p]) });
  }
  path.push({ time: x.time, positions: x.bodies.map((b) => [...b.p]) });
  const boundaryUncertain =
    elements.period !== null &&
    maxSeparation > 4.01 &&
    (returnEvent
      ? deadlineYears - returnEvent.years < 2 * x.h
      : Math.abs(elements.period - deadlineYears) < 2 * x.h);
  const unresolved =
    x.stopped ||
    x.tick < target ||
    maxEnergyError > 1e-4 ||
    eventRejected ||
    boundaryUncertain;
  return {
    speedFactor,
    deadlineYears,
    start,
    end: x.snapshot(),
    elements,
    path,
    minSeparation,
    maxSeparation,
    maxEnergyError,
    returnEvent,
    status: unresolved
      ? "unresolved"
      : returnEvent && minSeparation >= 3.99
        ? "returned"
        : "no-return-observed",
    reason:
      x.reason ||
      (x.tick < target
        ? "Integration budget reached"
        : maxEnergyError > 1e-4
          ? "Energy tolerance exceeded"
          : eventRejected
            ? "Return position outside tolerance"
            : boundaryUncertain
              ? "Return near deadline: timing unresolved at this step size"
              : null),
    analyticBound: elements.specificEnergy < 0,
  };
}
