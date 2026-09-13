import { readJsonStorage } from "./localStorage";

const LEGACY_REGEN_KEY = "ai_hub_react_regenerations";
const REGEN_PREFIX = "ai_hub_theory_regen";

/**
 * Stable user id for per-account storage (Google `sub` when available).
 * @param {import('./googleAuth').GoogleProfile | null | undefined} userProfile
 */
export function userStorageId(userProfile) {
  if (!userProfile) {
    return "anonymous";
  }
  const sub = (userProfile.sub || "").trim();
  if (sub) {
    return sub;
  }
  const email = (userProfile.email || "").trim().toLowerCase();
  return email || "anonymous";
}

function localKey(userProfile) {
  return `${REGEN_PREFIX}_${userStorageId(userProfile)}`;
}

/**
 * @returns {Record<string, { content: string, model?: string, lens?: string, updatedAt?: string }>}
 */
export function loadTheoryRegenerations(userProfile) {
  const scoped = readJsonStorage(localKey(userProfile), {});
  if (Object.keys(scoped).length > 0) {
    return normalizeRegenMap(scoped);
  }
  const legacy = readJsonStorage(LEGACY_REGEN_KEY, {});
  if (Object.keys(legacy).length === 0) {
    return {};
  }
  const migrated = normalizeLegacyRegenMap(legacy);
  persistTheoryRegenerations(userProfile, migrated);
  return migrated;
}

function normalizeLegacyRegenMap(legacy) {
  const out = {};
  for (const [order, value] of Object.entries(legacy)) {
    if (typeof value === "string") {
      out[order] = { content: value, updatedAt: new Date().toISOString() };
    } else if (value && typeof value.content === "string") {
      out[order] = value;
    }
  }
  return out;
}

function normalizeRegenMap(scoped) {
  const out = {};
  for (const [order, value] of Object.entries(scoped)) {
    if (typeof value === "string") {
      out[order] = { content: value };
    } else if (value && typeof value.content === "string") {
      out[order] = value;
    }
  }
  return out;
}

export function persistTheoryRegenerations(userProfile, map) {
  localStorage.setItem(localKey(userProfile), JSON.stringify(map));
}

/**
 * @param {import('./googleAuth').GoogleProfile | null | undefined} userProfile
 * @param {number | string} order
 * @param {string} content
 * @param {{ model?: string, lens?: string }} meta
 */
export function saveTheoryRegeneration(userProfile, order, content, meta = {}) {
  const key = String(order);
  const prev = loadTheoryRegenerations(userProfile);
  const next = {
    ...prev,
    [key]: {
      content,
      model: meta.model,
      lens: meta.lens,
      updatedAt: new Date().toISOString(),
    },
  };
  persistTheoryRegenerations(userProfile, next);
  void syncTheoryRegenerationsToCloud(userProfile, next);
  return next;
}

/** Markdown body for SmartStage, or empty string. */
export function regenerationMarkdown(regenerations, order) {
  const entry = regenerations?.[String(order)] ?? regenerations?.[order];
  if (!entry) {
    return "";
  }
  return typeof entry === "string" ? entry : entry.content || "";
}

function cloudSyncUrl() {
  return (import.meta.env.VITE_THEORY_SYNC_URL || "").trim();
}

/**
 * Optional cloud mirror (set VITE_THEORY_SYNC_URL to your API).
 * Expects POST JSON: { userId, regenerations } with Bearer ID token if provided.
 */
export async function syncTheoryRegenerationsToCloud(userProfile, map, idToken = null) {
  const base = cloudSyncUrl();
  if (!base || !userProfile?.sub) {
    return;
  }
  try {
    await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        userId: userProfile.sub,
        regenerations: map,
      }),
    });
  } catch {
    // Local save already succeeded; cloud is best-effort.
  }
}

/**
 * Pull cloud regenerations after login (merges into local store).
 */
export async function fetchTheoryRegenerationsFromCloud(userProfile, idToken = null) {
  const base = cloudSyncUrl();
  if (!base || !userProfile?.sub) {
    return null;
  }
  try {
    const url = `${base.replace(/\/$/, "")}?userId=${encodeURIComponent(userProfile.sub)}`;
    const res = await fetch(url, {
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (data?.regenerations && typeof data.regenerations === "object") {
      const merged = { ...loadTheoryRegenerations(userProfile), ...normalizeRegenMap(data.regenerations) };
      persistTheoryRegenerations(userProfile, merged);
      return merged;
    }
  } catch {
    return null;
  }
  return null;
}

/** Flat map for backup export: order -> markdown string */
export function flattenRegenerationsForBackup(map) {
  const out = {};
  for (const [order, value] of Object.entries(map || {})) {
    out[order] = typeof value === "string" ? value : value?.content || "";
  }
  return out;
}

/** Import backup regenerations into scoped store */
export function importRegenerationsFromBackup(userProfile, flatOrRich) {
  const normalized = normalizeLegacyRegenMap(flatOrRich || {});
  persistTheoryRegenerations(userProfile, normalized);
  return normalized;
}
