// Rules engine — pure functions, no DOM. Owner: P3. See SCHEMA.md.
(function () {
  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function componentMatches(component, appliesIf) {
    return Object.entries(appliesIf || {}).every(([path, accepted]) => {
      const v = get(component, path);
      return Array.isArray(accepted) ? accepted.includes(v) : v === accepted;
    });
  }

  function addWeeks(dateStr, weeks) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() - Math.round(weeks * 7));
    return d.toISOString().slice(0, 10);
  }

  function sourceIndex(sources) {
    const m = {};
    (sources || []).forEach((s) => (m[s.id] = s));
    return m;
  }

  // Order rules: dependencies first; among ready rules, longest lead time first.
  function order(rules) {
    const byId = {};
    rules.forEach((r) => (byId[r.id] = r));
    const done = new Set();
    const out = [];
    let remaining = [...rules];
    while (remaining.length) {
      const ready = remaining.filter((r) => (r.depends_on || []).every((d) => done.has(d) || !byId[d]));
      const pick = (ready.length ? ready : remaining) // cycle guard
        .sort((a, b) => (b.lead_time_weeks ?? -1) - (a.lead_time_weeks ?? -1))[0];
      out.push(pick);
      done.add(pick.id);
      remaining = remaining.filter((r) => r !== pick);
    }
    return out;
  }

  function workplan(proposal, rules, sources) {
    if (!proposal || !rules) return [];
    const src = sourceIndex(sources);
    const applicable = rules
      .map((r) => {
        const matched = (proposal.components || []).filter((c) => componentMatches(c, r.applies_if));
        return matched.length ? { ...r, matched_components: matched.map((c) => ({ id: c.id, label: c.label })) } : null;
      })
      .filter(Boolean);
    const ids = new Set(applicable.map((r) => r.id));
    return order(applicable).map((r, i) => ({
      ...r,
      step: i + 1,
      depends_on: (r.depends_on || []).filter((d) => ids.has(d)),
      start_by: r.lead_time_weeks != null && proposal.event_start ? addWeeks(proposal.event_start, r.lead_time_weeks) : null,
      source: src[r.source_id] || null,
    }));
  }

  function evalCriterion(proposal, covered, crit) {
    const chk = crit.check;
    if (!chk || !chk.field) return { result: "unknown", components: [] };
    const [scope, ...rest] = chk.field.split(".");
    const path = rest.join(".");
    const test = (v) => (chk.in ? chk.in.includes(v) : chk.min != null ? v >= chk.min : chk.max != null ? v <= chk.max : false);
    if (scope === "component") {
      const vals = covered.map((c) => ({ c, v: get(c, path) }));
      const passing = vals.filter((x) => x.v !== undefined && x.v !== null && test(x.v));
      if (passing.length) return { result: "met", components: passing.map((x) => x.c.id) };
      if (vals.every((x) => x.v === undefined || x.v === null)) return { result: "unknown", components: [] };
      return { result: "not_met", components: [] };
    }
    const root = scope === "applicant" ? proposal.applicant : proposal;
    const v = get(root, path);
    if (v === undefined || v === null) return { result: "unknown", components: [] };
    return { result: test(v) ? "met" : "not_met", components: [] };
  }

  function shortlist(proposal, grants, sources) {
    if (!proposal || !grants) return [];
    const src = sourceIndex(sources);
    const list = grants
      .map((g) => {
        const covered = (proposal.components || []).filter((c) => (g.covers_types || []).includes(c.type));
        if (!covered.length) return null;
        const criteria = (g.criteria || []).map((cr) => ({ ...cr, ...evalCriterion(proposal, covered, cr) }));
        const counts = { met: 0, not_met: 0, unknown: 0 };
        criteria.forEach((c) => counts[c.result]++);
        return {
          ...g,
          linked_components: covered.map((c) => ({ id: c.id, label: c.label })),
          criteria,
          counts,
          improvements: criteria.filter((c) => c.result === "not_met" && c.improvement).map((c) => ({ criterion: c.text, improvement: c.improvement })),
          source: src[g.source_id] || null,
          overlap_warnings: [],
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.counts.not_met - b.counts.not_met || b.counts.met - a.counts.met);

    list.forEach((g) => {
      if (!g.funding_group) return;
      list
        .filter((o) => o !== g && o.funding_group === g.funding_group)
        .forEach((o) => {
          const shared = g.linked_components.filter((c) => o.linked_components.some((x) => x.id === c.id));
          if (shared.length)
            g.overlap_warnings.push({ with: o.name, components: shared.map((c) => c.label), rule: g.overlap_rule, status: g.overlap_status || "assumption" });
        });
    });
    return list;
  }

  // overrides: { "c-perf": { "location.land_owner": "hdb", ticketed: true } }
  function applyOverrides(proposal, overrides) {
    const p = JSON.parse(JSON.stringify(proposal));
    (p.components || []).forEach((c) => {
      Object.entries((overrides || {})[c.id] || {}).forEach(([path, val]) => {
        const keys = path.split(".");
        let o = c;
        keys.slice(0, -1).forEach((k) => (o = o[k] = o[k] || {}));
        o[keys[keys.length - 1]] = val;
      });
    });
    return p;
  }

  function gaps(workplanSteps, shortlistGrants) {
    const out = [];
    workplanSteps.forEach((r) => {
      if (r.status !== "verified") out.push({ kind: "requirement", label: r.requirement, agency: r.agency, status: r.status });
      if (r.lead_time_weeks == null) out.push({ kind: "lead time", label: r.requirement, agency: r.agency, status: "gap" });
    });
    shortlistGrants.forEach((g) =>
      g.criteria.forEach((c) => {
        if (c.status !== "verified" || c.result === "unknown")
          out.push({ kind: "grant criterion", label: `${g.name}: ${c.text}`, agency: g.agency, status: c.result === "unknown" ? "needs check" : c.status });
      })
    );
    return out;
  }

  window.Engine = { workplan, shortlist, applyOverrides, gaps, _get: get };
})();
