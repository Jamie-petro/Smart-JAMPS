// Layer 3 logic — prompt builder, keyless fallback, labelled placeholder. Owner: P4.
import { api, type Space } from '../bus';

export function buildPrompt(space: Space, p: any) {
  const curate = (p.guidelines || [])
    .filter((g: any) => ['curation', 'site_care', 'accessibility', 'community'].includes(g.category))
    .map((g: any) => g.text)
    .slice(0, 4);
  return [
    `Photorealistic eye-level concept visualisation of a community arts event in Singapore.`,
    `Site: ${space.name} — a ${space.kind.replace('_', ' ')}${space.outdoor ? ', outdoors' : ', sheltered'}, about ${space.area_m2 || '?'} m².`,
    `Scene: ${p.visual_brief}`,
    curate.length ? `Design intent: ${curate.join(' ')}` : '',
    `Realistic scale and lighting, tropical evening, residents of mixed ages including seniors and children, Singapore public-housing / urban context.`,
    `No text, no logos, no real brands, no identifiable real people.`
  ]
    .filter(Boolean)
    .join('\n');
}

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Placeholder shown when no image service is reachable. Clearly labelled.
export function demoImage(space: Space, p: any) {
  const items = (p.components || [])
    .map((c: any) => (c.label.length > 22 ? c.label.slice(0, 21) + '…' : c.label))
    .slice(0, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="640" viewBox="0 0 1024 640">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
    <rect width="1024" height="640" fill="url(#g)"/>
    <rect x="0" y="470" width="1024" height="170" fill="#111827"/>
    ${items.map((t: string, i: number) => `<circle cx="${220 + i * 290}" cy="400" r="70" fill="#fbbf24" opacity="${0.9 - i * 0.2}"/><text x="${220 + i * 290}" y="520" fill="#f9fafb" font-size="22" text-anchor="middle" font-family="sans-serif">${esc(t)}</text>`).join('')}
    <text x="40" y="70" fill="#f9fafb" font-size="30" font-family="sans-serif">${esc(space.name)}</text>
    <text x="40" y="610" fill="#fbbf24" font-size="20" font-family="sans-serif">DEMO PLACEHOLDER — image backend not connected</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Keyless fallback when /api/render is unavailable. Resolves null on failure/timeout.
function keylessImage(prompt: string, size: string): Promise<string | null> {
  const [w, h] = size.split('x').map((n) => Math.round(+n / 2));
  const short = prompt.replace(/\s+/g, ' ').slice(0, 700);
  const src = `https://image.pollinations.ai/prompt/${encodeURIComponent(short)}?width=${w}&height=${h}&nologo=true&seed=${Date.now() % 100000}`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 45000);
  // fetch (not <img>) so a rate-limited answer (403 / "Payment-Required" card) counts as a failure.
  return fetch(src, { signal: ctl.signal })
    .then((r) =>
      r.ok && /^image\//.test(r.headers.get('content-type') || '') && !r.headers.get('payment-required') ? r.blob() : null
    )
    .then(
      (b) =>
        b &&
        new Promise<string | null>((res) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = () => res(null);
          fr.readAsDataURL(b);
        })
    )
    .catch(() => null)
    .finally(() => clearTimeout(t));
}

// Returns a CONTRACTS.md Render plus a note for the UI.
export async function generate(space: Space, p: any, prompt: string, size: string) {
  let images: any[] | null = null;
  let model = 'demo';
  let note = '';
  const res = await api('render', { prompt, size });
  if (res?.images?.length) {
    images = res.images;
    model = res.model || '?';
  } else {
    const src = await keylessImage(prompt, size);
    if (src) {
      images = [{ src, alt: `AI concept render of ${p.title}` }];
      model = 'pollinations (keyless fallback)';
      note = 'Image backend not available here — generated with a keyless public service.';
    }
  }
  if (!images) note = 'No image service reachable — showing a labelled placeholder.';
  const render = {
    id: 'rd-' + Date.now(),
    proposal_id: p.id,
    prompt,
    images: images || [{ src: demoImage(space, p), alt: 'Demo placeholder' }],
    model,
    generated_at: new Date().toISOString(),
    is_demo: !images
  };
  return { render, note };
}
