/**
 * Optional runtime OAuth config (no rebuild). Copy public/studio-config.json.example → public/studio-config.json
 * and set googleClientId once for GitHub Pages. Client IDs are public identifiers, not secrets.
 */

let cached = null;

export async function loadStudioRuntimeConfig() {
  if (cached) {
    return cached;
  }
  const base = import.meta.env.BASE_URL || "/";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const url = `${prefix}studio-config.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cached = typeof data === "object" && data ? data : {};
      return cached;
    }
  } catch {
    /* static host may not have file */
  }
  cached = {};
  return cached;
}

export function studioRuntimeConfigSync() {
  return cached || {};
}
