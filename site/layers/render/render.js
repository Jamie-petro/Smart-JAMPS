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
    const items = (p.components || []).map((c) => (c.label.length > 22 ? c.label.slice(0, 21) + "…" : c.label)).slice(0, 3);
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
        .map((r) => r.images.map((im) => `<figure><img src="${E(im.src)}" alt="${E(im.alt)}"><figcaption class="meta">AI-generated concept, not a design or approval · ${E(r.model)}${r.is_demo ? " · demo" : ""} · ${E(r.generated_at.slice(11, 16))}</figcaption></figure>`).join(""))
        .join("")}</div>`;
    panel.querySelector("#rd-go").onclick = generate;
  }

  // Keyless fallback when /api/render is unavailable (static host, local, no keys). Resolves null on failure/timeout.
  function keylessOnce(prompt, size) {
    const [w, h] = size.split("x").map((n) => Math.round(+n / 2));
    const short = prompt.replace(/\s+/g, " ").slice(0, 700);
    const src = `https://image.pollinations.ai/prompt/${encodeURIComponent(short)}?width=${w}&height=${h}&nologo=true&seed=${Date.now() % 100000}`;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 45000);
    // fetch (not <img>) so a rate-limited answer (403 / "Payment-Required" card) counts as a failure.
    return fetch(src, { signal: ctl.signal })
      .then((r) => (r.ok && /^image\//.test(r.headers.get("content-type") || "") && !r.headers.get("payment-required") ? r.blob() : null))
      .then((b) => b && new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b); }))
      .catch(() => null)
      .finally(() => clearTimeout(t));
  }
  const keylessImage = keylessOnce;

  async function generate() {
    const space = App.state.space, p = App.state.proposal;
    const prompt = panel.querySelector("#rd-prompt").value;
    const size = panel.querySelector("#rd-size").value;
    const btn = panel.querySelector("#rd-go");
    btn.disabled = true;
    btn.textContent = "Generating…";
    let images = null, model = "demo", note = "";
    try {
      App.status("Generating image…");
      const res = await App.api("render", { prompt, size });
      if (res?.images?.length) {
        images = res.images;
        model = res.model || "?";
      } else {
        App.status("Backend unavailable — trying keyless image service…");
        const src = await keylessImage(prompt, size);
        if (src) {
          images = [{ src, alt: `AI concept render of ${p.title}` }];
          model = "pollinations (keyless fallback)";
          note = "Image backend not available here — generated with a keyless public service.";
        }
      }
    } catch (e) {
      console.error("render failed", e);
    } finally {
      App.status("");
    }
    if (!images) note = "No image service reachable — showing a labelled placeholder.";
    const render = {
      id: "rd-" + Date.now(),
      proposal_id: p.id,
      prompt,
      images: images || [{ src: demoImage(space, p), alt: "Demo placeholder" }],
      model,
      generated_at: new Date().toISOString(),
      is_demo: !images,
    };
    gallery.unshift(render);
    App.emit("render:ready", render);
    renderPanel(note);
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
