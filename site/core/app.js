// Shell: event bus, shared state, layer registry, tabs. Owner: P5. See CONTRACTS.md.
window.App = (function () {
  const layers = [];
  const listeners = {};
  const state = { space: null, proposal: null, render: null };
  const STATE_KEY = { "space:selected": "space", "proposal:ready": "proposal", "render:ready": "render" };

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
  }
  function emit(event, payload) {
    const key = STATE_KEY[event];
    if (key) state[key] = payload;
    if (event === "space:selected") {
      state.proposal = null;
      state.render = null;
    }
    if (event === "proposal:ready") state.render = null;
    (listeners[event] || []).forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error(`[${event}] listener failed`, e);
      }
    });
    renderTabs();
  }

  function registerLayer(layer) {
    layers.push(layer);
  }

  function goTo(id) {
    document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.dataset.layer !== id));
    document.querySelectorAll("#tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layer === id)));
    current = id;
  }
  let current = "map";

  function renderTabs() {
    const ready = { map: true, proposal: !!state.space, render: !!state.proposal };
    document.querySelectorAll("#tabs button").forEach((b) => (b.disabled = !ready[b.dataset.layer]));
  }

  async function demo(name) {
    for (const dir of ["map", "proposal", "render"]) {
      try {
        const r = await fetch(`layers/${dir}/data/${name}`, { cache: "no-store" });
        if (r.ok) return await r.json();
      } catch {}
    }
    return null;
  }

  async function api(path, body) {
    try {
      const r = await fetch(`/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
      if (!r.ok) {
        console.warn(`/api/${path} →`, r.status, await r.text().catch(() => ""));
        return null;
      }
      return await r.json();
    } catch (e) {
      console.warn(`/api/${path} unavailable`, e);
      return null;
    }
  }

  function status(text) {
    document.getElementById("status").textContent = text || "";
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function badge(s) {
    return `<span class="badge ${esc(String(s).replace(/\s+/g, "-"))}">${esc(s)}</span>`;
  }

  function start() {
    const tabs = document.getElementById("tabs");
    const panels = document.getElementById("panels");
    layers.forEach((layer, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.layer = layer.id;
      b.textContent = `${i + 1} · ${layer.title}`;
      b.onclick = () => goTo(layer.id);
      tabs.appendChild(b);
      const p = document.createElement("section");
      p.className = "panel";
      p.dataset.layer = layer.id;
      panels.appendChild(p);
      try {
        layer.mount(p, App);
      } catch (e) {
        p.innerHTML = `<p class="err">Layer “${esc(layer.title)}” failed to load. See console.</p>`;
        console.error(e);
      }
    });
    renderTabs();
    goTo("map");
  }

  return { registerLayer, on, emit, goTo, demo, api, status, start, state, esc, badge, get current() { return current; } };
})();
