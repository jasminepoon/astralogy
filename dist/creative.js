import { Experiment, probeReturn } from "./physics.js";
const $ = (s) => document.querySelector(s);
export function setupCreative(api) {
  let revision = 0,
    activeRequest = null,
    busy = false;
  const records = [];
  function invalidate() {
    revision++;
  }
  for (const id of ["#outcome", "#return-deadline"])
    $(id).addEventListener("input", invalidate);
  document.addEventListener("input", (e) => {
    if (e.target.matches("#mass,#timeline,#velocity-tangent,#velocity-radial"))
      invalidate();
  });
  document.addEventListener("click", (e) => {
    if (
      e.target.closest(
        "#companion-btn,#reset-btn,#play-btn,#load-btn,#compare-btn,#alternative-btn,#revert-compare",
      )
    )
      invalidate();
  });
  function status(text) {
    $("#astra-status").textContent = text;
  }
  fetch("/api/status")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((s) => {
      status(
        s.cliInstalled
          ? "Live Astra · ready to connect"
          : "Astra unavailable · local Codex connection required",
      );
    })
    .catch(() =>
      status("Astra unavailable here · open the local demo to connect"),
    );
  $("#sooner-btn").onclick = () => {
    $("#outcome").value =
      "Bring them back sooner, within eight years. Keep the masses and the 4 AU closest approach.";
    invalidate();
    $("#explore-btn").click();
  };
  $("#explore-btn").onclick = async () => {
    if (busy) return;
    api.pause();
    const snapshot = api.snapshot();
    if (!snapshot.companion) {
      status("Add a companion star to explore orbital futures.");
      return;
    }
    const outcome = $("#outcome").value.trim(),
      deadlineYears = Number($("#return-deadline").value);
    if (
      !outcome ||
      outcome.length > 800 ||
      !Number.isFinite(deadlineYears) ||
      deadlineYears < 1 ||
      deadlineYears > 30
    ) {
      status("Describe an outcome and choose a deadline from 1 to 30 years.");
      return;
    }
    const request = {
      requestId: crypto.randomUUID(),
      revision: ++revision,
      outcome,
      deadlineYears,
      snapshot,
      priorProbes: records
        .filter(
          (r) =>
            r.request.snapshot.mass === snapshot.mass &&
            r.request.snapshot.modelVersion === snapshot.modelVersion,
        )
        .flatMap((r) =>
          r.probes.map((p) => ({
            speedFactor: p.speedFactor,
            deadlineYears: p.deadlineYears,
            status: p.status,
            maxSeparation: p.maxSeparation,
            minSeparation: p.minSeparation,
            returnYears: p.returnEvent?.years ?? null,
          })),
        )
        .slice(-20),
    };
    const identity = JSON.stringify(snapshot);
    activeRequest = request.requestId;
    busy = true;
    $("#explore-btn").disabled = true;
    status("Astra is proposing experiments…");
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 105000);
    try {
      const response = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(
          result.message || "Astra unavailable. Retry the local connection.",
        );
      const stale = () =>
        result.requestId !== activeRequest ||
        result.revision !== revision ||
        JSON.stringify(api.snapshot()) !== identity;
      if (stale()) {
        status(
          "Scene or request changed. The stale proposal was discarded; explore again.",
        );
        return;
      }
      const proposal = result.proposal;
      if (
        !proposal ||
        !Array.isArray(proposal.speedFactors) ||
        proposal.speedFactors.length > 5
      )
        throw Error("Astra returned an unsupported proposal.");
      const record = { request, response: result, probes: [], selected: null };
      records.push(record);
      for (const speed of proposal.speedFactors) {
        status(
          `Testing Astra’s proposal ${record.probes.length + 1} of ${proposal.speedFactors.length}…`,
        );
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (stale()) {
          record.cancelled = true;
          status(
            "Scene changed while testing. Completed probes retained; explore again.",
          );
          renderRecord(record);
          return;
        }
        record.probes.push(
          probeReturn(snapshot, speed, proposal.deadlineYears),
        );
      }
      $("#return-deadline").value = proposal.deadlineYears;
      renderRecord(record);
      const feasible = record.probes
        .filter((p) => p.status === "returned")
        .sort((a, b) => b.maxSeparation - a.maxSeparation);
      const best = feasible[0];
      if (best) select(record, best);
      else if (record.probes[0]) select(record, record.probes[0]);
      const period = new Experiment(snapshot.mass, true).period;
      status(
        proposal.deadlineYears < period
          ? `No feasible outward excursion in this family: even the circular reference takes ${period.toFixed(2)} years. Masses and closest approach stay fixed.`
          : best
            ? `Widest verified candidate tested: ${best.maxSeparation.toFixed(3)} AU; return at ${best.returnEvent.years.toFixed(3)} years.`
            : "No proposed candidate has a verified return before this deadline. Refine the request or try another set of probes.",
      );
      $("#export-probes").disabled = false;
    } catch (e) {
      status(
        e.name === "AbortError"
          ? "Astra unavailable · connection timed out. No substitute proposal was used."
          : `Astra unavailable · ${e.message || "Connection failed"}. No substitute proposal was used.`,
      );
    } finally {
      clearTimeout(timeout);
      busy = false;
      $("#explore-btn").disabled = false;
    }
  };
  function select(record, probe) {
    record.selected = probe.speedFactor;
    const baseline = probeReturn(
      record.request.snapshot,
      1,
      probe.deadlineYears,
    );
    api.preview({
      modelVersion: probe.start.modelVersion,
      horizon: probe.deadlineYears,
      baseline,
      alternative: probe,
    });
    $("#play-probe").disabled = false;
    $("#play-probe").onclick = () => {
      invalidate();
      api.play();
    };
    $("#undo-probe").disabled = false;
    $("#undo-probe").onclick = () => {
      invalidate();
      api.revert();
      $("#path-legend").textContent = "Original experiment restored.";
      document
        .querySelectorAll(".probe-choice")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      $("#play-probe").disabled = true;
      $("#undo-probe").disabled = true;
    };
    $("#path-legend").textContent =
      `Cyan: circular reference · Gold: ${probe.speedFactor.toFixed(4)} × circular`;
    document
      .querySelectorAll(".probe-choice")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(
            b.dataset.record === String(records.indexOf(record)) &&
              b.dataset.speed === String(probe.speedFactor),
          ),
        ),
      );
  }
  function renderRecord(record) {
    const entry = document.createElement("details");
    entry.className = "probe-record";
    entry.open = true;
    const summary = document.createElement("summary");
    summary.textContent = `${record.response.proposal.deadlineYears} year deadline · ${record.probes.length} probes`;
    const rationale = document.createElement("p");
    rationale.className = "micro";
    rationale.textContent = `Live Astra (${record.response.elapsedSeconds}s): ${record.response.proposal.summary}`;
    entry.append(summary, rationale);
    for (const p of record.probes) {
      const b = document.createElement("button");
      b.className = "probe-choice";
      b.dataset.record = records.indexOf(record);
      b.dataset.speed = p.speedFactor;
      b.setAttribute("aria-pressed", "false");
      const label =
        p.status === "returned"
          ? `Return ${p.returnEvent.years.toFixed(3)} yr`
          : p.status === "unresolved"
            ? "Unresolved"
            : "No return observed";
      b.textContent = `${p.speedFactor.toFixed(4)} × · ${p.maxSeparation.toFixed(3)} AU widest · ${label}`;
      b.onclick = () => {
        invalidate();
        select(record, p);
      };
      const facts = document.createElement("p");
      facts.className = "micro";
      facts.textContent = `${p.analyticBound ? "Analytically bound" : "Analytically unbound"} · closest ${p.minSeparation.toFixed(3)} AU · ${p.elements.period === null ? "no predicted period" : `predicted period ${p.elements.period.toFixed(3)} yr`} · simulated through ${(p.end.tick * p.end.h).toFixed(3)} yr.${p.reason ? " " + p.reason : ""}`;
      entry.append(b, facts);
    }
    $("#probe-history").prepend(entry);
  }
  $("#export-probes").onclick = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 1, createdAt: new Date().toISOString(), records },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stellar-live-probes.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return { invalidate, getRecords: () => structuredClone(records) };
}
