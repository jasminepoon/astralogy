// Strict public-observation boundary for the local Astra bridge.
import fs from "node:fs";
const x = JSON.parse(fs.readFileSync(0, "utf8"));
function check(ok) {
  if (!ok) throw Error("Invalid public observation");
}
function keys(o, required, optional = []) {
  check(o && typeof o === "object" && !Array.isArray(o));
  check(required.every((k) => Object.hasOwn(o, k)));
  check(Object.keys(o).every((k) => [...required, ...optional].includes(k)));
}
const num = (v, min = 0, max = 1e5) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const str = (v, max) => typeof v === "string" && v.length <= max;
const vec = (v) =>
  Array.isArray(v) && v.length === 3 && v.every((n) => num(n, -1e4, 1e4));
keys(x, [
  "requestId",
  "revision",
  "message",
  "history",
  "observation",
  "choices",
]);
check(
  str(x.requestId, 64) &&
    x.requestId.length > 0 &&
    Number.isSafeInteger(x.revision) &&
    x.revision >= 0 &&
    str(x.message, 800) &&
    x.message.length > 0,
);
check(Array.isArray(x.history) && x.history.length <= 16);
for (const h of x.history) {
  keys(h, ["role", "text"]);
  check(["user", "assistant"].includes(h.role) && str(h.text, 800));
}
const o = x.observation;
keys(o, [
  "phase",
  "delegated",
  ...(Object.hasOwn(o,"planning")?["planning"]:[]),
  "resources",
  "budgetRemaining",
  "preference",
  "landmarks",
  "navigation",
  "asteroid",
], ["attempt"]);
check(typeof o.delegated === "boolean");
if(Object.hasOwn(o,"planning"))check(typeof o.planning === "boolean");
check(
  ["unknown", "calibrated", "travel", "at-stop", "mined", "arrived"].includes(
    o.phase,
  ),
);
check(["balanced", "less-fuel", "faster", "skip-stop"].includes(o.preference));
for (const b of [o.resources, o.budgetRemaining]) {
  keys(b, ["fuel", "credits", "lifetime"]);
  check(Object.values(b).every((v) => num(v)));
}
check(Array.isArray(o.landmarks) && o.landmarks.length <= 12);
for (const l of o.landmarks) {
  keys(l, ["label", "bearing"], ["range", "catalogueId"]);
  check(/^L\d{1,2}$/.test(l.label) && vec(l.bearing));
  if (o.phase === "unknown")
    check(!Object.hasOwn(l, "range") && !Object.hasOwn(l, "catalogueId"));
  else check(num(l.range) && Number.isInteger(l.catalogueId));
}
if (o.phase === "unknown") check(o.navigation === null);
else {
  keys(o.navigation, [
    "distance",
    "speed",
    "target",
    "remaining",
    "calibrationResidual",
  ]);
  check(
    num(o.navigation.distance) &&
      num(o.navigation.speed) &&
      num(o.navigation.remaining) &&
      num(o.navigation.calibrationResidual) &&
      ["none", "home", "asteroid"].includes(o.navigation.target),
  );
}
if (o.asteroid !== null) {
  check(o.phase !== "unknown");
  keys(o.asteroid, [
    "relativePosition",
    "velocity",
    "radiusKm",
    "operationRadiusLy",
    "spinPeriodHours",
    "grossFuel",
    "grossCredits",
    "extractionFuel",
    "extractionCredits",
    "extractionYears",
    "reportCreditsPaid",
  ]);
  check(vec(o.asteroid.relativePosition) && vec(o.asteroid.velocity));
  check(
    Object.entries(o.asteroid)
      .filter(([k]) => !["relativePosition", "velocity"].includes(k))
      .every(([, v]) => num(v)),
  );
}
if(o.attempt!==undefined&&o.attempt!==null){const a=o.attempt;keys(a,['impulse','fuel','years','committed']);check(vec(a.impulse)&&Math.hypot(...a.impulse)<=.020000001&&num(a.fuel)&&num(a.years,0,8)&&typeof a.committed==='boolean');}
check(
  Array.isArray(x.choices) && x.choices.length <= 6 && x.choices.length > 0,
);
check(x.choices.filter(c=>c.currentPreview===true).length<=1);
const ids = new Set();
for (const c of x.choices) {
  keys(c, ["id", "kind", "cost", "summary", "years", "reserve", "evidence"], ["affordable","reason","field","comparison","currentPreview"]);
  if(c.currentPreview!==undefined)check(typeof c.currentPreview==='boolean'&&(!c.currentPreview||(o.phase!=='unknown'&&c.kind.startsWith('gravity-'))));
  if(c.affordable!==undefined)check(typeof c.affordable==='boolean');
  if(c.reason!==undefined&&c.reason!==null)check(str(c.reason,200));
  check(str(c.id, 30) && !ids.has(c.id));
  ids.add(c.id);
  check(
    [
      "calibrate",
      "survey",
      "launch-stop",
      "launch-home", "gravity-home", "gravity-stop",
      "coast",
      "brake",
      "extract",
    ].includes(c.kind),
  );
  if (o.phase === "unknown") check(c.kind === "calibrate");
  keys(c.cost, ["fuel", "credits", "lifetime"]);
  check(
    Object.values(c.cost).every((v) => num(v)) &&
      str(c.summary, 400) &&
      num(c.years) &&
      num(c.reserve),
  );
  if(c.field!==undefined&&c.field!==null){check(o.phase!=='unknown');const f=c.field;keys(f,['centerShip','duration','strength','miss','fullTripFuel','onwardMode'],['fullTripYears','fullTripCredits']);for(const k of ['fullTripYears','fullTripCredits'])if(f[k]!==undefined)check(num(f[k]));check(vec(f.centerShip)&&Math.hypot(...f.centerShip)<=.100001&&num(f.duration,0,2)&&num(f.strength,0,1)&&num(f.miss)&&num(f.fullTripFuel)&&['none','direct-slow'].includes(f.onwardMode));}
  if(c.comparison!==undefined&&c.comparison!==null){check(o.phase!=='unknown');const a=c.comparison;keys(a,['years','attemptFuel','alternativeFuel','attemptHomeProgress','alternativeHomeProgress']);check(num(a.years,0,8)&&num(a.attemptFuel)&&num(a.alternativeFuel)&&num(a.attemptHomeProgress,-1e5,1e5)&&num(a.alternativeHomeProgress,-1e5,1e5));}
  const e = c.evidence;
  keys(e, [
    "impulse",
    "gravityBefore",
    "gravityAfter",
    "gravityDuration",
    "braking",
    "speed",
    "endpointSeparation",
    "grossFuel",
    "grossCredits",
  ]);
  check(
    vec(e.impulse) &&
      Object.entries(e)
        .filter(([k]) => k !== "impulse")
        .every(([, v]) => num(v)),
  );
  if (o.phase === "unknown")
    check(
      e.impulse.every((v) => v === 0) &&
        Object.entries(e)
          .filter(([k]) => k !== "impulse")
          .every(([, v]) => v === 0),
    );
}
process.stdout.write(JSON.stringify(x));
