// Layer 3 logic — prompt builder, /api/render call, sample concept images when no backend. Owner: P4.
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

// Demo renders: three AI concept images from the render-layer zip (public/layers/render/images/).
// Used when /api/render is unavailable. They are samples for the site *type*, not images of this site.
const SAMPLE_BY_KIND: Record<string, string> = {
  park: 'park_connector_art_1793422638218.jpg',
  streetscape: 'telok_ayer_artwalk_1793422637749.jpg',
  heritage_building: 'telok_ayer_artwalk_1793422637749.jpg',
  plaza: 'telok_ayer_artwalk_1793422637749.jpg'
};
export function sampleImage(space: Space) {
  return '/layers/render/images/' + (SAMPLE_BY_KIND[space.kind] || 'voiddeck_theatre_1793422637830.jpg');
}

// Returns a CONTRACTS.md Render plus a note for the UI.
export async function generate(space: Space, p: any, prompt: string, size: string) {
  const res = await api('render', { prompt, size });
  const live = !!res?.images?.length;
  const render = {
    id: 'rd-' + Date.now(),
    proposal_id: p.id,
    prompt,
    images: live
      ? res.images
      : [{ src: sampleImage(space), alt: `Sample AI concept for a ${space.kind.replace('_', ' ')} (not this site)` }],
    model: live ? res.model || '?' : 'sample render (render layer)',
    generated_at: new Date().toISOString(),
    is_demo: !live
  };
  const note = live ? '' : 'Sample image for this type of site (image service not connected).';
  return { render, note };
}
