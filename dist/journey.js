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
// One clock and force evaluator for previews, passive tracers and committed flight.
export const FIELD_TICK = 1 / 512;
export const FIELD_DURATION = Math.PI / 2;
export function forceAt(snapshot, p, time, gravity = snapshot.gravity) {
  const f = snapshot.field;
  if (f && time >= f.start && time < f.until && V.norm(V.sub(p, f.origin)) <= f.radius) {
    return V.scale(V.sub(f.center, p), f.strength);
  }
  const d = V.sub(snapshot.source, p), r2 = V.dot(d, d) + 0.04 ** 2;
  return V.scale(d, gravity * .00008 / r2 ** 1.5);
}
export function integrate(snapshot, years, {gravity=snapshot.gravity, impulse=[0,0,0], dt=FIELD_TICK}={}) {
  if(!Number.isFinite(years)||years<0||!Number.isFinite(dt)||dt<=0||dt>.02)throw Error('Invalid integration interval');
  let p=[...snapshot.p],v=V.add(snapshot.v,impulse),elapsed=0;
  const start=snapshot.time??0,path=[p],sample=Math.max(years/120,dt);let nextSample=sample;
  while(elapsed<years-1e-12){
    const time=start+elapsed,f=snapshot.field;
    const active=f&&time<f.until-1e-12&&time>=f.start-1e-12;
    if(!active&&gravity===0){
      const remaining=years-elapsed,base=[...p];
      for(let i=1;i<=24;i++)path.push(V.add(base,V.scale(v,remaining*i/24)));
      p=V.add(base,V.scale(v,remaining));elapsed=years;break;
    }
    let end=Math.min(start+years,(Math.floor((time+1e-10)/dt)+1)*dt);
    if(active)end=Math.min(end,f.until);
    const h=end-time;if(h<1e-12){elapsed=years;break;}
    // A step lies entirely on one side of expiry; both kicks use that force.
    const mid=time+h/2;
    v=V.add(v,V.scale(forceAt(snapshot,p,mid,gravity),h/2));
    p=V.add(p,V.scale(v,h));
    v=V.add(v,V.scale(forceAt(snapshot,p,mid,gravity),h/2));
    elapsed=end-start;
    if(elapsed>=nextSample-1e-12){path.push(p);nextSample+=sample;}
  }
  if(V.norm(V.sub(path.at(-1),p))>0)path.push(p);
  return {p,v,path};
}
export function closestApproach(p,v,target){const d=V.sub(p,target),v2=V.dot(v,v);if(v2<1e-16)return {years:Infinity,miss:V.norm(d)};const years=-V.dot(d,v)/v2;return {years,miss:V.norm(V.add(d,V.scale(v,years)))};}
export class Journey {
  #catalogue;
  #truth;
  #quotes = new Map();
  #counter = 0;
  #state;
  #attempt=null;
  #undo=null;
  #lights=new Map();
  #lightKeys=new Map();
  constructor(
    features,
    { seed = Math.floor(Math.random() * 2 ** 32), spawnIndex, balance, velocity, mode = "drive" } = {},
  ) {
    this.#catalogue = catalogueWorld(features);
    for(const star of this.#catalogue){const token=crypto.randomUUID();this.#lights.set(token,star);this.#lightKeys.set(star.id,token);}
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
      objective: "home",
      asteroids: [
        {id:"cinder",name:"Cinder",offset:[.35,.14],fuel:32,credits:8},
        {id:"tumble",name:"Tumble",offset:[.65,-.18],fuel:24,credits:6},
        {id:"oddity",name:"Oddity",offset:[.85,.24],fuel:28,credits:7},
      ].map(a=>{const h=unit(V.scale(p,-1)),side=unit(V.cross(h,Math.abs(h[1])<.9?[0,1,0]:[1,0,0]));return {id:a.id,name:a.name,position:V.add(p,V.add(V.scale(h,a.offset[0]),V.scale(side,a.offset[1]))),deposit:{fuel:a.fuel,credits:a.credits}};}),
      mode,
      phase: "unknown",
      p,
      v: velocity ? [...velocity] : [0.003, -0.002, 0.004],
      field:null,
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
      identifiedLights:[],
      tagCredits:0,
      report: null,
      deposit: { fuel: 32, credits: 8 },
      target: null,
      ledger: [],
      observations: [],
    };
    if(!this.#state.v.every(Number.isFinite)||this.#state.v.length!==3||V.norm(this.#state.v)>.2)throw Error('Invalid initial velocity');
    this.#state.destinationStar={id:anchor.id,name:`HIP ${anchor.id}`,cataloguePosition:clone(anchor.p),position:V.add(anchor.p,V.scale(unit(V.sub(p,anchor.p)),.01))};
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
  sky(){const rt=transpose(this.#truth.r);return this.#catalogue.map(star=>({observationId:this.#lightKeys.get(star.id),bearing:unit(rotate(rt,V.sub(star.p,this.#state.p))),brightness:Math.max(.15,Math.min(1,(7-star.mag)/6))})).sort((a,b)=>a.bearing[0]-b.bearing[0]);}
  shipVector(v){if(!this.#state.calibration)throw Error('Orientation unresolved');return rotate(transpose(this.#state.calibration.orientation),v);}
  get revision() {
    return this.#state.revision;
  }
  view() {
    const s = this.#state;
    const base = {
      revision: s.revision,
      mode: s.mode,
      objective:s.objective,
      phase: s.phase,
      resources: clone(s.resources),
      spent: clone(s.spent),
      budget: clone(s.budget),
      active: s.active,
      preference: s.preference,
      time: s.time,
      localPosition:rotate(transpose(this.#truth.r),V.sub(s.p,this.#truth.p)),
      canUndo:!!this.#undo,
      observations: clone(s.observations),
      ledger: clone(s.ledger),
      calibration: clone(s.calibration),
      identifiedLights:clone(s.identifiedLights),
      calibrationCredits:6-Math.min(1,s.tagCredits),
      report: clone(s.report),
    };
    if (s.calibration)
      Object.assign(base, {
        position: [...s.p],
        velocity: [...s.v],
        gravity: s.gravity,
        source: [...s.source],
        field:clone(s.field),
        home: [0, 0, 0],
        homeDistance: V.norm(s.p),
        target: clone(s.target),
        deposit: clone(s.deposit),
        asteroids: clone(s.asteroids),
        destinationStar:clone(s.destinationStar),
        anchorId: this.#catalogue[this.#truth.index].id,
      });
    return base;
  }
  #boundary(){
    const s=this.#state;
    if(!s.calibration||s.phase==='arrived')throw Error('Locate the ship before changing the mission.');
    if(s.active)throw Error('Interrupt the flight before changing the mission.');
    if(s.field&&s.time<s.field.until-1e-9)throw Error('The gravity field is still active. Resume to field expiry, then interrupt to change destination.');
  }
  #report(a){return {id:a.id,name:a.name,position:clone(a.position),velocity:[0,0,0],radiusKm:100,operationRadiusLy:.003,spinPeriodHours:8,gross:clone(a.deposit),extractionCost:{fuel:3,credits:2,lifetime:2},reportCreditsPaid:a.reportCreditsPaid??0};}
  // Forecast against a copy: preserve all actual flight, inventory and permission state.
  missionForecast(){
    const actual=this.#state;
    if(!actual.calibration||actual.phase==='arrived')return null;
    if(actual.field&&actual.time<actual.field.until-1e-9)return {blocked:'Wait for field expiry before changing destination.',targets:[],home:[],dire:false};
    const priorQuotes=new Map(this.#quotes);
    this.#state=clone(actual);this.#state.target=null;this.#state.phase='calibrated';
    const home=[],targets=[];
    const inspect=(destination)=>{const routes=[];for(const speed of [.02,.025,.04,.065,.07]){try{const q=this.fieldQuote({destination,speed}),a=this.assess(q.id);routes.push({speed,fuel:q.detail.miningComparison?.totalFuelSpent??q.cost.fuel+q.detail.braking,years:q.detail.miningComparison?.totalYears??q.detail.years,...a});}catch{}}return routes;};
    try{
      this.#state.objective='home';home.push(...inspect('home'));for(const speed of [.02,.025,.04,.065,.07]){try{const q=this.quote('launch-home',{speed});home.push({kind:q.kind,speed,fuel:q.cost.fuel+q.detail.braking,years:q.detail.years,...this.assess(q.id)});}catch{}}
      this.#state.objective='yolo';
      for(const a of actual.asteroids){this.#state.report=this.#report(a);this.#state.deposit=clone(a.deposit);const routes=a.deposit.fuel?inspect('asteroid'):[];targets.push({id:a.id,name:a.name,deposit:clone(a.deposit),routes});}
    }finally{this.#state=actual;this.#quotes=priorQuotes;}
    // Dire when no tested full home route fits, or every fitting route leaves <=25% fuel or lifetime allowance.
    const fits=home.filter(r=>r.affordable),allow=k=>Math.min(actual.resources[k],actual.budget[k]-actual.spent[k]);
    const dire=!fits.length||fits.every(r=>allow('fuel')-r.fuel<=.25*allow('fuel')||allow('lifetime')-r.years<=.25*allow('lifetime'));
    return {home,targets,dire,homeFeasible:!!fits.length};
  }
  #starDestination(star,from){const delta=V.sub(from,star.p),direction=V.norm(delta)>1e-8?unit(delta):[1,0,0];return {id:star.id,name:`HIP ${star.id}`,cataloguePosition:clone(star.p),position:V.add(star.p,V.scale(direction,.01))};}
  starForecast(catalogueId=this.#state.destinationStar.id){
    const actual=this.#state;if(!actual.calibration||actual.phase==='arrived')return [];
    if(actual.field&&actual.time<actual.field.until-1e-9)return [];
    const prior=new Map(this.#quotes),routes=[];this.#state=clone(actual);this.#state.target=null;this.#state.phase='calibrated';this.#state.objective='explore';
    const star=this.#catalogue.find(s=>s.id===catalogueId);if(!star){this.#state=actual;return [];}this.#state.destinationStar=this.#starDestination(star,actual.p);
    try{for(const speed of [.02,.025,.04,.065,.07]){try{const q=this.fieldQuote({destination:'star',speed});routes.push({speed,fuel:q.cost.fuel+q.detail.braking,years:q.detail.years,...this.assess(q.id)});}catch{}}}finally{this.#state=actual;this.#quotes=prior;}
    return routes;
  }
  chartedSky(){if(!['at-star','arrived'].includes(this.#state.phase))throw Error('Reach a star system or Earth to open the full sky catalogue.');return this.#catalogue.map(s=>({catalogueId:s.id,observationId:this.#lightKeys.get(s.id),bearing:this.shipVector(unit(V.sub(s.p,this.#state.p))),brightness:Math.max(.15,Math.min(1,(7-s.mag)/6))}));}
  changeObjective(objective,targetId){
    this.#boundary();const s=this.#state;
    if(!['home','yolo','explore'].includes(objective))throw Error('Unknown mission objective');
    let asteroid,star;
    if(objective==='explore'){star=this.#catalogue.find(s=>s.id===targetId);if(!star)throw Error('Choose a catalogue star.');}
    if(objective==='yolo'){
      asteroid=s.asteroids.find(a=>a.id===targetId);
      if(!asteroid||!asteroid.deposit.fuel)throw Error('Choose an unmined asteroid.');
      const forecast=this.missionForecast().targets.find(a=>a.id===targetId);
      if(!forecast.routes.some(r=>r.affordable))throw Error('This asteroid cannot be reached and mined within current resources and spending limits.');
    }
    if(star)s.destinationStar=this.#starDestination(star,s.p);
    s.objective=objective;s.target=null;s.phase='calibrated';s.active=false;s.field=null;
    if(asteroid){s.report=this.#report(asteroid);s.deposit=clone(asteroid.deposit);}
    this.#undo=null;
    s.ledger.push({sequence:s.ledger.length+1,kind:'objective',objective,targetId:asteroid?.id??(objective==='explore'?s.destinationStar.id:'home'),cost:{fuel:0,credits:0,lifetime:0},reward:{fuel:0,credits:0},balance:clone(s.resources),time:s.time});
    this.#invalidate();return this.view();
  }
  setBudget(budget) {
    const s=this.#state;
    if(!['fuel','credits','lifetime'].every(k=>Number.isFinite(budget[k])&&budget[k]>=s.spent[k]&&budget[k]<=s.resources[k]+s.spent[k]))throw Error('Budget must fit available resources and accumulated spending');
    if(['fuel','credits','lifetime'].some(k=>budget[k]!==s.budget[k])){s.budget=clone(budget);this.#invalidate();}
  }
  setMode(mode) {
    if(!['plan','drive'].includes(mode))throw Error('Unknown journey mode');
    this.#state.mode=mode;this.#state.active=false;this.#invalidate();
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
      return s.objective==='yolo'?["extract"]:["extract", "launch-home", "gravity-home"];
    if(s.objective==='explore')return s.phase==='at-star'?[]:['gravity-star','launch-star'];
    if(s.objective==='yolo')return s.phase==='mined'?[]:['gravity-stop','launch-stop'];
    return [
      ...(!s.report && s.deposit.fuel > 0 ? ["survey"] : []),
      ...(s.report && s.deposit.fuel > 0 ? ["launch-stop", "gravity-stop"] : []),
      "launch-home", "gravity-home",
    ];
  }
  quote(kind, { speed } = {}) {
    if(kind.startsWith("gravity-"))return this.fieldQuote({destination:kind==="gravity-stop"?"asteroid":kind==="gravity-star"?"star":"home",speed});
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
      cost.credits = 6-Math.min(1,s.tagCredits);
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
      const p = s.asteroids[0].position;
      detail = {
        id: "cinder", name:"Cinder", reportCreditsPaid:3,
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
          kind === "launch-stop" ? s.report.position : kind==="launch-star"?s.destinationStar.position:[0, 0, 0],
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
        kind === "launch-stop" ? braking + 3 + (s.objective==='yolo'?0:2 * 0.025 * 250) : braking;
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
          totalFuel = cost.fuel + braking + 3 + (s.objective==='yolo'?0:2 * speed * 250);
        detail.miningComparison = {
          totalFuelSpent: totalFuel,
          grossFuel: s.deposit.fuel,
          netFuel: s.deposit.fuel - totalFuel,
          totalCreditsSpent: (s.report.reportCreditsPaid??3)+2,
          futureCreditsSpent:2,
          reportCreditsPaid:s.report.reportCreditsPaid??3,
          grossCredits: s.deposit.credits,
          netCredits: s.deposit.credits - ((s.report.reportCreditsPaid??3)+2),
          totalYears: years + 2 + (s.objective==='yolo'?0:onwardYears),
        };
      }
      effect = {
        v: velocity,
        gravity: 0,
        target: {
          name: kind === "launch-stop" ? "asteroid" : kind==="launch-star"?"star":"home",
          p: destination,
          remaining: years,
          speed,
        },
      };
    }
    if (kind === "coast") {
      const fieldLeft=s.field?Math.max(0,s.field.until-s.time):0;
      const block=(Math.floor((s.time+1e-10)/.125)+1)*.125-s.time;
      const years = Math.min(50, s.target.remaining,fieldLeft>1e-10?Math.min(fieldLeft,block):Infinity);
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
        phase: s.target.name === "home" ? "arrived" : s.target.name==="star"?"at-star":"at-stop",
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
          `Two-year extraction from finite ${s.report.name??"asteroid"} patch. ${s.report.reportCreditsPaid??3} report credits already spent.`,
      };
      detail.targetId=s.report.id;
      detail.reserve=s.objective==='yolo'?0:2*.025*250;
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
  rawQuote({ impulse = 0, gravity = this.#state.gravity, flightYears=0 } = {}) {
    const s = this.#state;
    impulse=typeof impulse==="number"?[impulse,0,0]:impulse;
    if (s.target || s.phase === "arrived")
      throw Error(
        "Interrupt and finish the current flight leg before a raw experiment",
      );
    if (
      !Array.isArray(impulse) || impulse.length!==3 || !impulse.every(Number.isFinite) ||
      V.norm(impulse) > 0.02000000001 ||
      ![0, 2].includes(flightYears) || ![0, 1].includes(gravity)
    )
      throw Error("Unsupported experiment");
    const dv = rotate(this.#truth.r, impulse);
    const q = {
      id: `q${++this.#counter}`,
      revision: s.revision,
      kind: "experiment",
      cost: {
        fuel: V.norm(impulse) * 250 + (gravity !== s.gravity ? 6 : 0),
        credits: 0,
        lifetime: 0,
      },
      reward: { fuel: 0, credits: 0 },
      detail: {
        impulse: dv,
        flightYears,
        gravityAfter: gravity,
        gravityDuration: s.resources.lifetime,
        summary:
          "Ship-frame vector impulse and local gravity multiplier; no homeward claim.",
      },
    };
    this.#quotes.set(q.id, {
      q: clone(q),
      effect: { v: V.add(s.v, dv), gravity },
    });
    return { ...clone(q), detail: { ...q.detail, impulse: [...impulse] } };
  }
  identifyQuote(observationId) {
    const s=this.#state,star=this.#lights.get(observationId);
    if(!star||s.phase==='arrived')throw Error('Unknown observed light');
    const known=s.identifiedLights.some(x=>x.observationId===observationId),q={id:`q${++this.#counter}`,revision:s.revision,kind:'identify',cost:{fuel:0,credits:known?0:1,lifetime:0},reward:{fuel:0,credits:0},detail:{summary:'Identify one selected observed light with a synthetic spectral tag; no position fix.'}};
    this.#quotes.set(q.id,{q:clone(q),effect:{identification:{observationId,catalogueId:star.id,bearing:unit(rotate(transpose(this.#truth.r),V.sub(star.p,s.p)))},known}});return clone(q);
  }
  driftQuote(years=.125) {
    const s=this.#state;
    if(s.target||s.phase==='arrived'||!Number.isFinite(years)||years<=0||years>.125)throw Error('Unsupported flight checkpoint');
    const result=integrate(s,years),q={id:`q${++this.#counter}`,revision:s.revision,kind:'drift',cost:{fuel:0,credits:0,lifetime:years},reward:{fuel:0,credits:0},detail:{summary:'Quoted push flight checkpoint',remaining:years}};
    this.#quotes.set(q.id,{q:clone(q),effect:{p:result.p,v:result.v}});return clone(q);
  }
  preview(id, {frame="world",years:requestedYears}={}) {
    const record = this.#quotes.get(id);
    if (!record || record.q.revision !== this.revision)
      throw Error("Stale quote");
    const s = this.#state,
      q = record.q;
    if (!q.kind.startsWith("launch-") && !q.kind.startsWith("gravity-") && q.kind !== "experiment") return null;
    const years = Math.min(requestedYears??q.detail.years??8, 8);
    const result = {
      years,
      initial: { p: [...s.p], v: [...s.v] },
      current: integrate(s, years),
      gravityOnly: integrate(s, years, { gravity: 0 }),
      proposed: integrate(q.kind.startsWith("gravity-")?{...s,field:record.effect.field,gravity:0}:s, years, {
        gravity: q.detail.gravityAfter,
        impulse: q.detail.impulse??[0,0,0],
      }),
    };
    if (!s.calibration || frame==="ship") {
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
  rememberAttempt(id){const r=this.#quotes.get(id);if(!r||r.q.revision!==this.revision||r.q.kind!=='experiment')throw Error('Current raw quote required');this.#attempt={snapshot:clone(this.#state),q:clone(r.q),impulse:rotate(transpose(this.#truth.r),r.q.detail.impulse)};return this.attempt();}
  attempt(){if(!this.#attempt)return null;const a=this.#attempt,s=a.snapshot,rt=transpose(this.#truth.r),end=integrate(s,8,{gravity:a.q.detail.gravityAfter,impulse:a.q.detail.impulse});return {impulse:[...a.impulse],cost:clone(a.q.cost),years:8,time:s.time,initial:{p:[0,0,0],v:rotate(rt,s.v)},path:end.path.map(p=>rotate(rt,V.sub(p,s.p))),committed:V.norm(V.sub(s.v,this.#state.v))>1e-9||Math.abs(s.time-this.#state.time)>1e-9};}
  compareAttempt(id,{years=8}={}){if(!Number.isFinite(years)||years<=0||years>8)throw Error('Invalid comparison horizon');if(!this.#state.calibration||!this.#attempt)return null;const r=this.#quotes.get(id),a=this.#attempt,s=a.snapshot;if(!r||r.q.revision!==this.revision)throw Error('Stale quote');if(V.norm(V.sub(s.p,this.#state.p))>1e-8||V.norm(V.sub(s.v,this.#state.v))>1e-9||s.gravity!==this.#state.gravity||Math.abs(s.time-this.#state.time)>1e-9)return {sameState:false};
    const q=r.q,original=integrate(s,years,{gravity:a.q.detail.gravityAfter,impulse:a.q.detail.impulse}),changed=integrate(q.kind.startsWith('gravity-')?{...s,field:r.effect.field,gravity:0}:s,years,{gravity:q.detail.gravityAfter,impulse:q.detail.impulse??[0,0,0]}),rt=transpose(this.#truth.r),local=x=>({...x,p:rotate(rt,V.sub(x.p,s.p)),v:rotate(rt,x.v),path:x.path.map(p=>rotate(rt,V.sub(p,s.p)))});
    return {sameState:true,years,initial:{p:[0,0,0],v:rotate(rt,s.v)},attempt:local(original),alternative:local(changed),attemptFuel:a.q.cost.fuel,alternativeFuel:q.cost.fuel,attemptHomeProgress:V.norm(s.p)-V.norm(original.p),alternativeHomeProgress:V.norm(s.p)-V.norm(changed.p)};
  }
  fieldQuote({destination='home',speed,centerShip}={}){
    const s=this.#state,kind=destination==='asteroid'?'gravity-stop':destination==='star'?'gravity-star':'gravity-home';
    if(s.objective!=='home'&&destination==='home')throw Error('Use Plot a course home to change the mission first.');
    if(!s.calibration||s.target||s.phase==='arrived'||(destination==='asteroid'&&(!s.report||!s.deposit.fuel))||!['home','asteroid','star'].includes(destination)||(destination==='star'&&s.objective!=='explore'))throw Error('Field edit unavailable in current state');
    speed??=s.preference==='less-fuel'?.025:s.preference==='faster'?.065:.04;if(!Number.isFinite(speed)||speed<.02||speed>.07)throw Error('Speed outside supported bounds');
    const target=destination==='asteroid'?s.report.position:destination==='star'?s.destinationStar.position:[0,0,0],distance=V.norm(V.sub(target,s.p)),coast=Math.max(1,distance/speed-1),duration=FIELD_DURATION;
    let center=V.add(s.p,V.scale(V.sub(V.sub(target,s.p),s.v),1/(1+coast)));
    const field=c=>({origin:[...s.p],center:[...c],strength:1,radius:.3,start:s.time,until:s.time+duration});
    const shoot=c=>{const end=integrate({...s,gravity:0,field:field(c)},duration);return {...end,error:V.sub(V.add(end.p,V.scale(end.v,coast)),target)};};
    if(centerShip!==undefined){if(!Array.isArray(centerShip)||centerShip.length!==3||!centerShip.every(Number.isFinite))throw Error('Invalid field handle');center=V.add(s.p,rotate(this.#truth.r,centerShip));}
    else for(let iteration=0;iteration<3;iteration++){const base=shoot(center);if(V.norm(base.error)<1e-9)break;const eps=1e-5,columns=[0,1,2].map(i=>{const test=[...center];test[i]+=eps;return V.scale(V.sub(shoot(test).error,base.error),1/eps);});const correction=solve3(transpose(columns),base.error);center=V.sub(center,correction);}
    if(V.norm(V.sub(center,s.p))>.1)throw Error('Field handle outside 0.1 ly bound');
    const f=field(center),end=shoot(center),closest=closestApproach(end.p,end.v,target),years=duration+closest.years,actualSpeed=V.norm(end.v),braking=actualSpeed*250,cost={fuel:6+V.norm(V.sub(center,s.p))*100,credits:0,lifetime:0};
    const feasible=closest.years>0&&Number.isFinite(years)&&closest.miss<.001&&end.path.every(p=>V.norm(V.sub(p,s.p))<f.radius-.005);
    const reserve=braking+(destination==='asteroid'?3+(s.objective==='yolo'?0:2*.025*250):0);
    const q={id:`q${++this.#counter}`,revision:s.revision,kind,cost,reward:{fuel:0,credits:0},detail:{destination:target,centerShip:rotate(transpose(this.#truth.r),V.sub(center,s.p)),strength:1,duration,radius:f.radius,years:Number.isFinite(years)&&years>0?years:0,speed:actualSpeed,requestedSpeed:speed,braking,reserve,miss:closest.miss,feasible,gravityBefore:s.gravity,gravityAfter:0,gravityDuration:duration,impulse:[0,0,0],summary:'Move the bounded gravity-well handle. The force bends velocity over 1.571 years; it expires without a corrective impulse. Coast to the measured intercept and brake.'}};
    if(years+2>s.resources.lifetime||years+2>s.budget.lifetime-s.spent.lifetime)q.detail.feasible=false;
    if(destination==='asteroid'){const totalFuel=cost.fuel+braking+3+(s.objective==='yolo'?0:2*.025*250);q.detail.miningComparison={totalFuelSpent:totalFuel,grossFuel:s.deposit.fuel,netFuel:s.deposit.fuel-totalFuel,totalCreditsSpent:(s.report.reportCreditsPaid??3)+2,futureCreditsSpent:2,reportCreditsPaid:s.report.reportCreditsPaid??3,grossCredits:s.deposit.credits,netCredits:s.deposit.credits-((s.report.reportCreditsPaid??3)+2),totalYears:years+2+(s.objective==='yolo'?0:V.norm(target)/.025)};}
    this.#quotes.set(q.id,{q:clone(q),effect:{field:f,target:{name:destination,p:target,remaining:years,speed:actualSpeed},end}});return clone(q);
  }
  routePath(){const s=this.#state;if(!s.target)return null;return integrate(s,s.target.remaining).path.map(p=>this.shipVector(V.sub(p,s.p)));}
  fieldTracers(id){const r=this.#quotes.get(id);if(!r||!r.effect.field||r.q.revision!==this.revision)throw Error('Current field quote required');const s=this.#state,rt=transpose(this.#truth.r);return Array.from({length:9},(_,i)=>{const offset=rotate(this.#truth.r,[(i%3-1)*.025,(Math.floor(i/3)-1)*.025,0]);const result=integrate({...s,p:V.add(s.p,offset),v:[0,0,0],field:r.effect.field,gravity:0},FIELD_DURATION);return result.path.map(p=>rotate(rt,V.sub(p,s.p)));});}
  undo(){if(!this.#undo)throw Error('Nothing to undo');const revision=this.revision;this.#state=clone(this.#undo.state);this.#attempt=clone(this.#undo.attempt);this.#state.revision=revision;this.#state.active=false;this.#undo=null;this.#invalidate();return this.view();}
  #validateCost(q){const s=this.#state;
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
    if(q.detail.flightYears&&(q.detail.flightYears>s.resources.lifetime||s.spent.lifetime+q.detail.flightYears>s.budget.lifetime))throw Error('Push flight exceeds remaining years');
    if(q.detail.miningComparison){const m=q.detail.miningComparison;if(s.spent.fuel+m.totalFuelSpent>s.budget.fuel+1e-9)throw Error('Full stop and reserved onward route exceed the gross fuel budget');if(m.totalYears>s.resources.lifetime+1e-9||s.spent.lifetime+m.totalYears>s.budget.lifetime+1e-9)throw Error('Full stop and onward route exceed lifetime');if(s.resources.credits<2||s.spent.credits+2>s.budget.credits)throw Error('Extraction credits must be available before taking the detour');}
    if(q.kind.startsWith('gravity-')&&(q.detail.years>s.resources.lifetime||s.spent.lifetime+q.detail.years>s.budget.lifetime))throw Error('Field route exceeds remaining lifetime');
    if(q.kind.startsWith('gravity-')&&!q.detail.feasible)throw Error('Edited field misses the arrival corridor; no action committed');
  }
  assess(id){const r=this.#quotes.get(id);if(!r||r.q.revision!==this.revision)return {affordable:false,reason:'Stale quote'};try{this.#validateCost(r.q);return {affordable:true,reason:null};}catch(e){return {affordable:false,reason:e.message};}}
  commit(id, {manual=false, enterDrive=false, investigation=false} = {}) {
    const record = this.#quotes.get(id),
      s = this.#state;
    if (!record || record.q.revision !== s.revision)
      throw Error("Stale or already committed quote");
    const { q, effect } = record;
    const destination=effect.target??s.target;
    const targetId=q.kind==='extract'?s.report.id:destination?.name==='star'?s.destinationStar.id:destination?.name==='asteroid'?s.report.id:destination?.name==='home'?'home':null;
    if(s.mode==='plan'&&!enterDrive&&!(investigation&&['calibrate','identify','survey'].includes(q.kind)))throw Error('Plan retains previews; Apply & fly before movement');
    if(enterDrive&&!manual)throw Error('Only a reviewed manual action may enter Drive');
    if(!s.active&&!manual&&!(investigation&&['calibrate','identify','survey'].includes(q.kind)))throw Error('Execution is paused');
    this.#validateCost(q);
    if(q.kind.startsWith("gravity-"))this.#undo={state:clone(s),attempt:clone(this.#attempt)};
    if(enterDrive)s.mode="drive";
    if(manual)s.active=!!q.kind.startsWith("gravity-")||!!q.detail.flightYears;
    for (const key of ["fuel", "credits", "lifetime"]) {
      s.resources[key] -= q.cost[key];
      s.spent[key] += q.cost[key];
    }
    s.resources.fuel += q.reward.fuel;
    s.resources.credits += q.reward.credits;
    s.time += q.cost.lifetime;
    if(q.kind==="identify"&&!effect.known){s.identifiedLights.push(effect.identification);s.tagCredits++;}
    if (q.kind === "calibrate") {
      s.calibration = effect.solution;
      s.p = [...effect.solution.position];
      s.observations = effect.observations;
      s.phase = "calibrated";
    }
    if (q.kind === "survey") {s.report=clone(effect.report);s.asteroids[0].reportCreditsPaid=3;}
    if (q.kind === "experiment") {
      s.v = effect.v;
      s.gravity = effect.gravity;
    }
    if (q.kind.startsWith("gravity-")) {s.gravity=0;s.field=clone(effect.field);s.target=clone(effect.target);s.phase="travel";}
    if (q.kind.startsWith("launch-")) {
      s.v = effect.v;
      s.gravity = effect.gravity;
      s.field=null;
      s.target = effect.target;
      s.phase = "travel";
    }
    if(q.kind==="drift"){s.p=effect.p;s.v=effect.v;}
    if (q.kind === "coast") {
      s.p = effect.p;
      s.v = effect.v;
      s.target.remaining = effect.remaining;
    }
    if (q.kind === "brake") {
      s.v = effect.v;
      s.phase = effect.phase;
      s.target = null;
      if (["arrived","at-star"].includes(s.phase)) s.active = false;
      if (s.phase === "arrived" && (V.norm(s.p) > 0.002 || V.norm(s.v) > 1e-5))
        throw Error("Arrival verification failed");
    }
    if (effect.deplete) {
      s.deposit = { fuel: 0, credits: 0 };
      const asteroid=s.asteroids.find(a=>a.id===s.report.id);if(asteroid)asteroid.deposit=clone(s.deposit);
      s.phase = "mined";
    }
    s.ledger.push({
      sequence: s.ledger.length + 1,
      kind: q.kind,
      targetId,
      cost: clone(q.cost),
      reward: clone(q.reward),
      balance: clone(s.resources),
      time: s.time,
      canUndo:!!this.#undo,
    });
    this.#invalidate();
    return this.view();
  }
}
