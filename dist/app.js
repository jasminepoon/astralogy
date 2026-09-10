import * as THREE from "./vendor/three.module.js";
import {
  Experiment,
  G,
  compareTrajectories,
  orbitalElements,
} from "./physics.js";
import { setupCreative } from "./creative.js";
import { skyTransform } from "./astro.js";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const canvas = $("#universe");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
} catch (e) {
  $("#status").textContent = "WebGL unavailable";
  $("#toast").textContent =
    "This experience needs a browser with WebGL enabled.";
  $("#toast").classList.add("visible");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x070b14);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(
    62,
    innerWidth / innerHeight,
    0.05,
    3000,
  ),
  sky = new THREE.Group(),
  studio = new THREE.Group();
scene.add(sky, studio);
studio.visible = false;
let mode = "sky",
  selected = 24436,
  tool = "paint",
  colorIndex = 0,
  brushSize = 0.6,
  playing = true,
  targetTime = 0,
  allNames = false,
  date = new Date("2000-01-16T03:00Z"),
  lat = 40.7128,
  lon = -74.006,
  skyYaw = 0,
  skyPitch = 0.4,
  studioYaw = 0.2,
  studioPitch = 0.4,
  studioDistance = 15;
let experiment = new Experiment();
let comparison = null,
  beforeComparison = null;
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
const names = {
  24436: [
    "Rigel",
    "Orion",
    "Blue supergiant",
    "A brilliant blue-white anchor at the foot of Orion. Its light is one of the defining sights of the winter sky.",
  ],
  27989: [
    "Betelgeuse",
    "Orion",
    "Red supergiant",
    "The warm shoulder of Orion. Its changing brightness is a reminder that stars are dynamic worlds.",
  ],
  25336: [
    "Bellatrix",
    "Orion",
    "Blue giant",
    "The other shoulder of Orion, a hot blue star that makes a striking contrast with Betelgeuse.",
  ],
  26727: [
    "Alnitak",
    "Orion",
    "Multiple star system",
    "The eastern star of Orion’s Belt. What looks like a single light is a system of stars.",
  ],
  26311: [
    "Alnilam",
    "Orion",
    "Blue supergiant",
    "The central jewel of Orion’s Belt, framed by Alnitak and Mintaka.",
  ],
  25930: [
    "Mintaka",
    "Orion",
    "Multiple star system",
    "The western end of Orion’s Belt, lying close to the celestial equator.",
  ],
  27366: [
    "Saiph",
    "Orion",
    "Blue supergiant",
    "A blue-white star marking the other foot of the celestial hunter.",
  ],
  32349: [
    "Sirius",
    "Canis Major",
    "Binary star system",
    "The brightest star in Earth’s night sky. Its companion, Sirius B, is a white dwarf.",
  ],
  21421: [
    "Aldebaran",
    "Taurus",
    "Red giant",
    "The warm eye of Taurus. It appears in front of the Hyades, although it is not a member of that cluster.",
  ],
  17702: [
    "Alcyone",
    "Taurus",
    "Pleiades member",
    "A bright member of the Pleiades, a cluster of stars born from the same stellar nursery.",
  ],
  91262: [
    "Vega",
    "Lyra",
    "Main-sequence star",
    "A blue-white beacon in Lyra and one of the three corners of the Summer Triangle.",
  ],
  11767: [
    "Polaris",
    "Ursa Minor",
    "Multiple star system",
    "The North Star sits close to the north celestial pole, making it a familiar guide to direction.",
  ],
  71683: [
    "Alpha Centauri",
    "Centaurus",
    "Multiple star system",
    "A nearby stellar system in the southern sky. Its stars offer a natural invitation to imagine other viewpoints.",
  ],
  80763: [
    "Antares",
    "Scorpius",
    "Red supergiant",
    "A ruddy light at the heart of Scorpius, often compared with the color of Mars.",
  ],
  65474: [
    "Spica",
    "Virgo",
    "Binary star system",
    "The brightest star in Virgo is a close pair of hot stars.",
  ],
  69673: [
    "Arcturus",
    "Boötes",
    "Red giant",
    "A bright orange giant and a prominent guide through the northern spring sky.",
  ],
  37826: [
    "Pollux",
    "Gemini",
    "Giant star",
    "A golden giant marking one of the celestial twins.",
  ],
  24608: [
    "Capella",
    "Auriga",
    "Multiple star system",
    "A warm beacon in Auriga whose apparently single light comes from a stellar system.",
  ],
  113368: [
    "Fomalhaut",
    "Piscis Austrinus",
    "Main-sequence star",
    "A solitary-looking southern beacon surrounded by a system of dusty debris.",
  ],
  102098: [
    "Deneb",
    "Cygnus",
    "Supergiant",
    "The tail of Cygnus and a distant corner of the Summer Triangle.",
  ],
  97649: [
    "Altair",
    "Aquila",
    "Main-sequence star",
    "A nearby bright star in Aquila and the third corner of the Summer Triangle.",
  ],
};
let features = [],
  named = [],
  skyPositions = [],
  lineObjects = [],
  transform;
function starColor(bv) {
  bv = Number(bv);
  return new THREE.Color(
    bv > 1.3
      ? "#ffd2a4"
      : bv > 0.7
        ? "#ffe1b7"
        : bv > 0.2
          ? "#eff1e8"
          : bv > -0.1
            ? "#cee4ff"
            : "#afceff",
  );
}
const vertex = `attribute float size; attribute vec3 tint; varying vec3 vTint; varying float vAlpha; attribute float opacity; void main(){vTint=tint;vAlpha=opacity;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=size;}`;
const fragment = `varying vec3 vTint;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=exp(-r*r*5.)*pow(1.-r,1.2);gl_FragColor=vec4(vTint,a*vAlpha);}`;
function pointCloud(positions, colors, sizes, opacities) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("tint", new THREE.Float32BufferAttribute(colors, 3));
  g.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  g.setAttribute("opacity", new THREE.Float32BufferAttribute(opacities, 1));
  const p = new THREE.Points(
    g,
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  p.frustumCulled = false;
  return p;
}
let starPoints;
const labels = new Map();
function cameraUpdate() {
  if (mode === "lab" && innerWidth <= 760)
    camera.setViewOffset(
      innerWidth,
      innerHeight,
      0,
      innerHeight * 0.19,
      innerWidth,
      innerHeight,
    );
  else camera.clearViewOffset();
  if (mode === "sky") {
    camera.position.set(0, 0, 0);
    camera.lookAt(
      Math.sin(skyYaw) * Math.cos(skyPitch),
      Math.sin(skyPitch),
      -Math.cos(skyYaw) * Math.cos(skyPitch),
    );
  } else {
    const viewDistance =
      studioDistance *
      (innerWidth <= 760 ? Math.max(1, 0.8 / camera.aspect) : 1);
    camera.position.set(
      viewDistance * Math.sin(studioYaw) * Math.cos(studioPitch),
      viewDistance * Math.sin(studioPitch),
      viewDistance * Math.cos(studioYaw) * Math.cos(studioPitch),
    );
    camera.lookAt(0, 0, 0);
  }
  camera.updateMatrixWorld();
}
function focusStar(id) {
  const f = features.find((s) => s.id === Number(id));
  if (!f) return;
  selected = f.id;
  const idx = features.indexOf(f),
    p = new THREE.Vector3(...skyPositions[idx]);
  skyYaw = Math.atan2(p.x, -p.z);
  skyPitch = Math.asin(p.y / p.length());
  if (mode === "sky") {
    camera.fov = 62;
    camera.updateProjectionMatrix();
    cameraUpdate();
  }
  updateCard();
  renderList();
}
function updateCard() {
  const f = features.find((s) => s.id === selected);
  if (!f) return;
  const n = names[selected] || [
    "HIP " + selected,
    "Catalogue star",
    "Measured sky position",
    "This point of light is a real catalogue star. Follow its source record to learn more.",
  ];
  $("#star-name").textContent = n[0];
  $("#star-subtitle").textContent = n[1] + " · " + n[2];
  $("#star-story").textContent = n[3];
  $("#star-mag").textContent = Number(f.properties.mag).toFixed(2) + " mag";
  const ra = ((f.geometry.coordinates[0] + 360) % 360) / 15;
  $("#star-ra").textContent =
    String(Math.floor(ra)).padStart(2, "0") +
    "h " +
    String(Math.floor((ra % 1) * 60)).padStart(2, "0") +
    "m";
  $("#star-dec").textContent = f.geometry.coordinates[1].toFixed(2) + "°";
  $("#star-alt").textContent =
    (
      (Math.asin(skyPositions[features.indexOf(f)][1] / 500) * 180) /
      Math.PI
    ).toFixed(1) + "°";
  $("#catalogue-id").textContent = "· HIP " + f.id;
  $("#star-source").href =
    "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=" +
    encodeURIComponent("HIP " + f.id);
  $("#view-title").textContent =
    mode === "sky" ? n[1].toUpperCase() : "YOUR STELLAR CANVAS";
  $("#view-subtitle").textContent =
    mode === "sky"
      ? n[1] === "Orion"
        ? "THE HUNTER"
        : "A DIFFERENT POINT OF VIEW"
      : "DRAG TO PAINT WITH LIGHT";
  $("#inspiration").textContent = n[0];
  for (const [id, el] of labels)
    el.classList.toggle("selected", id === selected);
}
function renderList() {
  const q = $("#search").value.toLowerCase().trim();
  const list = named.filter(
    (f) => !q || names[f.id].slice(0, 3).join(" ").toLowerCase().includes(q),
  );
  $("#star-list").replaceChildren();
  for (const f of list.slice(0, q || allNames ? 30 : 4)) {
    const n = names[f.id],
      b = document.createElement("button");
    b.className = "star-row" + (f.id === selected ? " active" : "");
    b.innerHTML = `<span class="star-dot" style="--star-color:#${starColor(f.properties.bv).getHexString()}"></span><span><strong>${n[0]}</strong><small>${n[1]}</small></span><span class="row-arrow">↗</span>`;
    b.onclick = () => focusStar(f.id);
    $("#star-list").append(b);
  }
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No named stars found. Try Orion or Sirius.";
    $("#star-list").append(p);
  }
}
function updateSky() {
  transform = skyTransform(date, lat, lon);
  skyPositions = features.map((f) =>
    transform(...f.geometry.coordinates).map((x) => x * 500),
  );
  starPoints.geometry.attributes.position.array.set(skyPositions.flat());
  starPoints.geometry.attributes.position.needsUpdate = true;
  for (const { obj, coords } of lineObjects) {
    obj.geometry.attributes.position.array.set(
      coords.map((c) => transform(...c).map((x) => x * 498)).flat(),
    );
    obj.geometry.attributes.position.needsUpdate = true;
  }
  updateCard();
}
const horizon = new THREE.Group();
sky.add(horizon);
horizon.visible = false;
const hp = [];
for (let i = 0; i <= 180; i++) {
  const a = (i / 180) * Math.PI * 2;
  hp.push(new THREE.Vector3(Math.cos(a) * 480, 0, Math.sin(a) * 480));
}
horizon.add(
  new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(hp),
    new THREE.LineBasicMaterial({
      color: 0x7c9daa,
      transparent: true,
      opacity: 0.6,
    }),
  ),
);
const horizonLabels = [];
for (const [t, p] of [
  ["N", [0, 0, -480]],
  ["E", [480, 0, 0]],
  ["S", [0, 0, 480]],
  ["W", [-480, 0, 0]],
]) {
  const e = document.createElement("span");
  e.className = "sky-label";
  e.textContent = t;
  $("#labels").append(e);
  horizonLabels.push({ e, p: new THREE.Vector3(...p) });
}
const starMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color("#ffce86") },
  },
  vertexShader: `varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform float time;uniform vec3 color;varying vec3 vP;varying vec3 vN;void main(){float n=sin(vP.x*35.+sin(vP.y*28.+time*.5)*3.)*sin(vP.z*31.-time*.2);float m=sin(vP.y*75.+vP.x*45.+n*2.)*.5+.5;float l=.65+.35*max(0.,dot(normalize(vN),normalize(vec3(-1.,1.,2.))));gl_FragColor=vec4(color*l*(1.+n*.12+m*.12),1.);}`,
});
const primary = new THREE.Mesh(
  new THREE.SphereGeometry(0.46, 48, 32),
  starMaterial,
);
studio.add(primary);
const secondary = new THREE.Mesh(
  new THREE.SphereGeometry(0.31, 32, 24),
  starMaterial.clone(),
);
secondary.material.uniforms.color.value = new THREE.Color("#b4d9ff");
studio.add(secondary);
secondary.visible = false;
function halo(color, size) {
  const p = pointCloud(
    [0, 0, 0],
    new THREE.Color(color).toArray(),
    [size],
    [0.65],
  );
  studio.add(p);
  return p;
}
const glow1 = halo("#ffd493", 160),
  glow2 = halo("#add2ff", 120);
glow2.visible = false;
const orbitGroup = new THREE.Group();
studio.add(orbitGroup);
function updateOrbits() {
  for (const o of orbitGroup.children) {
    o.geometry.dispose();
    o.material.dispose();
  }
  orbitGroup.clear();
  if (!experiment.companion) return;
  // Actual integrated paths replace the old circular guide rings.
  if (comparison)
    for (const [branch, color] of [
      [comparison.baseline, 0x85e9fa],
      [comparison.alternative, 0xf7c580],
    ]) {
      for (let body = 0; body < 2; body++)
        orbitGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
              branch.path.map((p) => new THREE.Vector3(...p.positions[body])),
            ),
            new THREE.LineBasicMaterial({
              color,
              transparent: true,
              opacity: body ? 0.9 : 0.45,
            }),
          ),
        );
    }
}
const velocityArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(),
  2,
  0xf7c580,
  0.3,
  0.16,
);
studio.add(velocityArrow);
velocityArrow.visible = false;
function candidateVelocity() {
  const v = Math.sqrt((G * (1 + experiment.mass)) / 4);
  return [
    Number($("#velocity-radial").value) * v,
    0,
    Number($("#velocity-tangent").value) * v,
  ];
}
function updateVelocity() {
  const v = candidateVelocity();
  $("#tangent-value").textContent =
    Number($("#velocity-tangent").value).toFixed(2) + " × circular";
  $("#radial-value").textContent =
    Number($("#velocity-radial").value).toFixed(2) + " × circular";
  $("#velocity-vector").textContent =
    `Relative velocity: (${v.map((x) => x.toFixed(2)).join(", ")}) AU/year. Arrow at the starting companion; length scaled for display.`;
  velocityArrow.visible = experiment.companion && $("#orbit-compare").open;
  velocityArrow.position.set(...(experiment.initial[1]?.p || [0, 0, 0]));
  const vector = new THREE.Vector3(...v);
  velocityArrow.setDirection(
    vector.length() ? vector.clone().normalize() : new THREE.Vector3(0, 0, 1),
  );
  velocityArrow.setLength(Math.max(0.01, vector.length() * 0.5), 0.25, 0.12);
}
function clearComparison() {
  comparison = null;
  beforeComparison = null;
  $("#comparison-result").textContent = "";
  $("#alternative-btn").disabled = $("#revert-compare").disabled = true;
}
$("#orbit-compare").ontoggle = updateVelocity;
for (const id of ["#velocity-tangent", "#velocity-radial"])
  $(id).oninput = () => {
    updateVelocity();
    if (comparison)
      $("#comparison-result").textContent =
        "Velocity changed. Compare again to update the displayed paths.";
    $("#alternative-btn").disabled = true;
  };
$("#compare-btn").onclick = () => {
  if (!experiment.companion) return toast("Add a companion star first.");
  setPlaying(false);
  try {
    const result = compareTrajectories(
      experiment.snapshot(),
      candidateVelocity(),
    );
    beforeComparison ||= experiment.snapshot();
    comparison = result;
    experiment = Experiment.fromSnapshot(result.baseline.start);
    targetTime = 0;
    updateOrbits();
    updateTime();
    $("#alternative-btn").disabled = $("#revert-compare").disabled = false;
    $("#comparison-result").replaceChildren();
    for (const [label, b, color] of [
      ["Baseline", result.baseline, "#85e9fa"],
      ["Alternative", result.alternative, "#f7c580"],
    ]) {
      const p = document.createElement("p");
      p.style.color = color;
      p.textContent = `${label} · ${b.status} at ${(b.end.tick * b.end.h).toFixed(2)} yr. Closest sampled: ${b.minSeparation.toFixed(3)} AU. Eccentricity: ${b.elements.eccentricity.toFixed(3)}. Energy error: ${(b.maxEnergyError * 100).toFixed(4)}% of initial binding scale.${b.reason ? " " + b.reason : ""}`;
      $("#comparison-result").append(p);
    }
    const note = document.createElement("p");
    note.textContent =
      "Paths cover only the simulated interval. Closest sampled separation is not a guaranteed orbital minimum. Paint is excluded.";
    $("#comparison-result").append(note);
  } catch (e) {
    toast(e.message);
  }
};
$("#alternative-btn").onclick = () => {
  if (!comparison) return;
  experiment = Experiment.fromSnapshot(comparison.alternative.start);
  targetTime = 0;
  setPlaying(true);
  $("#period").textContent =
    comparison.alternative.elements.period?.toFixed(2) + " years";
  if (comparison.alternative.elements.period === null)
    $("#period").textContent = "Unbound";
};
$("#revert-compare").onclick = () => {
  if (!beforeComparison) return;
  experiment = Experiment.fromSnapshot(beforeComparison);
  targetTime = experiment.time;
  clearComparison();
  updateOrbits();
  updateTime();
  setPlaying(false);
  $("#period").textContent =
    orbitalElements(experiment.bodies).period?.toFixed(2) + " years";
};
const N = 14000,
  pp = new Float32Array(N * 3),
  vv = new Float32Array(N * 3),
  cc = new Float32Array(N * 3),
  ss = new Float32Array(N),
  oo = new Float32Array(N),
  ages = new Float32Array(N);
let head = 0,
  seed = 8461;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const palette = ["#70d7f1", "#a88cef", "#ee8bad", "#f0b976"].map(
  (c) => new THREE.Color(c),
);
const dust = pointCloud(pp, cc, ss, oo);
studio.add(dust);
$("#show-paint").onchange = () => {
  dust.visible = $("#show-paint").checked;
};
// Ring-buffer particles form a persistent, gravitationally advected artistic field.
function putParticle(x, y, z, vx, vy, vz, c, size = 12, age = 1) {
  const i = head++ % N,
    j = i * 3;
  pp[j] = x;
  pp[j + 1] = y;
  pp[j + 2] = z;
  vv[j] = vx;
  vv[j + 1] = vy;
  vv[j + 2] = vz;
  cc[j] = c.r;
  cc[j + 1] = c.g;
  cc[j + 2] = c.b;
  ss[i] = size;
  ages[i] = age;
  oo[i] = age * 0.38;
}
function seedDust() {
  pp.fill(0);
  oo.fill(0);
  ages.fill(0);
  head = 0;
  seed = 8461;
  for (let i = 0; i < 9000; i++) {
    const angle = random() * Math.PI * 2,
      r = 1.1 + Math.pow(random(), 0.65) * 4.8;
    const twist = angle + Math.sin(r * 1.8) * 0.3;
    const y = (random() - 0.5) * (0.12 + r * 0.035);
    const speed = Math.sqrt(G / r) * 0.15;
    putParticle(
      Math.cos(twist) * r,
      y,
      Math.sin(twist) * r,
      -Math.sin(twist) * speed,
      0,
      Math.cos(twist) * speed,
      palette[Math.floor((angle / (Math.PI * 2)) * 4 + r * 0.3) % 4],
      7 + random() * 16,
      0.4 + random() * 0.6,
    );
  }
  syncDust();
}
function syncDust() {
  for (const name of ["position", "tint", "size", "opacity"]) {
    const attr = dust.geometry.attributes[name];
    attr.array.set(
      name === "position"
        ? pp
        : name === "tint"
          ? cc
          : name === "size"
            ? ss
            : oo,
    );
    attr.needsUpdate = true;
  }
}
function moveDust(dt) {
  for (let i = 0; i < N; i++) {
    if (ages[i] <= 0) continue;
    const j = i * 3;
    for (const b of experiment.bodies) {
      const dx = b.p[0] - pp[j],
        dy = b.p[1] - pp[j + 1],
        dz = b.p[2] - pp[j + 2],
        d2 = dx * dx + dy * dy + dz * dz + 0.8;
      const a = ((G * b.m) / (d2 * Math.sqrt(d2))) * 0.035;
      vv[j] += dx * a * dt;
      vv[j + 1] += dy * a * dt;
      vv[j + 2] += dz * a * dt;
    }
    const drag = Math.exp(-dt * 0.045);
    for (let k = 0; k < 3; k++) {
      vv[j + k] *= drag;
      pp[j + k] += vv[j + k] * dt;
    }
    ages[i] = Math.max(0, ages[i] - dt * 0.007);
    oo[i] = ages[i] * 0.38;
  }
  syncDust();
}
const raycaster = new THREE.Raycaster(),
  mouse = new THREE.Vector2(),
  paintPlane = new THREE.Plane(),
  planePoint = new THREE.Vector3(),
  lastBrush = new THREE.Vector3();
let brushHasLast = false,
  paintCount = 0;
function paint(x, y, dx, dy) {
  mouse.set((x / innerWidth) * 2 - 1, (-y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  paintPlane.setFromNormalAndCoplanarPoint(
    camera.getWorldDirection(new THREE.Vector3()),
    new THREE.Vector3(),
  );
  if (!raycaster.ray.intersectPlane(paintPlane, planePoint)) return;
  const start = brushHasLast ? lastBrush.clone() : planePoint.clone(),
    distance = start.distanceTo(planePoint),
    steps = Math.min(20, Math.max(1, Math.ceil(distance / 0.07)));
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion),
    up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const force = right
    .clone()
    .multiplyScalar(dx * 0.025)
    .addScaledVector(up, -dy * 0.025);
  const radius = brushSize * 1.8;
  for (let i = 0; i < N; i++) {
    if (ages[i] <= 0) continue;
    const j = i * 3,
      rx = pp[j] - planePoint.x,
      ry = pp[j + 1] - planePoint.y,
      rz = pp[j + 2] - planePoint.z,
      d = Math.hypot(rx, ry, rz);
    if (d < radius) {
      const w = (1 - d / radius) ** 2;
      vv[j] += force.x * w * 2 - rz * w * 0.15;
      vv[j + 1] += force.y * w * 2;
      vv[j + 2] += force.z * w * 2 + rx * w * 0.15;
      pp[j] += force.x * w * 0.025;
      pp[j + 1] += force.y * w * 0.025;
      pp[j + 2] += force.z * w * 0.025;
    }
  }
  for (let s = 0; s < steps; s++) {
    const p = start.clone().lerp(planePoint, (s + 1) / steps);
    for (let k = 0; k < 26; k++) {
      const a = random() * Math.PI * 2,
        r = Math.sqrt(random()) * brushSize * 0.35;
      const offset = right
        .clone()
        .multiplyScalar(Math.cos(a) * r)
        .addScaledVector(up, Math.sin(a) * r);
      putParticle(
        p.x + offset.x,
        p.y + offset.y,
        p.z + offset.z,
        force.x - Math.sin(a) * 0.15,
        force.y,
        force.z + Math.cos(a) * 0.15,
        palette[colorIndex],
        10 + random() * 25,
        1,
      );
    }
  }
  lastBrush.copy(planePoint);
  brushHasLast = true;
  paintCount++;
  syncDust();
}
function setMode(next) {
  if (next === mode) return;
  document.body.classList.remove("controls-open");
  $("#controls-toggle").setAttribute("aria-expanded", "false");
  mode = next;
  document.body.classList.toggle("lab", mode === "lab");
  for (const id of ["sky-panel", "star-card", "sky-time"])
    $("#" + id).classList.toggle("hidden", mode !== "sky");
  for (const id of ["lab-panel", "lab-card", "lab-time"])
    $("#" + id).classList.toggle("hidden", mode !== "lab");
  $("#sky-tab").classList.toggle("active", mode === "sky");
  $("#lab-tab").classList.toggle("active", mode === "lab");
  sky.visible = mode === "sky";
  studio.visible = mode === "lab";
  $("#labels").style.display = mode === "sky" ? "block" : "none";
  camera.fov = mode === "sky" ? 62 : 48;
  camera.updateProjectionMatrix();
  cameraUpdate();
  updateCard();
  $("#controls-hint").textContent =
    mode === "sky"
      ? "DRAG TO LOOK AROUND · SCROLL TO ZOOM"
      : "DRAG TO PAINT · ORBIT TOOL TO LOOK AROUND";
  $("#status").textContent =
    mode === "sky"
      ? "5,044 CATALOGUE STARS"
      : "NEWTONIAN GRAVITY · ARTISTIC TRACERS";
  if (mode === "lab" && !head) seedDust();
}
function resetExperiment(
  companion = experiment.companion,
  mass = Number($("#mass").value),
) {
  clearComparison();
  experiment.reset(mass, companion);
  updateVelocity();
  targetTime = 0;
  paintCount = 0;
  seedDust();
  updateOrbits();
  secondary.visible = glow2.visible = companion;
  $("#companion-btn").textContent = companion
    ? "− Remove companion star"
    : "＋ Add a companion star";
  $("#companion-state").textContent = companion
    ? mass.toFixed(1) + " M☉"
    : "Not added";
  $("#period").textContent = companion
    ? experiment.period.toFixed(2) + " years"
    : "—";
  $("#mass-value").textContent = mass.toFixed(1) + " M☉";
  updateTime();
}
function updateTime() {
  const period = experiment.companion
    ? orbitalElements(experiment.initial).period
    : null;
  $("#period").textContent = !experiment.companion
    ? "—"
    : period === null
      ? "Unbound"
      : period.toFixed(2) + " years";
  $("#timeline").max = comparison?.horizon ?? 30;
  $("#elapsed").innerHTML =
    experiment.time.toFixed(2) + " <small>years</small>";
  $("#timeline").value = experiment.time;
  $("#separation").textContent = experiment.companion
    ? experiment.separation.toFixed(3) + " AU"
    : "—";
}
function setPlaying(p) {
  playing = p;
  $("#play-btn").textContent = p ? "Ⅱ" : "▶";
  $("#play-btn").setAttribute(
    "aria-label",
    p ? "Pause experiment" : "Play experiment",
  );
}
function setTool(t) {
  tool = t;
  $("#brush-tool").classList.toggle("active", t === "paint");
  $("#orbit-tool").classList.toggle("active", t === "orbit");
  canvas.style.cursor = t === "paint" && mode === "lab" ? "crosshair" : "grab";
}
function applyMoment() {
  try {
    if (!$("#latitude").value.trim() || !$("#longitude").value.trim())
      throw Error("Enter both latitude and longitude.");
    const d = new Date($("#moment").value + "Z"),
      la = Number($("#latitude").value),
      lo = Number($("#longitude").value);
    skyTransform(d, la, lo);
    date = d;
    lat = la;
    lon = lo;
    updateSky();
  } catch (e) {
    toast(e.message);
    $("#moment").value = date.toISOString().slice(0, 16);
    $("#latitude").value = lat;
    $("#longitude").value = lon;
  }
}
$("#controls-toggle").onclick = () => {
  const open = document.body.classList.toggle("controls-open");
  $("#controls-toggle").setAttribute("aria-expanded", String(open));
};
$("#search").oninput = renderList;
$("#more-stars").onclick = () => {
  allNames = !allNames;
  $("#more-stars").textContent = allNames
    ? "Show favorites"
    : "Explore all named stars ↗";
  renderList();
};
$("#lines-toggle").onchange = (e) =>
  lineObjects.forEach((x) => (x.obj.visible = e.target.checked));
$("#horizon-toggle").onchange = (e) => (horizon.visible = e.target.checked);
$("#enter-lab").onclick = $("#lab-tab").onclick = () => setMode("lab");
$("#return-btn").onclick = $("#sky-tab").onclick = () => setMode("sky");
$("#brush-tool").onclick = () => setTool("paint");
$("#orbit-tool").onclick = () => setTool("orbit");
for (const b of $$(".swatch"))
  b.onclick = () => {
    colorIndex = Number(b.dataset.color);
    $$(".swatch").forEach((x) => x.classList.toggle("selected", x === b));
  };
$("#brush-size").oninput = (e) => {
  brushSize = Number(e.target.value);
  $("#brush-value").textContent =
    brushSize < 0.5 ? "Fine" : brushSize > 0.8 ? "Broad" : "Medium";
};
$("#companion-btn").onclick = () => {
  resetExperiment(!experiment.companion);
  toast(
    experiment.companion
      ? "Companion added. A new orbit begins."
      : "Companion removed. A fresh canvas.",
  );
};
$("#mass").oninput = (e) => {
  $("#mass-value").textContent = Number(e.target.value).toFixed(1) + " M☉";
};
$("#mass").onchange = () => {
  resetExperiment();
  toast("Mass changed. Experiment restarted.");
};
$("#reset-btn").onclick = () => {
  resetExperiment();
  toast("A fresh canvas.");
};
$("#play-btn").onclick = () => setPlaying(!playing);
$("#timeline").oninput = (e) => {
  setPlaying(false);
  targetTime = Number(e.target.value);
  experiment.seek(targetTime);
  seedDust();
  paintCount = 0;
  updateTime();
};
$("#timeline").onchange = () =>
  toast("Body motion restored. Artistic dust refreshed.");
$("#about-btn").onclick = $("#physics-btn").onclick = () =>
  $("#about").showModal();
$("#close-about").onclick = () => $("#about").close();
$("#about").addEventListener("click", (e) => {
  if (e.target === $("#about") && e.offsetX < 0) $("#about").close();
});
for (const id of ["moment", "latitude", "longitude"])
  $("#" + id).onchange = applyMoment;
function shiftHour(h) {
  date = new Date(date.getTime() + h * 3600000);
  if (date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2100) {
    date = new Date(
      Math.max(
        Date.UTC(1900, 0, 1),
        Math.min(Date.UTC(2100, 11, 31, 23, 59), date.getTime()),
      ),
    );
  }
  $("#moment").value = date.toISOString().slice(0, 16);
  updateSky();
}
$("#sky-back").onclick = () => shiftHour(-1);
$("#sky-forward").onclick = () => shiftHour(1);
$("#restore-sky").onclick = () => {
  date = new Date("2000-01-16T03:00Z");
  lat = 40.7128;
  lon = -74.006;
  $("#moment").value = date.toISOString().slice(0, 16);
  $("#latitude").value = lat;
  $("#longitude").value = lon;
  updateSky();
  focusStar(24436);
  toast("Demo sky restored: New York, January 15, 10 p.m. EST.");
};
$("#save-btn").onclick = () => {
  try {
    localStorage.setItem(
      "stellar-atelier-v1",
      JSON.stringify({
        version: 1,
        bodySnapshot: experiment.snapshot(),
        selected,
        date: date.toISOString(),
        lat,
        lon,
        mass: experiment.mass,
        companion: experiment.companion,
        time: experiment.time,
        studioYaw,
        studioPitch,
        studioDistance,
        colorIndex,
      }),
    );
    toast("Moment saved on this device. Paint is ephemeral.");
  } catch {
    toast("This browser could not save the moment.");
  }
};
$("#load-btn").onclick = () => {
  try {
    const s = JSON.parse(localStorage.getItem("stellar-atelier-v1"));
    if (!s) throw Error("No saved moment on this device yet.");
    if (
      s.version !== 1 ||
      !Number.isFinite(s.time) ||
      s.time < 0 ||
      s.time > 30 ||
      typeof s.companion !== "boolean"
    )
      throw Error("Saved moment is not valid.");
    skyTransform(new Date(s.date), s.lat, s.lon);
    const restored = s.bodySnapshot
      ? Experiment.fromSnapshot(s.bodySnapshot)
      : new Experiment(s.mass, s.companion);
    if (!s.bodySnapshot) restored.seek(s.time);
    date = new Date(s.date);
    lat = s.lat;
    lon = s.lon;
    $("#moment").value = date.toISOString().slice(0, 16);
    $("#latitude").value = lat;
    $("#longitude").value = lon;
    updateSky();
    focusStar(s.selected);
    $("#mass").value = s.mass;
    resetExperiment(s.companion, s.mass);
    experiment = restored;
    targetTime = experiment.time;
    updateOrbits();
    updateVelocity();
    if (experiment.companion) {
      const period = orbitalElements(experiment.bodies).period;
      $("#period").textContent =
        period === null ? "Unbound" : period.toFixed(2) + " years";
    }
    studioYaw = Number.isFinite(s.studioYaw) ? s.studioYaw : 0.2;
    studioPitch = Number.isFinite(s.studioPitch) ? s.studioPitch : 0.4;
    studioDistance = Number.isFinite(s.studioDistance)
      ? Math.max(6, Math.min(35, s.studioDistance))
      : 15;
    setPlaying(false);
    cameraUpdate();
    updateTime();
    toast("Saved moment restored. Paint starts fresh.");
  } catch (e) {
    toast(e.message || "Could not restore that moment.");
  }
};
let drag = null;
canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = {
    x: e.clientX,
    y: e.clientY,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  };
  brushHasLast = false;
  if (mode === "lab" && tool === "paint") paint(e.clientX, e.clientY, 0, 0);
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  drag.moved ||=
    Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 4;
  if (mode === "lab" && tool === "paint") paint(e.clientX, e.clientY, dx, dy);
  else {
    if (mode === "sky") {
      skyYaw -= dx * 0.004;
      skyPitch = Math.max(-1.5, Math.min(1.5, skyPitch + dy * 0.004));
    } else {
      studioYaw -= dx * 0.005;
      studioPitch = Math.max(-1.2, Math.min(1.3, studioPitch + dy * 0.005));
    }
    cameraUpdate();
  }
  drag.x = e.clientX;
  drag.y = e.clientY;
});
canvas.addEventListener("pointerup", (e) => {
  if (drag && !drag.moved && mode === "sky") {
    let closest = null,
      best = 22;
    for (let i = 0; i < features.length; i++) {
      const p = new THREE.Vector3(...skyPositions[i]);
      if (
        p
          .clone()
          .sub(camera.position)
          .dot(camera.getWorldDirection(new THREE.Vector3())) < 0
      )
        continue;
      p.project(camera);
      const d = Math.hypot(
        ((p.x + 1) / 2) * innerWidth - e.clientX,
        ((1 - p.y) / 2) * innerHeight - e.clientY,
      );
      if (d < best) {
        best = d;
        closest = features[i];
      }
    }
    if (closest) focusStar(closest.id);
  }
  drag = null;
  brushHasLast = false;
});
canvas.addEventListener("pointercancel", () => {
  drag = null;
  brushHasLast = false;
});
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (mode === "sky") {
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.035, 22, 95);
      camera.updateProjectionMatrix();
    } else
      studioDistance = THREE.MathUtils.clamp(
        studioDistance + e.deltaY * 0.015,
        6,
        35,
      );
    cameraUpdate();
  },
  { passive: false },
);
canvas.addEventListener("keydown", (e) => {
  if (e.key === " " && mode === "lab") {
    e.preventDefault();
    setPlaying(!playing);
  }
  if (e.key.toLowerCase() === "b") setTool("paint");
  if (e.key.toLowerCase() === "o") setTool("orbit");
  if (e.key === "Escape") setMode("sky");
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
    const x = e.key === "ArrowLeft" ? 0.08 : e.key === "ArrowRight" ? -0.08 : 0,
      y = e.key === "ArrowUp" ? 0.05 : e.key === "ArrowDown" ? -0.05 : 0;
    if (mode === "sky") {
      skyYaw += x;
      skyPitch = THREE.MathUtils.clamp(skyPitch + y, -1.5, 1.5);
    } else {
      studioYaw += x;
      studioPitch = THREE.MathUtils.clamp(studioPitch + y, -1.2, 1.3);
    }
    cameraUpdate();
  }
});
try {
  const [catalogue, lines] = await Promise.all([
    fetch("./stars.json").then((r) => {
      if (!r.ok) throw Error("Star catalogue unavailable");
      return r.json();
    }),
    fetch("./constellations.json").then((r) => r.json()),
  ]);
  features = catalogue.features;
  named = [
    24436,
    27989,
    32349,
    21421,
    ...Object.keys(names)
      .map(Number)
      .filter((id) => ![24436, 27989, 32349, 21421].includes(id)),
  ]
    .map((id) => features.find((f) => f.id === id))
    .filter(Boolean);
  const c = [],
    sizes = [],
    op = [];
  for (const f of features) {
    c.push(...starColor(f.properties.bv).toArray());
    sizes.push(
      Math.max(2.4, 13 - Number(f.properties.mag) * 1.65) *
        renderer.getPixelRatio(),
    );
    op.push(Math.max(0.4, 1 - Number(f.properties.mag) * 0.06));
  }
  starPoints = pointCloud(new Array(features.length * 3).fill(0), c, sizes, op);
  sky.add(starPoints);
  for (const f of lines.features) {
    const coords = [];
    for (const line of f.geometry.coordinates)
      for (let i = 1; i < line.length; i++) coords.push(line[i - 1], line[i]);
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Array(coords.length * 3).fill(0), 3),
    );
    const obj = new THREE.LineSegments(
      g,
      new THREE.LineBasicMaterial({
        color: f.id === "Ori" ? 0x718bb2 : 0x4c627e,
        transparent: true,
        opacity: f.id === "Ori" ? 0.4 : 0.2,
      }),
    );
    sky.add(obj);
    lineObjects.push({ obj, coords });
  }
  for (const f of named) {
    const e = document.createElement("span");
    e.className = "sky-label";
    e.textContent = names[f.id][0];
    labels.set(f.id, e);
    $("#labels").append(e);
  }
  updateSky();
  focusStar(24436);
  $("#status").textContent = "5,044 CATALOGUE STARS";
} catch (e) {
  toast(e.message);
  $("#status").textContent = "Could not load the sky";
  console.error(e);
}
function placeLabel(e, p) {
  const forward = camera.getWorldDirection(new THREE.Vector3());
  if (p.clone().sub(camera.position).dot(forward) < 0) {
    e.style.display = "none";
    return;
  }
  const v = p.clone().project(camera),
    x = ((v.x + 1) * innerWidth) / 2,
    y = ((1 - v.y) * innerHeight) / 2;
  const left = innerWidth < 760 ? 190 : 330,
    right = innerWidth < 760 ? innerWidth : innerWidth - 330;
  let show = x > left && x < right && y > 115 && y < innerHeight - 160;
  const width = e.textContent.length * 7 + 15;
  if (
    show &&
    labelBoxes.some(
      (b) => x < b.x + b.w && x + width > b.x && Math.abs(y - b.y) < 19,
    )
  )
    show = false;
  if (show) labelBoxes.push({ x, y, w: width });
  e.style.display = show ? "block" : "none";
  e.style.left = x + "px";
  e.style.top = y + "px";
}
let labelBoxes = [];
let previous = performance.now(),
  fpsFrames = 0,
  fpsStart = previous,
  frameMs = 0;
const frameIntervals = [];
function frame(now) {
  requestAnimationFrame(frame);
  const interval = now - previous;
  const dt = Math.min(interval / 1000, 0.05);
  previous = now;
  frameMs = interval;
  if (!document.hidden && interval > 0) {
    frameIntervals.push(interval);
    if (frameIntervals.length > 120) frameIntervals.shift();
  }
  if (mode === "lab") {
    if (playing) {
      targetTime = Math.min(
        comparison?.horizon ?? 30,
        targetTime + dt * Number($("#speed").value),
      );
      try {
        experiment.seek(targetTime);
      } catch (e) {
        setPlaying(false);
        toast(e.message);
      }
      moveDust(dt);
      if (targetTime >= (comparison?.horizon ?? 30)) setPlaying(false);
    }
    primary.position.set(...experiment.bodies[0].p);
    glow1.position.copy(primary.position);
    if (experiment.companion) {
      secondary.position.set(...experiment.bodies[1].p);
      glow2.position.copy(secondary.position);
    }
    starMaterial.uniforms.time.value = now / 1000;
    secondary.material.uniforms.time.value = now / 1000;
    glow1.geometry.attributes.size.array[0] = (150 * 15) / studioDistance;
    glow1.geometry.attributes.size.needsUpdate = true;
    glow2.geometry.attributes.size.array[0] = (110 * 15) / studioDistance;
    glow2.geometry.attributes.size.needsUpdate = true;
    updateTime();
  } else {
    labelBoxes = [];
    for (const [id, e] of [...labels].sort(
      (a, b) => (b[0] === selected) - (a[0] === selected),
    )) {
      const i = features.findIndex((f) => f.id === id);
      if (i >= 0) placeLabel(e, new THREE.Vector3(...skyPositions[i]));
    }
    for (const h of horizonLabels) {
      if (horizon.visible) placeLabel(h.e, h.p);
      else h.e.style.display = "none";
    }
  }
  renderer.render(scene, camera);
  fpsFrames++;
  if (now - fpsStart > 1000) {
    fpsFrames = 0;
    fpsStart = now;
  }
}
cameraUpdate();
requestAnimationFrame(frame);
window.addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  cameraUpdate();
});
const getState = () => ({
  mode,
  selectedStar: $("#star-name").textContent,
  catalogueCount: features.length,
  utc: date.toISOString(),
  latitude: lat,
  longitude: lon,
  companion: experiment.companion,
  mass: experiment.mass,
  years: experiment.time,
  playing,
  paintStrokes: paintCount,
  bodyPositions: experiment.bodies.map((b) => [...b.p]),
  bodySnapshot: experiment.snapshot(),
  comparison: comparison ? structuredClone(comparison) : null,
  energy: experiment.energy(),
  frameMs,
  frameSampleCount: frameIntervals.length,
  p95FrameMs: frameIntervals.length
    ? [...frameIntervals].sort((a, b) => a - b)[
        Math.floor((frameIntervals.length - 1) * 0.95)
      ]
    : null,
  drawCalls: renderer.info.render.calls,
});
const creative = setupCreative({
  pause: () => setPlaying(false),
  snapshot: () => experiment.snapshot(),
  preview: (result) => {
    beforeComparison ||= experiment.snapshot();
    comparison = result;
    experiment = Experiment.fromSnapshot(result.baseline.start);
    $("#mass").value = experiment.mass;
    $("#mass-value").textContent = experiment.mass.toFixed(1) + " M☉";
    $("#companion-state").textContent = experiment.mass.toFixed(1) + " M☉";
    $("#companion-btn").textContent = "− Remove companion star";
    secondary.visible = glow2.visible = true;
    updateVelocity();
    targetTime = 0;
    setPlaying(false);
    updateOrbits();
    updateTime();
    $("#alternative-btn").disabled = $("#revert-compare").disabled = false;
    $("#period").textContent = experiment.period.toFixed(2) + " years";
  },
  play: () => $("#alternative-btn").click(),
  revert: () => $("#revert-compare").click(),
});
window.__STELLAR_ATELIER__ = {
  getState: () => ({ ...getState(), liveRecords: creative.getRecords() }),
};
if (document.modelContext?.registerTool) {
  for (const t of [
    {
      name: "read_stellar_scene",
      description: "Read the current sky or stellar experiment.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => getState(),
    },
    {
      name: "open_stellar_studio",
      description:
        "Open a separate experimental canvas inspired by the selected catalogue star.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      execute: () => {
        setMode("lab");
        return getState();
      },
    },
    {
      name: "configure_stellar_experiment",
      description:
        "Start a new gravity experiment. Clears existing paint and resets experiment time.",
      inputSchema: {
        type: "object",
        properties: {
          companion: { type: "boolean" },
          mass: { type: "number", minimum: 0.2, maximum: 2 },
        },
        required: ["companion", "mass"],
        additionalProperties: false,
      },
      execute: (i) => {
        if (
          typeof i.companion !== "boolean" ||
          !Number.isFinite(i.mass) ||
          i.mass < 0.2 ||
          i.mass > 2
        )
          throw Error("Invalid companion or mass");
        setMode("lab");
        $("#mass").value = i.mass;
        resetExperiment(i.companion, i.mass);
        setPlaying(false);
        return getState();
      },
    },
  ])
    try {
      Promise.resolve(document.modelContext.registerTool(t)).catch(() => {});
    } catch {}
}
