"use client";

// Small external store for localStorage / sessionStorage, read through
// useSyncExternalStore.
//
// The previous pattern was "render a default, then read storage in an effect and
// setState". That avoided SSR hydration mismatches but calls setState
// synchronously inside an effect body, which React 19's `react-hooks` rules flag
// because it causes a cascading second render on every mount.
//
// useSyncExternalStore is the intended tool: it takes a separate server snapshot
// (so server HTML and the first client paint agree) and then switches to the
// live value, with React handling the transition rather than an effect.

/**
 * Where the demo session lives. Declared here rather than in session.jsx so the
 * mock API layer can read it without importing React context.
 */
export const SESSION_KEY = "nkhedmou.session";

const listeners = new Set();

/** Snapshots must be referentially stable between reads or React re-renders forever. */
const cache = new Map();

const canUseDOM = typeof window !== "undefined";

const area = (kind) => (kind === "session" ? window.sessionStorage : window.localStorage);

export function subscribe(callback) {
  listeners.add(callback);
  // `storage` fires for changes made in *other* tabs; same-tab writes go through
  // setValue below, which notifies directly.
  if (canUseDOM) window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    if (canUseDOM) window.removeEventListener("storage", callback);
  };
}

const notify = () => listeners.forEach((l) => l());

export function getString(key, fallback = "", kind = "local") {
  if (!canUseDOM) return fallback;
  const raw = area(kind).getItem(key);
  return raw === null ? fallback : raw;
}

/**
 * Reads and parses a JSON value, returning the identical object reference for as
 * long as the underlying string is unchanged.
 */
export function getJSON(key, fallback, kind = "local") {
  if (!canUseDOM) return fallback;

  const raw = area(kind).getItem(key);
  if (raw === null) return fallback;

  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.parsed;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupted value — behave as if nothing was stored.
    parsed = fallback;
  }
  cache.set(key, { raw, parsed });
  return parsed;
}

export function setValue(key, value, kind = "local") {
  if (!canUseDOM) return;
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  area(kind).setItem(key, raw);
  cache.delete(key);
  notify();
}

export function removeValue(key, kind = "local") {
  if (!canUseDOM) return;
  area(kind).removeItem(key);
  cache.delete(key);
  notify();
}
