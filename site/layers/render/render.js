// Layer 3 — AI concept visualisation of the proposed event. Owner: P4.
// Listens "proposal:ready" → builds prompt → POST /api/render → emits "render:ready" (see CONTRACTS.md).
(function () {
  let panel, gallery = [];

  function buildPrompt(space, p) {
    const curate = (p.guidelines || [])
      .filter((g) => ["curation", "site_care", "accessibility", "community"].includes(g.category))
      .map((g) => g.text.replace(/^SAMPLE:\s*/, ""))
      .slice(0, 4);
    return [
      `Photorealistic eye-level concept visualisation of a community arts event in Singapore.`,
      `Site: ${space.name} — a ${space.kind.replace("_", " ")}${space.outdoor ? ", outdoors" : ", sheltered"}, about ${space.area_m2 || "?"} m².`,
      `Scene: ${p.visual_brief}`,
      curate.length ? `Design intent: ${curate.join(" ")}` : "",
      `Realistic scale and lighting, tropical evening, residents of mixed ages including seniors and children, Singapore public-housing / urban context.`,
      `No text, no logos, no real brands, no identifiable real people.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function demoImage(space, p) {
    // Placeholder shown when no backend/key is available. Clearly labelled.
    const E = App.esc;
    const items = (p.components || []).map((c) => c.label).slice(0, 3);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="640" viewBox="0 0 1024 640">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
      <rect width="1024" height="640" fill="url(#g)"/>
      <rect x="0" y="470" width="1024" height="170" fill="#111827"/>
      ${items.map((t, i) => `<circle cx="${220 + i * 290}" cy="400" r="70" fill="#fbbf24" opacity="${0.9 - i * 0.2}"/><text x="${220 + i * 290}" y="520" fill="#f9fafb" font-size="22" text-anchor="middle" font-family="sans-serif">${E(t)}</text>`).join("")}
      <text x="40" y="70" fill="#f9fafb" font-size="30" font-family="sans-serif">${E(space.name)}</text>
      <text x="40" y="610" fill="#fbbf24" font-size="20" font-family="sans-serif">DEMO PLACEHOLDER — image backend not connected</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function renderPanel(note) {
    const E = App.esc;
    const space = App.state.space, p = App.state.proposal;
    if (!space || !p) {
      panel.innerHTML = `<p class="muted">Finish a proposal in Layer 2 first.</p>`;
      return;
    }
    panel.innerHTML = `
      <h2>Visualise: ${E(p.title)}</h2>
      <p class="meta">AI-generated concept, not a design or approval.</p>
      <h3>Prompt (editable)</h3>
      <textarea id="rd-prompt" rows="9">${E(buildPrompt(space, p))}</textarea>
      <p><label class="meta">Size <select id="rd-size"><option>1536x1024</option><option>1024x1024</option><option>1024x1536</option></select></label>
         <button class="primary" id="rd-go">Generate image</button></p>
      ${note ? `<p class="meta">${E(note)}</p>` : ""}
      <div class="rd-gallery">${gallery
        .map((r) => r.images.map((im) => `<figure><img src="${im.src}" alt="${E(im.alt)}"><figcaption class="meta">${E(r.model)}${r.is_demo ? " · demo" : ""} · ${E(r.generated_at.slice(11, 16))}</figcaption></figure>`).join(""))
        .join("")}</div>`;
    panel.querySelector("#rd-go").onclick = generate;
  }

  async function generate() {
    const space = App.state.space, p = App.state.proposal;
    const prompt = panel.querySelector("#rd-prompt").value;
    const size = panel.querySelector("#rd-size").value;
    const btn = panel.querySelector("#rd-go");
    btn.disabled = true;
    btn.textContent = "Generating…";
    App.status("Generating image…");
    const res = await App.api("render", { prompt, size });
    const render = {
      id: "rd-" + Date.now(),
      proposal_id: p.id,
      prompt,
      images: res?.images?.length ? res.images : [{ src: demoImage(space, p), alt: "Demo placeholder" }],
      model: res?.model || "demo",
      generated_at: new Date().toISOString(),
      is_demo: !res,
    };
    gallery.unshift(render);
    App.status("");
    App.emit("render:ready", render);
    renderPanel(render.is_demo ? "Backend not available here — showing a labelled placeholder." : "");
  }

  App.registerLayer({
    id: "render",
    title: "Render",
    mount(el) {
      panel = el;
      renderPanel();
      App.on("proposal:ready", () => renderPanel());
      App.on("space:selected", () => ((gallery = []), renderPanel()));
    },
  });
})();
