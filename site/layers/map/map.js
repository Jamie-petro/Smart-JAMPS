// Layer 1 — Map of Singapore + candidate spaces. Owner: P1. Emits "space:selected" (Space, see CONTRACTS.md).
// MapLibre GL: 3D mode = OpenFreeMap vector tiles with extruded buildings; 2D mode = OneMap raster basemap.
(function () {
  const SG_CENTER = [103.8198, 1.3521]; // [lon, lat]
  const SG_BOUNDS = [[103.5, 1.13], [104.15, 1.5]];
  const KIND_COLOR = {
    void_deck: "#7c3aed", plaza: "#db2777", park: "#16a34a", vacant_land: "#b45309",
    streetscape: "#2563eb", heritage_building: "#9333ea", community_space: "#0891b2", other: "#6b7280",
  };
  const STYLE_3D = "https://tiles.openfreemap.org/styles/liberty";
  // OneMap basemap (SLA). Attribution is required by OneMap's terms.
  const STYLE_2D = {
    version: 8,
    sources: {
      onemap: {
        type: "raster",
        tiles: ["https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"],
        tileSize: 256, minzoom: 11, maxzoom: 19,
        attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener">OneMap</a> &copy; contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener">Singapore Land Authority</a>',
      },
    },
    layers: [{ id: "onemap", type: "raster", source: "onemap" }],
  };
  const VIEW = { "3d": { pitch: 60, bearing: -20 }, "2d": { pitch: 0, bearing: 0 } };

  let map, markers = {}, spaces = [], selectedId = null, panel, mode = "3d", popup = null, toggleBtn;

  function setMode(m) {
    if (!map) return;
    mode = m;
    map.setStyle(m === "3d" ? STYLE_3D : STYLE_2D);
    map.easeTo({ ...VIEW[m], duration: 800 });
    if (toggleBtn) toggleBtn.textContent = m === "3d" ? "Switch to 2D" : "Switch to 3D";
  }

  function initMap() {
    if (!window.maplibregl) throw new Error("MapLibre not loaded");
    map = new maplibregl.Map({
      container: "map", style: STYLE_3D, center: SG_CENTER, zoom: 11.3, ...VIEW["3d"],
      minZoom: 10, maxZoom: 19, maxPitch: 75, maxBounds: SG_BOUNDS,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-left");
    map.addControl({
      onAdd() {
        const div = document.createElement("div");
        div.className = "maplibregl-ctrl map-mode";
        toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.textContent = "Switch to 2D";
        toggleBtn.onclick = () => setMode(mode === "3d" ? "2d" : "3d");
        div.appendChild(toggleBtn);
        return div;
      },
      onRemove() {},
    }, "top-right");
    // If the 3D vector tiles are unreachable, fall back to the OneMap 2D basemap once.
    let fellBack = false;
    map.on("error", (e) => {
      console.warn("map error", e?.error || e);
      if (mode === "3d" && !fellBack && !map.isStyleLoaded()) {
        fellBack = true;
        setMode("2d");
        App.status("3D tiles unavailable — showing 2D OneMap");
      }
    });
  }

  function addSpaces(geojson) {
    spaces = (geojson?.features || []).map((f) => ({ ...f.properties, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }));
    if (!map) return;
    spaces.forEach((s) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "space-marker";
      el.style.background = KIND_COLOR[s.kind] || KIND_COLOR.other;
      el.title = `${s.name} · ${s.kind}`;
      el.setAttribute("aria-label", s.name);
      el.onclick = (e) => (e.stopPropagation(), select(s.id));
      markers[s.id] = new maplibregl.Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(map);
    });
  }

  function select(id) {
    selectedId = id;
    Object.entries(markers).forEach(([k, m]) => m.getElement().classList.toggle("sel", k === id));
    const s = spaces.find((x) => x.id === id);
    if (s && map) map.flyTo({ center: [s.lon, s.lat], zoom: 16.5, ...VIEW[mode], duration: 1500 });
    App.goTo("map");
    renderPanel();
  }

  // Show the latest concept render as a popup at the chosen space.
  function showRender(r) {
    const s = App.state.space, im = r?.images?.[0];
    if (!map || !s || !im) return;
    const E = App.esc;
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ maxWidth: "380px", offset: 14 })
      .setLngLat([s.lon, s.lat])
      .setHTML(`<figure class="map-render"><img src="${E(im.src)}" alt="${E(im.alt)}"><figcaption>AI-generated concept, not a design or approval${r.is_demo ? " · placeholder" : ""}</figcaption></figure>`)
      .addTo(map);
    map.flyTo({ center: [s.lon, s.lat], zoom: Math.max(map.getZoom(), 16), ...VIEW[mode], offset: [0, 150], duration: 1200 });
  }

  async function search(q) {
    // OneMap search API (no token needed for search). Returns place results to pan to.
    try {
      const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(q)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const r = await fetch(url);
      const j = await r.json();
      return (j.results || []).slice(0, 5).map((x) => ({ name: x.SEARCHVAL, lat: +x.LATITUDE, lon: +x.LONGITUDE }));
    } catch (e) {
      console.warn("OneMap search failed", e);
      return [];
    }
  }

  function renderPanel() {
    const E = App.esc;
    const s = spaces.find((x) => x.id === selectedId);
    panel.innerHTML = `
      <h2>Pick a space</h2>
      <form id="map-search" class="map-search"><input name="q" placeholder="Search a place (OneMap)" aria-label="Search"><button>Go</button></form>
      <div id="map-search-results" class="meta"></div>
      ${
        s
          ? `<div class="space-detail">
          <h3>${E(s.name)}</h3>
          <p><span class="chip">${E(s.kind)}</span><span class="chip">${E(s.land_owner)}</span>${s.outdoor ? '<span class="chip">outdoor</span>' : ""}${
              s.area_m2 ? `<span class="chip">~${s.area_m2} m²</span>` : ""
            }${s.capacity_est ? `<span class="chip">~${s.capacity_est} people</span>` : ""} ${App.badge(s.status || "assumption")}</p>
          ${s.photo_url ? `<img class="space-photo" src="${E(s.photo_url)}" alt="${E(s.name)}">` : ""}
          <p>${E(s.notes)}</p>
          <p class="meta">Source: ${E(s.source)}</p>
          <button class="primary" id="use-space">Use this space → proposal</button>
        </div>`
          : `<p class="muted">Click a marker on the map.</p>`
      }
      <h3>Candidate spaces (${spaces.length})</h3>
      <ul class="space-list">${spaces
        .map((x) => `<li data-id="${E(x.id)}" class="${x.id === selectedId ? "sel" : ""}"><span class="dot" style="background:${KIND_COLOR[x.kind] || KIND_COLOR.other}"></span>${E(x.name)} <span class="meta">${E(x.kind)}</span></li>`)
        .join("")}</ul>`;

    panel.querySelectorAll(".space-list li").forEach((li) => (li.onclick = () => select(li.dataset.id)));
    const use = panel.querySelector("#use-space");
    if (use)
      use.onclick = () => {
        App.emit("space:selected", s);
        App.goTo("proposal");
      };
    panel.querySelector("#map-search").onsubmit = async (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim();
      if (!q) return;
      const out = panel.querySelector("#map-search-results");
      out.textContent = "Searching…";
      const res = await search(q);
      out.innerHTML = res.length ? res.map((r, i) => `<a href="#" data-i="${i}">${E(r.name)}</a>`).join(" · ") : "No results.";
      out.querySelectorAll("a").forEach(
        (a) => (a.onclick = (ev) => (ev.preventDefault(), map && map.flyTo({ center: [res[a.dataset.i].lon, res[a.dataset.i].lat], zoom: 17, ...VIEW[mode] })))
      );
    };
  }

  App.registerLayer({
    id: "map",
    title: "Spaces",
    async mount(el) {
      panel = el;
      try {
        initMap();
      } catch (e) {
        map = null;
        console.error(e);
        document.getElementById("map").innerHTML = `<p class="err" style="padding:16px">The map needs WebGL, which this browser does not provide. Use the list on the right.</p>`;
      }
      App.on("render:ready", showRender);
      App.on("space:selected", () => popup && popup.remove());
      renderPanel();
      try {
        const r = await fetch("layers/map/data/spaces.geojson", { cache: "no-store" });
        addSpaces(await r.json());
      } catch (e) {
        el.insertAdjacentHTML("afterbegin", `<p class="err">spaces.geojson not available yet.</p>`);
      }
      renderPanel();
    },
  });
})();
