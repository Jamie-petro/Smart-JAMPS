// Layer 2 — Proposal, curation guidelines, workplan, funding. Owner: P3 (data files: P2).
// Listens "space:selected" → builds Proposal → emits "proposal:ready" (see CONTRACTS.md).
(function () {
  const DATA = "layers/proposal/data/";
  const D = { template: null, rules: [], grants: [], sources: [], guidelines: [] };
  let panel, base = null, enabled = {}, useLLM = false, whatIf = { ticketed: false };
  const KIND_SCENE = {
    void_deck: "under a sheltered HDB void deck with pillars and lift lobby behind",
    plaza: "on an open paved plaza",
    park: "on a park lawn under rain trees",
    vacant_land: "on an open grassy plot",
    streetscape: "along a shophouse street with five-foot ways",
    heritage_building: "in front of a heritage building",
    community_space: "in a sheltered community plaza",
    other: "on site",
  };

  async function load(name, fallback) {
    try {
      const r = await fetch(DATA + name, { cache: "no-store" });
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
      return fallback;
    }
  }
  const get = (o, p) => p.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);

  // guidelines.json "when": keys "space.<field>" or "component.<field>" → accepted values. All keys must match.
  function guidelinesFor(space, proposal) {
    return D.guidelines.filter((g) =>
      Object.entries(g.when || {}).every(([path, ok]) => {
        const [scope, ...rest] = path.split(".");
        const f = rest.join(".");
        if (scope === "space") return ok.includes(get(space, f));
        if (scope === "component") return proposal.components.some((c) => ok.includes(get(c, f)));
        return false;
      })
    );
  }

  function draftFromTemplate(space) {
    const t = JSON.parse(JSON.stringify(D.template));
    t.space_id = space.id;
    t.title = (t.title || "Arts event").replace("{space}", space.name);
    t.summary = (t.summary || "").replace("{space}", space.name);
    t.components.forEach((c) => {
      c.location = { name: space.name, land_owner: space.land_owner, outdoor: space.outdoor };
      if (space.capacity_est && c.audience_size) c.audience_size = Math.min(c.audience_size, space.capacity_est);
    });
    t.generated_by = "template";
    return t;
  }

  async function build(space) {
    let p = draftFromTemplate(space);
    p.components = p.components.filter((c) => enabled[c.id] !== false);
    if (whatIf.ticketed) p = Engine.applyOverrides(p, Object.fromEntries(p.components.map((c) => [c.id, { ticketed: true }])));
    p.guidelines = guidelinesFor(space, p);
    p.visual_brief =
      p.visual_brief ||
      `A${whatIf.ticketed ? " ticketed" : " free"} evening community arts event at ${space.name}, ${KIND_SCENE[space.kind] || KIND_SCENE.other}. ` +
        `${p.components.map((c) => c.label.toLowerCase()).join("; ")}. ` +
        `Warm lantern light at dusk, residents of mixed ages — seniors on benches, children holding handmade lanterns, families walking through.`;

    if (useLLM) {
      App.status("Drafting with AI…");
      const ai = await App.api("proposal", { space, draft: p });
      if (ai) {
        p.title = ai.title || p.title;
        p.summary = ai.summary || p.summary;
        p.visual_brief = ai.visual_brief || p.visual_brief;
        (ai.guidelines || []).forEach((g, i) => p.guidelines.push({ id: `ai-${i}`, status: "assumption", source_id: null, ...g, category: g.category || "curation" }));
        p.generated_by = `llm:${ai.model || "?"}`;
        App.status("");
      } else App.status("AI drafting unavailable — using template");
    }

    p.workplan = Engine.workplan(p, D.rules, D.sources);
    p.shortlist = Engine.shortlist(p, D.grants, D.sources);
    p.gaps = Engine.gaps(p.workplan, p.shortlist);
    return p;
  }

  function render(space, p) {
    const E = App.esc, B = App.badge;
    const src = (s) => (s ? `<a href="${E(s.url)}" target="_blank" rel="noopener">${E(s.agency)}</a>` : "no source");
    const srcById = (id) => D.sources.find((s) => s.id === id);
    const byCat = {};
    p.guidelines.forEach((g) => (byCat[g.category] = byCat[g.category] || []).push(g));

    panel.innerHTML = `
      <h2>${E(p.title)}</h2>
      <p class="meta">${E(space.name)} · ${E(p.event_start)} → ${E(p.event_end)} · drafted by ${E(p.generated_by)}</p>
      <p>${E(p.summary)}</p>
      <label class="meta"><input type="checkbox" id="pp-llm" ${useLLM ? "checked" : ""}> Draft text with AI (needs backend)</label>

      <h3>Activities</h3>
      <div class="pp-comps">${D.template.components
        .map((c) => `<label><input type="checkbox" data-c="${E(c.id)}" ${enabled[c.id] !== false ? "checked" : ""}> ${E(c.label)} <span class="chip">${E(c.type)}</span></label>`)
        .join("")}</div>
      <h3>What if…</h3>
      <label class="meta"><input type="checkbox" id="pp-ticketed" ${whatIf.ticketed ? "checked" : ""}> Charge for tickets (watch the steps and funding change)</label>
      ${p.assumptions?.length ? `<details class="meta"><summary>Assumptions in this draft (${p.assumptions.length})</summary><ul>${p.assumptions.map((a) => `<li>${E(a)}</li>`).join("")}</ul></details>` : ""}

      <h3>How to enhance & curate this event</h3>
      ${
        Object.keys(byCat).length
          ? Object.entries(byCat)
              .map(
                ([cat, gs]) =>
                  `<div class="pp-cat"><b>${E(cat.replace("_", " "))}</b><ul>${gs
                    .map((g) => `<li>${E(g.text)} ${B(g.status)}<div class="meta">${E(g.why || "")}${g.source_id ? ` · ${src(srcById(g.source_id))}` : ""}</div></li>`)
                    .join("")}</ul></div>`
              )
              .join("")
          : `<p class="muted">No guidelines match yet.</p>`
      }

      <h3>Whom to approach, in order</h3>
      <ol class="pp-steps">${
        p.workplan
          .map(
            (s) => `<li><b>${E(s.agency)}</b> — ${E(s.requirement)} ${B(s.status)}
          <div class="meta">Start by ${E(s.start_by || "unknown — check")} · ${E(s.why)} · ${src(s.source)}</div>
          <div class="meta">For: ${s.matched_components.map((c) => `<span class="chip">${E(c.label)}</span>`).join("")}${s.note ? ` · ${E(s.note)}` : ""}</div></li>`
          )
          .join("") || '<li class="muted">No requirements matched.</li>'
      }</ol>

      <h3>Funding shortlist</h3>
      <p class="meta">"Appears to meet" is not eligibility — check with the agency.</p>
      ${
        p.shortlist
          .map(
            (g) => `<div class="pp-grant"><b>${E(g.name)}</b> ${src(g.source)} <span class="meta">${g.max_amount_sgd ? `· up to $${g.max_amount_sgd.toLocaleString()}` : ""}</span>
          <div class="meta">appears to meet ${g.counts.met} · not met ${g.counts.not_met} · check ${g.counts.unknown}</div>
          <div class="meta">Could fund: ${g.linked_components.map((c) => `<span class="chip">${E(c.label)}</span>`).join("")}</div>
          <ul class="pp-crit">${g.criteria.map((c) => `<li>${B(c.result.replace("_", " "))} ${E(c.text)} ${B(c.status)}</li>`).join("")}</ul>
          ${g.improvements.map((i) => `<div class="pp-improve">Improvement: ${E(i.improvement)}</div>`).join("")}
          ${g.overlap_warnings.map((w) => `<div class="pp-warn">Possible overlap with ${E(w.with)} — ${E(w.rule || "")} ${B(w.status)}</div>`).join("")}</div>`
          )
          .join("") || '<p class="muted">No grants cover these activities.</p>'
      }

      <h3>Still to check (${p.gaps.length})</h3>
      <ul class="meta">${p.gaps.slice(0, 8).map((g) => `<li>${E(g.label)} — ${B(g.status)}</li>`).join("")}</ul>

      <h3>Visual brief (sent to Layer 3)</h3>
      <textarea id="pp-brief" rows="4">${E(p.visual_brief)}</textarea>
      <p><button class="primary" id="pp-go">Visualize this event →</button></p>`;

    panel.querySelector("#pp-llm").onchange = (e) => ((useLLM = e.target.checked), refresh());
    panel.querySelector("#pp-ticketed").onchange = (e) => ((whatIf.ticketed = e.target.checked), refresh());
    panel.querySelectorAll("[data-c]").forEach((cb) => (cb.onchange = () => ((enabled[cb.dataset.c] = cb.checked), refresh())));
    panel.querySelector("#pp-go").onclick = () => {
      const final = { ...p, visual_brief: panel.querySelector("#pp-brief").value };
      App.emit("proposal:ready", final);
      App.goTo("render");
    };
  }

  async function refresh() {
    const space = App.state.space;
    if (!space || !D.template) return;
    const p = await build(space);
    render(space, p);
    App.emit("proposal:ready", p); // unlock Layer 3 straight away
  }

  App.registerLayer({
    id: "proposal",
    title: "Proposal",
    async mount(el) {
      panel = el;
      panel.innerHTML = `<p class="muted">Pick a space on the map first.</p>`;
      [D.template, D.rules, D.grants, D.sources, D.guidelines] = await Promise.all([
        load("template.json", null), load("rules.json", []), load("grants.json", []), load("sources.json", []), load("guidelines.json", []),
      ]);
      if (!D.template) panel.innerHTML = `<p class="err">template.json missing.</p>`;
      App.on("space:selected", () => {
        enabled = {};
        whatIf = { ticketed: false };
        refresh();
      });
    },
  });
})();
