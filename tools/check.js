#!/usr/bin/env node
// Pre-push check for everyone. Run from the repo root:  node tools/check.js
// No dependencies. Validates data files against CONTRACTS.md / SCHEMA.md, syntax-checks JS,
// and looks for leaked keys and forbidden promises. Exit code 1 = fix before pushing.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const STATUS = ["verified", "assumption", "gap"];
const KIND = ["void_deck", "plaza", "park", "vacant_land", "streetscape", "heritage_building", "community_space", "other"];
const LAND_OWNER = ["state_land", "hdb", "park", "private", "public_road", "unknown"];
const SOURCE_TYPE = ["permission", "licence", "grant", "guidance", "venue"];
const APPLICANT_TYPE = ["individual", "informal_group", "registered_society", "company", "charity", "other"];
const COMPONENT_TYPE = ["performance", "installation", "workshop", "exhibition", "community_programme", "food_stall", "other"];
const GL_CATEGORY = ["curation", "programming", "community", "accessibility", "site_care", "permissions", "funding"];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".venv", "cache"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(ROOT, p);

function readJSON(relPath) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) return err(relPath, "missing"), null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return err(relPath, `invalid JSON — ${e.message}`), null;
  }
}
function uniqueIds(file, list) {
  const seen = new Set();
  list.forEach((x, i) => {
    if (!x || !x.id) return err(file, `item ${i} has no id`);
    if (seen.has(x.id)) err(file, `duplicate id "${x.id}"`);
    seen.add(x.id);
  });
}
function oneOf(file, where, value, allowed) {
  if (!allowed.includes(value)) err(file, `${where} = ${JSON.stringify(value)} — must be one of ${allowed.join(" | ")}`);
}

// ---------- Layer 1: spaces.geojson ----------
const SPACES = "site/layers/map/data/spaces.geojson";
const gj = readJSON(SPACES);
if (gj) {
  if (gj.type !== "FeatureCollection" || !Array.isArray(gj.features)) err(SPACES, "must be a FeatureCollection");
  const props = (gj.features || []).map((f) => f.properties || {});
  uniqueIds(SPACES, props);
  (gj.features || []).forEach((f) => {
    const p = f.properties || {};
    const id = p.id || "?";
    const c = f.geometry && f.geometry.coordinates;
    if (!f.geometry || f.geometry.type !== "Point" || !Array.isArray(c)) return err(SPACES, `${id}: geometry must be a Point`);
    const [lon, lat] = c;
    if (!(lat > 1.1 && lat < 1.5 && lon > 103.5 && lon < 104.2)) err(SPACES, `${id}: [${c}] is not in Singapore — GeoJSON order is [lon, lat]`);
    if (!p.name) err(SPACES, `${id}: name missing`);
    oneOf(SPACES, `${id}.kind`, p.kind, KIND);
    oneOf(SPACES, `${id}.land_owner`, p.land_owner, LAND_OWNER);
    oneOf(SPACES, `${id}.status`, p.status, STATUS);
    if (typeof p.outdoor !== "boolean") err(SPACES, `${id}: outdoor must be true/false`);
    if (p.status === "verified" && (!p.source || /sample/i.test(p.source))) err(SPACES, `${id}: verified but no real source`);
  });
}

// ---------- Layer 2 data ----------
const D = "site/layers/proposal/data/";
const sources = readJSON(D + "sources.json") || [];
const rules = readJSON(D + "rules.json") || [];
const grants = readJSON(D + "grants.json") || [];
const guidelines = readJSON(D + "guidelines.json") || [];
const template = readJSON(D + "template.json");
const srcById = Object.fromEntries(sources.map((s) => [s.id, s]));

uniqueIds(D + "sources.json", sources);
sources.forEach((s) => {
  oneOf(D + "sources.json", `${s.id}.type`, s.type, SOURCE_TYPE);
  if (!/^https?:\/\//.test(s.url || "")) err(D + "sources.json", `${s.id}: url must start with http(s)://`);
});

// A "verified" item must point at a source that someone actually opened (checked_on set).
function checkSourced(file, where, status, sourceId) {
  oneOf(file, `${where}.status`, status, STATUS);
  if (sourceId != null && !srcById[sourceId]) err(file, `${where}: source_id "${sourceId}" not in sources.json`);
  if (status === "verified") {
    const s = srcById[sourceId];
    if (!s) err(file, `${where}: verified but has no source_id`);
    else if (!s.checked_on) err(file, `${where}: verified but source "${sourceId}" has no checked_on date`);
  }
}

uniqueIds(D + "rules.json", rules);
const ruleIds = new Set(rules.map((r) => r.id));
rules.forEach((r) => {
  const f = D + "rules.json";
  checkSourced(f, r.id, r.status, r.source_id);
  if (!r.agency || !r.requirement || !r.why) err(f, `${r.id}: agency, requirement and why are required`);
  if (r.lead_time_weeks != null && typeof r.lead_time_weeks !== "number") err(f, `${r.id}: lead_time_weeks must be a number or null`);
  (r.depends_on || []).forEach((d) => ruleIds.has(d) || err(f, `${r.id}: depends_on "${d}" is not a rule id`));
  Object.entries(r.applies_if || {}).forEach(([k, v]) => {
    if (!Array.isArray(v)) err(f, `${r.id}: applies_if["${k}"] must be a list of accepted values`);
    if (/^(component|space|applicant)\./.test(k)) err(f, `${r.id}: applies_if keys are component fields without a prefix (e.g. "location.outdoor"), got "${k}"`);
  });
});

uniqueIds(D + "grants.json", grants);
grants.forEach((g) => {
  const f = D + "grants.json";
  if (g.source_id != null && !srcById[g.source_id]) err(f, `${g.id}: source_id "${g.source_id}" not in sources.json`);
  oneOf(f, `${g.id}.overlap_status`, g.overlap_status, STATUS);
  (g.covers_types || []).forEach((t) => oneOf(f, `${g.id}.covers_types`, t, COMPONENT_TYPE));
  uniqueIds(f, g.criteria || []);
  (g.criteria || []).forEach((c) => {
    checkSourced(f, `${g.id}/${c.id}`, c.status, g.source_id);
    if (c.check && !/^(applicant|proposal|component)\./.test(c.check.field || "")) err(f, `${g.id}/${c.id}: check.field must start with applicant. / proposal. / component.`);
    if (c.check && !("in" in c.check || "min" in c.check || "max" in c.check)) err(f, `${g.id}/${c.id}: check needs "in", "min" or "max" (or set check: null)`);
  });
});

uniqueIds(D + "guidelines.json", guidelines);
guidelines.forEach((g) => {
  const f = D + "guidelines.json";
  oneOf(f, `${g.id}.category`, g.category, GL_CATEGORY);
  checkSourced(f, g.id, g.status, g.source_id);
  Object.entries(g.when || {}).forEach(([k, v]) => {
    if (!/^(space|component)\./.test(k)) err(f, `${g.id}: when keys must start with space. or component., got "${k}"`);
    if (!Array.isArray(v)) err(f, `${g.id}: when["${k}"] must be a list`);
  });
});

if (template) {
  const f = D + "template.json";
  ["id", "title", "summary", "event_start", "event_end"].forEach((k) => template[k] || err(f, `${k} missing`));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(template.event_start || "")) err(f, "event_start must be YYYY-MM-DD");
  oneOf(f, "applicant.type", (template.applicant || {}).type, APPLICANT_TYPE);
  uniqueIds(f, template.components || []);
  (template.components || []).forEach((c) => oneOf(f, `${c.id}.type`, c.type, COMPONENT_TYPE));
}

// ---------- JS syntax, banned stack ----------
const files = walk(ROOT).filter((p) => !rel(p).startsWith(".git"));
files.filter((p) => p.endsWith(".js") && rel(p).startsWith("site/")).forEach((p) => {
  try {
    execFileSync(process.execPath, ["--check", p], { stdio: "pipe" });
  } catch (e) {
    err(rel(p), "syntax error\n" + String(e.stderr).split("\n").slice(0, 5).join("\n"));
  }
});
if (fs.existsSync(path.join(ROOT, "site/package.json"))) err("site/package.json", "no npm in site/ (AGENTS.md)");
files.filter((p) => /\.(html|js)$/.test(p) && rel(p).startsWith("site/") && !rel(p).startsWith("site/api/")).forEach((p) => {
  const t = fs.readFileSync(p, "utf8");
  if (/\bfrom\s+["']react|\bimport\s+React|api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis/.test(t))
    err(rel(p), "browser code must not import frameworks or call keyed APIs — use App.api(...)");
});

// ---------- Keys and honesty ----------
const KEY_RE = /(sk-ant-[A-Za-z0-9_-]{20,}|sk-(proj-)?[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,})/;
const PROMISE_RE = /\b(you (will|would) be approved|you qualify|you are eligible|guaranteed (approval|funding))\b/i;
files.filter((p) => /\.(js|json|geojson|html|md|txt|css)$/.test(p) || path.basename(p) === ".env").forEach((p) => {
  const r = rel(p);
  if (path.basename(p) === ".env") return err(r, ".env must not be in the repo folder you commit — check .gitignore");
  const t = fs.readFileSync(p, "utf8");
  if (KEY_RE.test(t)) err(r, "looks like an API key — remove it and rotate the key");
  if (r.startsWith("site/") && PROMISE_RE.test(t)) err(r, `promise wording "${t.match(PROMISE_RE)[0]}" — use "appears to meet" / "check with <agency>"`);
});

// ---------- SAMPLE leftovers (warning only) ----------
const sampleCount = files
  .filter((p) => rel(p).startsWith("site/layers/") && /\.(json|geojson)$/.test(p))
  .map((p) => [rel(p), (fs.readFileSync(p, "utf8").match(/SAMPLE/g) || []).length])
  .filter(([, n]) => n);
sampleCount.forEach(([f, n]) => warn(f, `${n} SAMPLE placeholder(s) left`));

warnings.forEach((w) => console.log("warn  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(errors.length ? `\n${errors.length} error(s). Fix before pushing.` : `\nOK — ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
