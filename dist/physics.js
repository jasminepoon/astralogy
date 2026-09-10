export const G = 39.476926408897626;
export class Experiment {
  constructor(mass = 0.6, companion = false) {
    this.reset(mass, companion);
  }
  reset(mass = 0.6, companion = false) {
    if (!Number.isFinite(mass) || mass < 0.2 || mass > 2)
      throw Error("Mass must be 0.2–2 solar masses");
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
        this.h > 0.02 * Math.sqrt(r ** 3 / (G * (1 + this.mass)))
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
    }
    while (this.tick < target && !this.stopped) this.step();
    return this.time;
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
