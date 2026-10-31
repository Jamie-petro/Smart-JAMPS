#!/usr/bin/env node
// Compliance review of a teammate's branch (P5). Run from the repo root:
//   git fetch origin && node tools/review.js origin/p1/spaces        (owner from branch name)
//   node tools/review.js origin/some-branch P3                        (owner given explicitly)
//   node tools/review.js --all                                        (every remote branch not merged into main)
// Checks: (1) every changed file is in the owner's folders (AGENTS.md), (2) tools/check.js passes on the
// branch's files, (3) branch is up to date with main. Exit code 1 = not ready to merge.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 }).trim();

// Mirror of the ownership table in AGENTS.md — keep in sync.
const OWNS = {
  P1: [/^site\/index\.html$/, /^site\/src\/(App|main)\.tsx$/, /^site\/src\/index\.css$/, /^site\/src\/layers\/space\.ts$/, /^site\/public\/layers\/map\//, /^pipeline\/spaces\//],
  P2: [/^site\/public\/layers\/proposal\/data\/(sources|rules|grants|guidelines)\.json$/, /^pipeline\/sources\//],
  P3: [/^site\/src\/layers\/proposal\//, /^site\/public\/layers\/proposal\/engine\.js$/, /^site\/public\/layers\/proposal\/data\/template\.json$/, /^site\/api\/proposal\.js$/, /^pipeline\/case\//],
  P4: [/^site\/src\/layers\/render\//, /^site\/src\/navigator\//, /^site\/public\/navigator\//, /^site\/api\/(render|analyze-proposal)\.js$/, /^pipeline\/render\//],
  P5: [/^site\/src\/layers\/(bus\.ts|ui\.tsx|LayerDock\.tsx)$/, /^site\/(package(-lock)?\.json|vite\.config\.ts|tsconfig\.json|vercel\.json|metadata\.json)$/, /^docs\//, /^tools\//, /^\.github\//, /^[^/]+\.md$/, /^\.gitignore$/, /^\.env\.example$/],
};
const ownerOf = (file) => Object.keys(OWNS).filter((p) => OWNS[p].some((re) => re.test(file)));

function review(ref, ownerArg) {
  const owner = (ownerArg || (ref.match(/(?:^|\/)p([1-5])\//i) || [])[1] && "P" + ref.match(/(?:^|\/)p([1-5])\//i)[1] || "").toUpperCase();
  const problems = [];
  const notes = [];
  console.log(`\n=== ${ref}  (${owner || "owner unknown — pass P1..P5"})`);

  const base = git("merge-base", "origin/main", ref);
  const changed = git("diff", "--name-status", `${base}..${ref}`).split("\n").filter(Boolean).map((l) => {
    const [st, ...ps] = l.split("\t");
    return { st, file: ps[ps.length - 1] };
  });
  const commits = git("log", "--format=%h %an: %s", `${base}..${ref}`).split("\n").filter(Boolean);
  notes.push(`${commits.length} commit(s), ${changed.length} file(s) changed`);
  commits.slice(0, 8).forEach((c) => notes.push("  " + c));

  // 1. Ownership
  if (!owner) problems.push("cannot tell whose branch this is — name it p<N>/<topic> or pass the owner");
  changed.forEach(({ st, file }) => {
    if (/(^|\/)\.env$/.test(file)) return problems.push(`${file}: .env committed — remove it and rotate the keys`);
    if (!owner) return;
    const owners = ownerOf(file);
    if (!owners.includes(owner)) problems.push(`${st} ${file} — outside ${owner}'s folders (owned by ${owners.join("/") || "nobody — ask P5"})`);
  });

  // 2. tools/check.js (main's version) against the branch's files
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "review-"));
  try {
    execFileSync("sh", ["-c", `git archive "${ref}" | tar -x -C "${tmp}"`], { cwd: ROOT });
    fs.mkdirSync(path.join(tmp, "tools"), { recursive: true });
    fs.copyFileSync(path.join(ROOT, "tools/check.js"), path.join(tmp, "tools/check.js"));
    let out, ok = true;
    try {
      out = execFileSync(process.execPath, [path.join(tmp, "tools/check.js")], { encoding: "utf8" });
    } catch (e) {
      out = e.stdout || String(e);
      ok = false;
    }
    out.split("\n").filter((l) => l.startsWith("ERROR")).forEach((l) => problems.push("check: " + l.slice(6)));
    const samples = out.split("\n").filter((l) => /SAMPLE/.test(l));
    if (samples.length) notes.push(`SAMPLE placeholders left in ${samples.length} file(s)`);
    if (ok) notes.push("tools/check.js passes");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  // 3. Behind main?
  const behind = +git("rev-list", "--count", `${ref}..origin/main`);
  if (behind) notes.push(`${behind} commit(s) behind main — owner should run: git pull --rebase origin main`);

  notes.forEach((n) => console.log("  " + n));
  problems.forEach((p) => console.log("  ✗ " + p));
  console.log(problems.length ? `  → NOT READY (${problems.length} issue(s))` : "  → OK to merge");
  return problems.length === 0;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log("usage: node tools/review.js <branch> [P1..P5]   |   node tools/review.js --all");
  process.exit(2);
}
let refs = args[0] === "--all"
  ? git("branch", "-r", "--no-merged", "origin/main", "--format=%(refname:short)").split("\n").filter((r) => r && !/HEAD/.test(r))
  : [args[0]];
if (!refs.length) console.log("No unmerged remote branches. Run `git fetch origin` first.");
const allOk = refs.map((r) => review(r, args[0] === "--all" ? null : args[1])).every(Boolean);
process.exit(allOk ? 0 : 1);
