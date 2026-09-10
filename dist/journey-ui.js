import { Journey, V } from "./journey.js";
const $ = (s) => document.querySelector(s),
  fmt = (v, n = 1) =>
    Number(v).toLocaleString(undefined, { maximumFractionDigits: n }),
  escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const features = (await (await fetch("./stars.json")).json()).features;
let seed = 93741,
  game = new Journey(features, { seed }),
  epoch = 0,
  request = null,
  pending = null,
  preview = null,
  history = [],
  selected = "L1",
  yaw = 0.25,
  pitch = 0.3,
  zoom = 1,
  previousRoute = null,
  hasDelegated = false,
  autoMining = false;
const labels = {
  calibrate: "Calibrate the sky",
  survey: "Inspect the asteroid",
  "launch-stop": "Intercept the asteroid",
  "launch-home": "Set course for home",
  coast: "Coast to checkpoint",
  brake: "Brake and verify",
  extract: "Extract the finite deposit",
  experiment: "Raw physics experiment",
};
function say(role, text, source) {
  const article = document.createElement("article");
  article.className = role;
  const small = document.createElement("small");
  small.textContent = source ?? (role === "user" ? "YOU" : "LIVE ASTRA");
  const p = document.createElement("p");
  p.textContent = text;
  article.append(small, p);
  $("#conversation").append(article);
  $("#conversation").scrollTop = 1e6;
  if (role === "user" || source === "LIVE ASTRA" || !source)
    history.push({
      role: role === "user" ? "user" : "assistant",
      text: text.slice(0, 800),
    });
  history = history.slice(-16);
}
function stop() {
  epoch++;
  request?.abort();
  request = null;
  game.pause();
  pending = null;
  preview = null;
  $("#pending-action").replaceChildren();
  render();
}
function error(e) {
  stop();
  say("astra", e.message, "PAUSED · NO ACTION COMMITTED");
}
function resourceText(q) {
  return `${fmt(q.cost.fuel)} fuel · ${fmt(q.cost.credits)} credits · ${fmt(q.cost.lifetime)} years`;
}
function render() {
  const v = game.view();
  for (const k of ["fuel", "credits", "lifetime"]) {
    $("#" + k).textContent = fmt(v.resources[k]);
    $("#budget-" + k).disabled = hasDelegated;
  }
  $("#elapsed").textContent = `${fmt(v.time)} YEARS ELAPSED`;
  $("#interrupt").disabled = !v.active && !request;
  $("#delegate").textContent =
    v.phase === "arrived"
      ? "Home, verified"
      : hasDelegated
        ? v.active
          ? "Astra has the helm"
          : "Continue within remaining budget"
        : "Get us home. You drive. ↗";
  $("#delegate").disabled = v.active || v.phase === "arrived";
  $("#budget-spend").textContent = hasDelegated
    ? `${fmt(v.spent.fuel)} F · ${fmt(v.spent.credits)} C · ${fmt(v.spent.lifetime)} Y spent`
    : "Gross spending cap";
  $("#driver-status").textContent = request
    ? "Considering the observed evidence…"
    : v.phase === "arrived"
      ? "Position and speed verified."
      : v.active
        ? "Driving within your budget."
        : "Paused · you have the helm.";
  const title =
    v.phase === "unknown"
      ? "Which way is home?"
      : v.phase === "arrived"
        ? "We made it home."
        : v.target?.name === "asteroid"
          ? "A useful detour."
          : v.target?.name === "home"
            ? "The long crossing."
            : v.phase === "at-stop"
              ? "A rock worth stopping for."
              : v.phase === "mined"
                ? "Enough for the road ahead."
                : "A position. A way forward.";
  $("#scene-title").textContent = title;
  $("#scene-description").textContent =
    v.phase === "unknown"
      ? "Look around. Select a light. Bearings alone cannot tell us which way is home."
      : v.phase === "arrived"
        ? `Arrival checked at ${fmt(v.homeDistance, 8)} ly · ${fmt(V.norm(v.velocity), 8)} ly/year.`
        : `Home ${fmt(v.homeDistance, 2)} light-years away · ${fmt(V.norm(v.velocity), 3)} ly/year${v.target ? ` · ${fmt(v.target.remaining)} years to ${v.target.name}` : ""}`;
  $("#map-legend").innerHTML = v.calibration
    ? '<span><i class="star-dot"></i>Recovered space</span><span style="color:#f1c28b">Current motion</span><span style="color:#7aa2d8">Gravity suppressed</span><span style="color:#9cead9">With impulse</span>'
    : '<span><i class="star-dot"></i>Observed landmark</span><span>Ship frame · bearing only</span>';
  $("#landmark-strip").innerHTML = v.observations
    .map(
      (o) =>
        `<button data-landmark="${o.label}" class="${selected === o.label ? "selected" : ""}">${o.label}${o.range ? ` · ${fmt(o.range, 2)} ly` : ""}</button>`,
    )
    .join("");
  const o = v.observations.find((o) => o.label === selected);
  let report = o
    ? `<strong>${o.label} · ${o.catalogueId ? `Catalogue ${o.catalogueId}` : "Unidentified light"}</strong><p>Ship-frame bearing [${o.bearing.map((n) => fmt(n, 3)).join(", ")}]. ${o.range ? `Scan range ${fmt(o.range, 5)} ly. Tagged correspondence, independently verified.` : "Range unknown. Identity unresolved. A close-looking pair may be far apart in depth."}</p>`
    : "";
  if (v.calibration)
    report += `<p>Position recovered from four ranges; attitude from bearings. ${v.calibration.landmarks - 4} held-out landmarks agree within ${v.calibration.heldOutResidual.toExponential(1)} ly in this ideal sensor model.</p>`;
  if (v.report) {
    const r = v.report;
    report += `<p><b>Asteroid · polar patch A</b> · radius ${r.radiusKm} km · spin ${r.spinPeriodHours} h · stationary. ${v.deposit.fuel ? "Gross deposit: 32 fuel + 8 credits. Extraction: 3 fuel + 2 credits + 2 years. Report: 3 credits already paid." : "Deposit exhausted; no further reward."}</p>`;
  }
  if (v.phase === "arrived")
    report = `<strong>Arrival receipt · ${fmt(v.time)} simulated years</strong><p>Position ${v.homeDistance.toExponential(2)} ly from home; speed ${V.norm(v.velocity).toExponential(2)} ly/year. Both arrival conditions passed.</p><p>Spent ${fmt(v.spent.fuel)} fuel and ${fmt(v.spent.credits)} credits within your original delegation. ${v.ledger.some((x) => x.kind === "extract") ? "Recovered 32 fuel and 8 credits from one exhausted deposit." : "No resources extracted."}</p>`;
  $("#report").innerHTML = report;
  $("#ledger-count").textContent = `${v.ledger.length} actions`;
  $("#ledger").innerHTML = v.ledger
    .map(
      (l) =>
        `<tr><td>${escape(labels[l.kind])}</td><td>−${fmt(l.cost.fuel)} / +${fmt(l.reward.fuel)}</td><td>−${fmt(l.cost.credits)} / +${fmt(l.reward.credits)}</td><td>${fmt(l.cost.lifetime)}</td><td>${fmt(l.balance.fuel)} · ${fmt(l.balance.credits)} · ${fmt(l.balance.lifetime)}</td></tr>`,
    )
    .join("");
  renderRoutes();
  draw();
}
function renderRoutes() {
  const v = game.view(),
    el = $("#route-options");
  el.replaceChildren();
  if (!v.calibration || v.target || v.phase === "arrived") return;
  for (const kind of [
    "launch-home",
    ...(v.report && v.deposit.fuel ? ["launch-stop"] : []),
  ]) {
    if (!game.options().includes(kind)) continue;
    try {
      const q = game.quote(kind),
        button = document.createElement("button");
      button.className = "route-card";
      const total = q.cost.fuel + q.detail.braking;
      button.innerHTML = `<strong>${kind === "launch-home" ? "Direct home" : "Asteroid detour"}</strong><small>${fmt(q.detail.years)} years · ${fmt(q.detail.speed, 3)} ly/year</small><small>${fmt(total)} fuel incl. this leg’s braking</small><small>${kind === "launch-stop" ? `Full trip: ${fmt(q.detail.miningComparison.totalYears)} years · ${fmt(q.detail.miningComparison.totalFuelSpent)} fuel spent, 32 recovered; net ${q.detail.miningComparison.netFuel >= 0 ? "+" : "−"}${fmt(Math.abs(q.detail.miningComparison.netFuel))} fuel. Stop credits: 5 spent / 8 recovered; calibration 6 already paid.` : `${fmt(q.detail.reserve)} fuel reserved for arrival.`}</small>`;
      button.onclick = () => {
        if (game.view().active) stop();
        preview = game.preview(game.quote(kind).id);
        draw();
        say(
          "astra",
          `${labels[kind]} preview: ${resourceText(q)} to launch, then ${fmt(q.detail.braking)} fuel to brake. ${kind === "launch-stop" ? "Mining adds 32 gross fuel and 8 credits; extraction costs 3 fuel, 2 credits, 2 years. Onward home launch and braking remain additional." : ""}`,
          "COMPUTED ROUTE · PREVIEW ONLY",
        );
      };
      el.append(button);
    } catch (e) {
      const p = document.createElement("p");
      p.textContent = e.message;
      el.append(p);
    }
  }
}
function publicRequest(message, quotes) {
  const v = game.view();
  return {
    requestId: crypto.randomUUID(),
    revision: v.revision,
    message,
    history: history.slice(-16),
    observation: {
      phase: v.phase,
      delegated: v.active,
      resources: v.resources,
      budgetRemaining: Object.fromEntries(
        Object.keys(v.budget).map((k) => [
          k,
          Math.max(0, v.budget[k] - v.spent[k]),
        ]),
      ),
      preference: v.preference,
      landmarks: v.observations,
      asteroid: v.report
        ? {
            relativePosition: V.sub(v.report.position, v.position),
            velocity: v.report.velocity,
            radiusKm: v.report.radiusKm,
            operationRadiusLy: v.report.operationRadiusLy,
            spinPeriodHours: v.report.spinPeriodHours,
            grossFuel: v.deposit.fuel,
            grossCredits: v.deposit.credits,
            extractionFuel: 3,
            extractionCredits: 2,
            extractionYears: 2,
            reportCreditsPaid: 3,
          }
        : null,
      navigation: v.calibration
        ? {
            distance: v.homeDistance,
            speed: V.norm(v.velocity),
            target: v.target?.name ?? "none",
            remaining: v.target?.remaining ?? 0,
            calibrationResidual: v.calibration.residual,
          }
        : null,
    },
    choices: quotes.map((q) => ({
      id: q.id,
      kind: q.kind,
      cost: q.cost,
      summary: q.detail.summary.slice(0, 400),
      years: q.detail.years ?? 0,
      reserve: q.detail.reserve ?? 0,
      evidence: q.kind.startsWith("launch-")
        ? {
            impulse: q.detail.impulse,
            gravityBefore: q.detail.gravityBefore,
            gravityAfter: q.detail.gravityAfter,
            gravityDuration: q.detail.gravityDuration,
            braking: q.detail.braking,
            speed: q.detail.speed,
            endpointSeparation: V.norm(
              V.sub(
                game.preview(q.id).current.p,
                game.preview(q.id).proposed.p,
              ),
            ),
            grossFuel: 0,
            grossCredits: 0,
          }
        : q.kind === "survey"
          ? {
              impulse: [0, 0, 0],
              gravityBefore: 0,
              gravityAfter: 0,
              gravityDuration: 0,
              braking: 0,
              speed: 0,
              endpointSeparation: 0,
              grossFuel: 0,
              grossCredits: 0,
            }
          : {
              impulse: [0, 0, 0],
              gravityBefore: 0,
              gravityAfter: 0,
              gravityDuration: 0,
              braking: 0,
              speed: 0,
              endpointSeparation: 0,
              grossFuel: q.reward.fuel,
              grossCredits: q.reward.credits,
            },
    })),
  };
}
async function decide(
  message = "Continue the delegated plan using the latest evidence.",
  observeOnly = false,
) {
  const token = epoch;
  if (!game.view().active && !observeOnly) return;
  let quotes;
  try {
    quotes = game.options().map((k) => game.quote(k));
  } catch (e) {
    return error(e);
  }
  if (!quotes.length) return;
  const body = publicRequest(message, quotes),
    controller = new AbortController();
  request = controller;
  render();
  try {
    let res;
    for (let attempt = 0; attempt < 21; attempt++) {
      res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.status !== 409) break;
      await new Promise((r) => setTimeout(r, 5000));
      if (token !== epoch) return;
    }
    const data = await res.json();
    if (token !== epoch || body.revision !== game.revision) return;
    if (!res.ok) throw Error(data.message || "Live Astra unavailable.");
    if (
      data.requestId !== body.requestId ||
      data.revision !== body.revision ||
      data.model !== "gpt-6-astra"
    )
      throw Error("Stale or unsupported model reply rejected.");
    request = null;
    const p = data.proposal;
    say("astra", p.summary, "LIVE ASTRA");
    if (observeOnly) {
      if (p.preference !== "keep") game.preference(p.preference);
      render();
      return;
    }
    if (p.preference !== "keep" && p.preference !== game.view().preference) {
      const old = quotes.find((q) => q.kind === "launch-home");
      previousRoute = old
        ? {
            fuel: old.cost.fuel + old.detail.braking,
            years: old.detail.years,
            speed: old.detail.speed,
          }
        : null;
      game.preference(p.preference);
      if (game.view().target)
        say(
          "astra",
          "This leg is already underway. The new speed preference applies to the next launch; slowing now would require an extra burn. Coast and arrival braking retain their current quotes.",
          "PLAN SCOPE",
        );
      if (previousRoute) {
        const next = game.quote("launch-home");
        say(
          "astra",
          `Plan revised: ${fmt(previousRoute.speed, 3)} → ${fmt(next.detail.speed, 3)} ly/year. Home launch + braking: ${fmt(previousRoute.fuel)} → ${fmt(next.cost.fuel + next.detail.braking)} fuel. Travel: ${fmt(previousRoute.years)} → ${fmt(next.detail.years)} years.`,
          "COMPUTED CHANGE",
        );
      }
      render();
      return decide(
        "The preference is updated. Continue driving with revised affordable quotes.",
      );
    }
    if (p.actionId === null) {
      stop();
      return;
    }
    const q = quotes.find((q) => q.id === p.actionId);
    if (!q) throw Error("Unsupported action rejected.");
    await schedule(q, token);
  } catch (e) {
    if (e.name !== "AbortError" && token === epoch) error(e);
  } finally {
    if (request === controller) request = null;
    render();
  }
}
async function schedule(q, token = epoch) {
  if (token !== epoch || !game.view().active) return;
  pending = q;
  preview = game.preview(q.id);
  if (q.kind.startsWith("launch-")) autoMining = q.kind === "launch-stop";
  let seconds = q.kind.startsWith("launch-")
    ? 10
    : q.kind === "calibrate"
      ? 4
      : q.kind === "coast"
        ? 1.5
        : 3;
  $("#pending-action").innerHTML =
    `<strong>${escape(labels[q.kind])}</strong>${resourceText(q)}${q.detail.reserve ? `<br>Keep ${fmt(q.detail.reserve)} fuel reserved.` : ""}<small>${q.kind.startsWith("launch-") ? `Gravity ${q.detail.gravityBefore} → 0 for up to ${fmt(q.detail.gravityDuration)} years · impulse ${fmt(V.norm(q.detail.impulse), 4)} ly/year. Interrupt to revise.` : q.kind === "coast" ? `${fmt(q.cost.lifetime)} simulated years compressed into this checkpoint.` : q.kind === "calibrate" ? "Bearings leave position and depth unresolved. Four tagged ranges distinguish candidate positions; four additional stars test the fix. Total investigation: 6 credits." : "Supported action, checked against your remaining budget."}</small><button id="advance" class="quiet" style="margin-top:10px">Advance now</button><small id="countdown"></small>`;
  render();
  let advance = false;
  $("#advance").onclick = () => (advance = true);
  const start = performance.now();
  while (!advance && performance.now() - start < seconds * 1000) {
    if (token !== epoch || !game.view().active) return;
    $("#countdown").textContent =
      `Executing in ${Math.max(0, Math.ceil(seconds - (performance.now() - start) / 1000))} s · Interrupt to pause`;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (token !== epoch || q.revision !== game.revision || !game.view().active)
    return;
  try {
    game.commit(q.id);
    pending = null;
    preview = null;
    $("#pending-action").replaceChildren();
    render();
    if (q.kind === "calibrate")
      say(
        "astra",
        "Range evidence resolves depth; four independent landmarks validate the position and attitude. Home navigation is now unlocked.",
        "SENSOR & SOLVER RESULT",
      );
    if (q.kind === "extract")
      say(
        "astra",
        "Extraction complete: +32 fuel and +8 credits gross; −3 fuel, −2 credits, −2 years. Patch A is exhausted.",
        "VERIFIED OPERATION",
      );
    if (game.view().phase === "arrived") {
      say(
        "astra",
        "We are inside the home arrival region and at rest. The ledger reconciles every debit and yield.",
        "VERIFIED ARRIVAL",
      );
      return;
    }
    const options = game.options();
    if (options.length === 1) return schedule(game.quote(options[0]), token);
    if (game.view().phase === "at-stop" && autoMining)
      return schedule(game.quote("extract"), token);
    return decide();
  } catch (e) {
    error(e);
  }
}
function takeHelm(message, explicit = false) {
  if (game.view().active || request) stop();
  if (!hasDelegated && !explicit) return decide(message, true);
  try {
    if (!hasDelegated) {
      game.delegate(
        Object.fromEntries(
          ["fuel", "credits", "lifetime"].map((k) => [
            k,
            Number($("#budget-" + k).value),
          ]),
        ),
      );
      hasDelegated = true;
    } else game.resume();
    render();
    decide(message);
  } catch (e) {
    error(e);
  }
}
$("#delegate").onclick = () =>
  takeHelm(
    "Get us home. You drive within the displayed budget, including a useful finite resource stop if affordable.",
    true,
  );
$("#interrupt").onclick = () => {
  stop();
  say(
    "astra",
    "Paused. The pending action is invalidated; your remaining gross-spend budget is preserved.",
    "HELM INTERRUPTED",
  );
};
$("#chat-form").onsubmit = (e) => {
  e.preventDefault();
  const m = $("#message").value.trim();
  if (!m) return;
  $("#message").value = "";
  say("user", m);
  takeHelm(m);
};
document.querySelectorAll("[data-message]").forEach(
  (b) =>
    (b.onclick = () => {
      const m = b.dataset.message;
      say("user", m);
      takeHelm(m);
    }),
);
$("#landmark-strip").onclick = (e) => {
  if (e.target.dataset.landmark) {
    selected = e.target.dataset.landmark;
    render();
  }
};
function reset(s) {
  stop();
  seed = s;
  game = new Journey(features, { seed });
  hasDelegated = false;
  history = [];
  autoMining = false;
  previousRoute = null;
  selected = "L1";
  $("#conversation").replaceChildren();
  say(
    "astra",
    "Unidentified bearings only. Select a light, try a raw experiment, or delegate a six-credit calibration.",
    "MISSION BRIEF",
  );
  render();
}
$("#new-journey").onclick = () => reset(Math.floor(Math.random() * 2 ** 32));
const replay = document.createElement("button");
replay.className = "quiet";
replay.textContent = "Reset same sky";
replay.onclick = () => reset(seed);
$("#new-journey").after(replay);
$("#export-ledger").onclick = () => {
  const b = new Blob(
      [
        JSON.stringify(
          { model: "synthetic-journey-v1", ...game.view() },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
    url = URL.createObjectURL(b),
    a = document.createElement("a");
  a.href = url;
  a.download = "journey-record.json";
  a.click();
  URL.revokeObjectURL(url);
};
const raw = document.createElement("details");
raw.className = "raw-experiment";
raw.innerHTML =
  '<summary>Raw physics experiment</summary><p>Ship-axis impulse. Changes motion; offers no homeward claim.</p><label>Impulse (ly/year) <input id="raw-impulse" type="range" min="-0.02" max="0.02" value="0.005" step="0.001"></label><label>Gravity multiplier <select id="raw-gravity"><option value="1">1 · current attraction</option><option value="0">0 · suppress attraction</option></select></label><button id="raw-preview" class="quiet">Preview from current state</button><button id="raw-commit" class="quiet" disabled>Apply quoted experiment</button><p id="raw-quote"></p>';
$(".workspace").append(raw);
let rawQuote = null;
$("#raw-preview").onclick = () => {
  stop();
  try {
    rawQuote = game.rawQuote({
      impulse: Number($("#raw-impulse").value),
      gravity: Number($("#raw-gravity").value),
    });
    preview = game.preview(rawQuote.id);
    $("#raw-quote").textContent =
      `Quote: ${resourceText(rawQuote)}. ${$("#raw-impulse").value} ly/year impulse. Same-state computed preview; no position fix is gained.`;
    $("#raw-commit").disabled = false;
    draw();
  } catch (e) {
    error(e);
  }
};
$("#raw-commit").onclick = () => {
  try {
    if (!rawQuote) throw Error("Preview first");
    if (
      rawQuote.revision !== game.revision ||
      Number($("#raw-impulse").value) !== rawQuote.detail.impulse[0] ||
      Number($("#raw-gravity").value) !== rawQuote.detail.gravityAfter
    )
      throw Error("Experiment changed; preview again");
    const options = {
      impulse: Number($("#raw-impulse").value),
      gravity: Number($("#raw-gravity").value),
    };
    if (!hasDelegated) {
      game.delegate(
        Object.fromEntries(
          ["fuel", "credits", "lifetime"].map((k) => [
            k,
            Number($("#budget-" + k).value),
          ]),
        ),
      );
      hasDelegated = true;
    } else game.resume();
    const q = game.rawQuote(options);
    if (q.cost.fuel !== rawQuote.cost.fuel)
      throw Error("Experiment changed; preview again");
    game.commit(q.id);
    game.pause();
    rawQuote = null;
    preview = null;
    $("#raw-commit").disabled = true;
    render();
  } catch (e) {
    error(e);
  }
};
const canvas = $("#journey-map"),
  ctx = canvas.getContext("2d");
let projected = [];
function draw() {
  const rect = canvas.getBoundingClientRect(),
    dpr = Math.min(devicePixelRatio, 2),
    w = rect.width,
    h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const v = game.view();
  const center = preview?.initial.p ?? (v.calibration ? v.position : [0, 0, 0]);
  const transform = (p) => {
    const a = V.sub(p, center),
      c = Math.cos(yaw),
      s = Math.sin(yaw),
      x = a[0] * c - a[2] * s,
      z = a[0] * s + a[2] * c,
      y = a[1] * Math.cos(pitch) - z * Math.sin(pitch);
    return [x, y, z];
  };
  let scale =
    zoom *
    (v.calibration
      ? preview
        ? Math.min(w, h) / 1.1
        : Math.min(w, h) / (Math.max(v.homeDistance, 0.5) * 2.8)
      : Math.min(w, h) * 0.32);
  const project = (p) => {
    const a = transform(p);
    return [w * 0.49 + a[0] * scale, h * 0.58 - a[1] * scale, a[2]];
  };
  ctx.strokeStyle = "#263b5148";
  ctx.lineWidth = 1;
  for (let r = 1; r < 5; r++) {
    ctx.beginPath();
    ctx.ellipse(
      w * 0.49,
      h * 0.58,
      r * Math.min(w, h) * 0.12,
      r * Math.min(w, h) * 0.07,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.lineTo(w, h * 0.58);
  ctx.stroke();
  ctx.setLineDash([]);
  const line = (points, color, width = 1.5, dash = []) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    points.forEach((p, i) => {
      const [x, y] = project(p);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  };
  const dot = (p, color, label, r = 4) => {
    const [x, y, z] = project(p);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#dbe6f3";
    ctx.font = '12px "DM Sans", sans-serif';
    ctx.fillText(label, x + 10, y - 10);
    return { x, y, label };
  };
  projected = [];
  if (!v.calibration && !preview) {
    line(
      v.observations.slice(0, 5).map((o) => o.bearing),
      "#52688055",
      1,
      [4, 7],
    );
    for (const o of v.observations)
      projected.push(
        dot(
          o.bearing,
          o.label === selected ? "#f1c28b" : "#c9f5ed",
          o.label,
          o.label === selected ? 5 : 3,
        ),
      );
    ctx.fillStyle = "#73859d";
    ctx.font = '12px "DM Sans"';
    ctx.fillText("DEPTH UNRESOLVED", 24, h - 95);
  } else {
    if (v.calibration) {
      for (const o of v.observations) {
        const local = V.scale(o.bearing, o.range),
          world = V.add(
            v.calibration.position,
            v.calibration.orientation.map((row) => V.dot(row, local)),
          );
        const p = dot(
          world,
          o.label === selected ? "#f1c28b" : "#74929e",
          o.label === selected ? o.label : "",
          o.label === selected ? 4 : 2,
        );
        projected.push({ ...p, label: o.label });
      }
      if (!preview) {
        dot([0, 0, 0], "#f1c28b", "HOME", 6);
        line([v.position, [0, 0, 0]], "#698e9360", 1, [4, 6]);
      }
      dot(v.source, "#eaae77", "LOCAL ATTRACTION", 6);
      if (v.report) {
        dot(v.report.position, "#b7a5df", "ASTEROID", 5);
        line([v.report.corridor, v.report.position], "#b7a5df", 3);
      }
    }
    dot(center, "#ffffff", "SHIP", 4);
    if (preview) {
      line(preview.current.path, "#eabd8b", 2);
      line(preview.gravityOnly.path, "#7a9dd5", 1.5, [5, 5]);
      line(preview.proposed.path, "#9cead9", 2.5);
      ctx.fillStyle = "#9aafc5";
      ctx.font = '13px "DM Sans"';
      ctx.fillText(
        `${fmt(preview.years)}-year projection · identical starting position and velocity`,
        24,
        h - 95,
      );
    } else if (v.target) line([v.position, v.target.p], "#9cead9", 2);
  }
}
let drag = null;
canvas.onpointerdown = (e) => {
  drag = { x: e.clientX, y: e.clientY, moved: false };
  canvas.setPointerCapture(e.pointerId);
};
canvas.onpointermove = (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
  yaw += dx * 0.006;
  pitch = Math.max(-1.4, Math.min(1.4, pitch + dy * 0.006));
  drag.x = e.clientX;
  drag.y = e.clientY;
  draw();
};
canvas.onpointerup = (e) => {
  if (drag && !drag.moved) {
    const r = canvas.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top,
      p = projected.find((p) => Math.hypot(p.x - x, p.y - y) < 22);
    if (p) {
      selected = p.label;
      render();
    }
  }
  drag = null;
};
canvas.onwheel = (e) => {
  e.preventDefault();
  zoom = Math.max(0.3, Math.min(8, zoom * Math.exp(-e.deltaY * 0.001)));
  draw();
};
canvas.onkeydown = (e) => {
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "-"].includes(
      e.key,
    )
  ) {
    e.preventDefault();
    yaw += e.key === "ArrowRight" ? 0.1 : e.key === "ArrowLeft" ? -0.1 : 0;
    pitch += e.key === "ArrowUp" ? 0.1 : e.key === "ArrowDown" ? -0.1 : 0;
    zoom *= e.key === "+" ? 1.1 : e.key === "-" ? 0.9 : 1;
    draw();
  }
};
$("#view-map").onclick = () => {
  yaw = 0.25;
  pitch = 0.3;
  zoom = 1;
  draw();
};
new ResizeObserver(draw).observe(canvas);
render();
