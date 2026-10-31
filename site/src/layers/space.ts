// Layer 1 → Space adapter. Owner: P1.
// The digital twin (App.tsx) broadcasts window event "artsToPlaces:stateChange" with the selected site.
// This turns that site into a CONTRACTS.md Space so Layer 2's rules engine can use it.
import type { Space } from './bus';

// kind / land_owner are mapped by hand from each site's "tenure" and "zoneType" in App.tsx.
// They are assumptions until checked against SLA / OneMap land ownership.
const SITE_SPACE: Record<string, { kind: string; land_owner: string; area_m2: number }> = {
  queensway: { kind: 'vacant_land', land_owner: 'state_land', area_m2: 56 * 46 }, // SLA State Land + LTA viaduct reserve
  rochor: { kind: 'streetscape', land_owner: 'state_land', area_m2: 52 * 42 }, // SLA State Land + URA conservation
  novena: { kind: 'streetscape', land_owner: 'public_road', area_m2: 50 * 40 }, // LTA pedestrian deck
  bishan: { kind: 'park', land_owner: 'park', area_m2: 58 * 48 }, // NParks park reserve
  woodlands: { kind: 'vacant_land', land_owner: 'unknown', area_m2: 54 * 44 } // JTC + SLA underpass: owner unclear
};

export function toSpace(site: any, params: any): Space {
  const m = SITE_SPACE[site.id] || { kind: 'other', land_owner: 'unknown', area_m2: null };
  return {
    id: site.id,
    name: site.name,
    lat: site.wgs84.lat,
    lon: site.wgs84.lng,
    kind: m.kind,
    land_owner: m.land_owner,
    outdoor: true,
    area_m2: m.area_m2,
    // The twin's "crowd size" slider caps each activity's audience in Layer 2.
    capacity_est: typeof params?.crowdSize === 'number' ? params.crowdSize : null,
    photo_url: null,
    notes: `Site from the Layer 1 digital twin${site.code ? ` (${site.code})` : ''}.`,
    source: 'Layer 1 digital twin draft — land owner not yet checked against SLA / OneMap',
    status: 'assumption'
  };
}
