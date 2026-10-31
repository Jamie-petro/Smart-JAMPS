// Shared state + events between layers. Owner: P5. Same contract as CONTRACTS.md:
// "space:selected" (Space) → "proposal:ready" (Proposal) → "render:ready" (Render).
// Layers talk only through emit/on/useBus — never import another layer's panel.
import { useSyncExternalStore } from 'react';

export type Status = 'verified' | 'assumption' | 'gap';
export interface Space {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: string;
  land_owner: string;
  outdoor: boolean;
  area_m2: number | null;
  capacity_est: number | null;
  photo_url: string | null;
  notes: string;
  source: string;
  status: Status;
}
export interface BusState {
  space: Space | null;
  proposal: any | null;
  render: any | null;
}
// 'plan:idea' (string): a change the user accepted in Review; Layer 2 adds it to the plan's ideas.
type Event = 'space:selected' | 'proposal:ready' | 'render:ready' | 'plan:idea';

const KEY: Partial<Record<Event, keyof BusState>> = {
  'space:selected': 'space',
  'proposal:ready': 'proposal',
  'render:ready': 'render'
};
export const state: BusState = { space: null, proposal: null, render: null };
const listeners: Partial<Record<Event, Set<(payload: any) => void>>> = {};
const subscribers = new Set<() => void>();
let version = 0;

export function emit(event: Event, payload: any) {
  const key = KEY[event];
  if (key) state[key] = payload;
  // Selecting a new space clears proposal and render; a new proposal clears render.
  if (event === 'space:selected') state.proposal = state.render = null;
  if (event === 'proposal:ready') state.render = null;
  (listeners[event] || new Set()).forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error(`[${event}] listener failed`, e);
    }
  });
  version++;
  subscribers.forEach((fn) => fn());
}

export function on(event: Event, fn: (payload: any) => void) {
  (listeners[event] = listeners[event] || new Set()).add(fn);
  return () => listeners[event]!.delete(fn);
}

// React hook: re-renders the caller whenever any event is emitted.
export function useBus(): BusState {
  useSyncExternalStore(
    (cb) => (subscribers.add(cb), () => subscribers.delete(cb)),
    () => version
  );
  return state;
}

// POST /api/<path> → { data } or { error } with the server's reason (e.g. "ANTHROPIC_API_KEY not set").
export async function apiCall(path: string, body: unknown): Promise<{ data?: any; error?: string }> {
  try {
    const r = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    const text = await r.text();
    let j: any = null;
    try {
      j = JSON.parse(text);
    } catch {
      // Static hosts / local dev answer with HTML or 404.
    }
    if (r.ok && j) return { data: j };
    return { error: j?.error || (r.status === 404 || !j ? 'no backend here (static host or local dev)' : `HTTP ${r.status}`) };
  } catch (e: any) {
    return { error: `network error: ${e.message || e}` };
  }
}

// POST /api/<path>; resolves null when there is no backend (static host, local dev) or on error.
export async function api(path: string, body: unknown): Promise<any | null> {
  try {
    const r = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) {
      console.warn(`/api/${path} →`, r.status, await r.text().catch(() => ''));
      return null;
    }
    return await r.json();
  } catch (e) {
    console.warn(`/api/${path} unavailable`, e);
    return null;
  }
}
