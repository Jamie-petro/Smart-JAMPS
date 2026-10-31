// Layer 1 — Map of Singapore + candidate spaces. Owner: P1. Emits "space:selected" (Space, see CONTRACTS.md).
(function () {
  const SG_CENTER = [1.3521, 103.8198];
  const SG_BOUNDS = L.latLngBounds([1.144, 103.535], [1.494, 104.131]);
  const KIND_COLOR = {
    void_deck: "#7c3aed", plaza: "#db2777", park: "#16a34a", vacant_land: "#b45309",
    streetscape: "#2563eb", heritage_building: "#9333ea", community_space: "#0891b2", other: "#6b7280",
  };

  let map, markers = {}, spaces = [], selectedId = null, panel;

  function initMap() {
    map = L.map("map", { minZoom: 12, maxZoom: 19, maxBounds: SG_BOUNDS.pad(0.1) }).setView(SG_CENTER, 12);
    // OneMap basemap (SLA). Attribution is required by OneMap's terms.
    const onemap = L.tileLayer("https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png", {
      detectRetina: true, minZoom: 11, maxZoom: 19, bounds: SG_BOUNDS,
      attribution:
        '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;vertical-align:middle"/> ' +
        '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener">OneMap</a> &copy; contributors | ' +
        '<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener">Singapore Land Authority</a>',
    }).addTo(map);
    // Fallback to OSM if OneMap tiles fail repeatedly.
    let errors = 0;
    onemap.on("tileerror", () => {
      if (++errors === 8) {
        map.removeLayer(onemap);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
        App.status("OneMap tiles unavailable — showing OpenStreetMap");
      }
    });
  }

  function addSpaces(geojson) {
    spaces = (geojson?.features || []).map((f) => ({ ...f.properties, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }));
    spaces.forEach((s) => {
      const m = L.circleMarker([s.lat, s.lon], { radius: 8, color: KIND_COLOR[s.kind] || KIND_COLOR.other, weight: 2, fillOpacity: 0.55 })
        .bindTooltip(`${s.name} · ${s.kind}`)
        .on("click", () => select(s.id))
        .addTo(map);
      markers[s.id] = m;
    });
    if (spaces.length) map.fitBounds(L.latLngBounds(spaces.map((s) => [s.lat, s.lon])).pad(0.08));
  }

  function select(id) {
    selectedId = id;
    Object.entries(markers).forEach(([k, m]) => m.setStyle({ weight: k === id ? 5 : 2, fillOpacity: k === id ? 0.9 : 0.55 }));
    const s = spaces.find((x) => x.id === id);
    if (s) map.panTo([s.lat, s.lon]);
    App.goTo("map");
    renderPanel();
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
      out.querySelectorAll("a").forEach((a) => (a.onclick = (ev) => (ev.preventDefault(), map.setView([res[a.dataset.i].lat, res[a.dataset.i].lon], 17))));
    };
  }

  App.registerLayer({
    id: "map",
    title: "Spaces",
    async mount(el) {
      panel = el;
      initMap();
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
