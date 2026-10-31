// Print / Save PDF for the twin's Dossier. Owner: P5.
// Prints a clean, light A4 document in a hidden iframe instead of the dark, scrolling app screen:
// the dossier content from the twin + (if built) the sourced plan from Layer 2, with statuses and source links.
import { state } from './bus';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const CSS = `
@page { size: A4; margin: 14mm 12mm 16mm; }
* { box-sizing: border-box; }
body { font: 10pt/1.45 system-ui, -apple-system, "Segoe UI", Arial, sans-serif; color: #111; margin: 0; }
h1 { font-size: 16pt; margin: 0 0 2px; }
h2 { font-size: 12pt; margin: 18px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid #111; break-after: avoid; }
h3 { font-size: 11pt; margin: 14px 0 6px; break-after: avoid; }
.meta { color: #555; font-size: 9pt; }
.note { border: 1px solid #bbb; background: #f6f6f6; padding: 6px 8px; margin: 8px 0; font-size: 9pt; }
table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 4px 0 8px; font-size: 9pt; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th, td { text-align: left; vertical-align: top; padding: 4px 5px; border: 1px solid #ccc; }
th { background: #eee; font-weight: 600; }
a { color: #0645ad; text-decoration: none; }
.url { font-size: 7.5pt; color: #555; word-break: break-all; }
svg, button, input, select, textarea { display: none !important; }
.badge { display: inline-block; font-size: 8pt; padding: 0 4px; border: 1px solid; border-radius: 3px; white-space: nowrap; }
.verified { color: #116329; } .assumption { color: #8a5300; } .gap { color: #a40e26; }
#twin > div:first-child { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px; }
#twin > div:first-child > div { border: 1px solid #ccc; padding: 6px; }
#twin div { break-inside: avoid-page; }
footer { margin-top: 16px; font-size: 8pt; color: #666; }
`;

const badge = (s: string) => `<span class="badge ${esc(s)}">${esc(s)}</span>`;
const src = (s: any) => (s ? `<a href="${esc(s.url)}">${esc(s.agency)}</a><br><span class="url">${esc(s.url)}</span>` : '<span class="meta">no source</span>');

function sourcedPlan(): string {
  const p = state.proposal;
  if (!p) return `<div class="note">The sourced plan is not included: open "Plan this site" in the app before printing to add it.</div>`;
  return `
    <h2>Sourced plan (rules engine)</h2>
    <p class="meta">${esc(p.title)} · ${esc(p.event_start)} to ${esc(p.event_end)}</p>
    <h3>Steps, in order</h3>
    <table><colgroup><col style="width:4%"><col style="width:50%"><col style="width:13%"><col style="width:10%"><col style="width:23%"></colgroup><thead><tr><th>#</th><th>Agency and step</th><th>Start by</th><th>Status</th><th>Source</th></tr></thead><tbody>
      ${p.workplan.map((s: any, i: number) => `<tr><td>${i + 1}</td><td><b>${esc(s.agency)}</b><br>${esc(s.requirement)}<br><span class="meta">${esc(s.why)}</span></td><td>${esc(s.start_by || 'unknown — ask the agency')}</td><td>${badge(s.status)}</td><td>${src(s.source)}</td></tr>`).join('')}
    </tbody></table>
    <h3>Funding to look at</h3>
    <p class="meta">"Appears to meet" is not eligibility. Check with the agency.</p>
    <table><colgroup><col style="width:32%"><col style="width:12%"><col style="width:33%"><col style="width:23%"></colgroup><thead><tr><th>Grant</th><th>Meets / not / check</th><th>Could fund</th><th>Source</th></tr></thead><tbody>
      ${p.shortlist.map((g: any) => `<tr><td><b>${esc(g.name)}</b>${g.overlap_warnings.length ? `<br><span class="meta">May overlap with ${esc(g.overlap_warnings.map((w: any) => w.with).join(', '))}</span>` : ''}</td><td>${g.counts.met} / ${g.counts.not_met} / ${g.counts.unknown}</td><td>${esc(g.linked_components.map((c: any) => c.label).join(', '))}</td><td>${src(g.source)}</td></tr>`).join('') || '<tr><td colspan="4">No grant in our data covers these activities.</td></tr>'}
    </tbody></table>
    <h3>Ideas to improve it</h3>
    <ul>${p.guidelines.map((g: any) => `<li>${esc(g.text)} ${badge(g.status)}</li>`).join('')}</ul>
    <h3>Still to check</h3>
    <ul>${p.gaps.map((g: any) => `<li>${esc(g.label)}</li>`).join('')}</ul>`;
}

export function printDossier(content: HTMLElement | null, siteName: string) {
  if (!content) return window.print();
  const twin = content.cloneNode(true) as HTMLElement;
  twin.querySelectorAll('button, svg, input, select, textarea').forEach((n) => n.remove());
  const today = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Dossier — ${esc(siteName)}</title><style>${CSS}</style></head><body>
    <h1>Arts placemaking dossier — ${esc(siteName)}</h1>
    <div class="meta">Printed ${esc(today)} · Arts to Places SG</div>
    <div class="note"><b>Guidance only.</b> Not an approval, licence or funding decision. Status: ${badge('verified')} official source checked · ${badge('assumption')} not yet checked · ${badge('gap')} missing information. Confirm every step with the agency.</div>
    <h2>Site dossier (3D twin draft)</h2>
    <p class="meta">Figures and statuses as entered in the 3D twin.</p>
    <div id="twin">${twin.innerHTML}</div>
    ${sourcedPlan()}
    <footer>AI-generated images and AI suggestions in the app are concepts, not designs or approvals.</footer>
  </body></html>`;

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  // Give the document a moment to lay out, print, then clean up.
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}
