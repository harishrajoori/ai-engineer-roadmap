import { flattenRegenerationsForBackup } from "./theoryRegenerationStore.js";

const STORAGE_META_KEY = "ai_hub_studio_cloud_meta";

function syncBaseUrl() {
  const studio = (import.meta.env.VITE_STUDIO_SYNC_URL || "").trim();
  if (studio) {
    return studio;
  }
  return (import.meta.env.VITE_THEORY_SYNC_URL || "").trim();
}

export function isStudioCloudSyncConfigured() {
  return Boolean(syncBaseUrl());
}

function readLocalMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_META_KEY);
    return raw ? JSON.parse(raw) : { updatedAt: null };
  } catch {
    return { updatedAt: null };
  }
}

function writeLocalMeta(updatedAt) {
  localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ updatedAt }));
}

/**
 * @param {{
 *   progressMap: Record<string, boolean>,
 *   notesMap: Record<string, string>,
 *   proveMap: Record<string, string>,
 *   portfolioRepoUrl: string,
 *   proveChecklistMap: Record<string, boolean>,
 *   videoOverrides: Record<string, string>,
 *   studyDays: string[],
 *   preferredModel: string,
 *   regenerations: Record<string, unknown>,
 *   apiKeys: Record<string, string>,
 * }} slice
 */
export function buildStudioCloudPayload(slice) {
  const updatedAt = new Date().toISOString();
  return {
    version: 2,
    updatedAt,
    progress: slice.progressMap || {},
    notes: slice.notesMap || {},
    proveUrls: slice.proveMap || {},
    portfolioRepoUrl: (slice.portfolioRepoUrl || "").trim(),
    proveChecklistMap: slice.proveChecklistMap || {},
    videoOverrides: slice.videoOverrides || {},
    studyDays: slice.studyDays || [],
    preferredModel: slice.preferredModel || "gemini-3.6-flash",
    regenerations: slice.regenerations || {},
    apiKeys: {
      googleClientId: (slice.apiKeys?.googleClientId || "").trim(),
      geminiApiKey: (slice.apiKeys?.geminiApiKey || "").trim(),
      openaiApiKey: (slice.apiKeys?.openaiApiKey || "").trim(),
      openaiEndpoint: (slice.apiKeys?.openaiEndpoint || "").trim(),
    },
  };
}

/**
 * @param {object | null | undefined} local
 * @param {object | null | undefined} cloud
 */
export function mergeStudioCloudPayload(local, cloud) {
  if (!cloud || typeof cloud !== "object") {
    return local || null;
  }
  if (!local || typeof local !== "object") {
    return cloud;
  }
  const localT = Date.parse(local.updatedAt || 0) || 0;
  const cloudT = Date.parse(cloud.updatedAt || 0) || 0;
  return cloudT >= localT ? cloud : local;
}

/**
 * @param {object} payload
 * @param {{
 *   setProgressMap: (v: Record<string, boolean>) => void,
 *   setNotesMap: (v: Record<string, string>) => void,
 *   setProveMap: (v: Record<string, string>) => void,
 *   setPortfolioRepoUrl?: (v: string) => void,
 *   setProveChecklistMap?: (v: Record<string, boolean>) => void,
 *   setVideoOverrides: (v: Record<string, string>) => void,
 *   setStudyDays: (v: string[]) => void,
 *   setPreferredModel: (v: string) => void,
 *   setRegenerations: (v: Record<string, unknown>) => void,
 *   setApiKeys: (fn: (prev: Record<string, string>) => Record<string, string>) => void,
 *   saveStudyDays: (days: string[]) => void,
 *   importRegenerationsFromBackup: (profile: unknown, map: Record<string, unknown>) => Record<string, unknown>,
 *   userProfile: unknown,
 * }} apply
 * @returns {{ regenerations: Record<string, unknown> }}
 */
export function applyStudioCloudPayload(payload, apply) {
  if (!payload || typeof payload !== "object") {
    return { regenerations: {} };
  }

  if (payload.progress && typeof payload.progress === "object") {
    apply.setProgressMap(payload.progress);
  }
  if (payload.notes && typeof payload.notes === "object") {
    apply.setNotesMap(payload.notes);
  }
  if (payload.proveUrls && typeof payload.proveUrls === "object") {
    apply.setProveMap(payload.proveUrls);
  }
  if (typeof payload.portfolioRepoUrl === "string" && apply.setPortfolioRepoUrl) {
    apply.setPortfolioRepoUrl(payload.portfolioRepoUrl);
  }
  if (payload.proveChecklistMap && typeof payload.proveChecklistMap === "object" && apply.setProveChecklistMap) {
    apply.setProveChecklistMap(payload.proveChecklistMap);
  }
  if (payload.videoOverrides && typeof payload.videoOverrides === "object") {
    apply.setVideoOverrides(payload.videoOverrides);
  }
  if (Array.isArray(payload.studyDays)) {
    apply.setStudyDays(payload.studyDays);
    apply.saveStudyDays(payload.studyDays);
  }
  if (payload.preferredModel) {
    apply.setPreferredModel(payload.preferredModel);
  }

  let regen = {};
  if (payload.regenerations && typeof payload.regenerations === "object") {
    regen = apply.importRegenerationsFromBackup(apply.userProfile, payload.regenerations);
    apply.setRegenerations(regen);
  }

  if (payload.apiKeys && typeof payload.apiKeys === "object") {
    apply.setApiKeys((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(payload.apiKeys).filter(([, v]) => typeof v === "string" && v.trim())
      ),
    }));
  }

  if (payload.updatedAt) {
    writeLocalMeta(payload.updatedAt);
  }

  return { regenerations: regen };
}

/**
 * @param {{ sub?: string } | null} userProfile
 * @param {string | null} idToken
 */
export async function fetchStudioCloudPayload(userProfile, idToken = null) {
  const base = syncBaseUrl();
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
    if (data?.state && typeof data.state === "object") {
      return data.state;
    }
    if (data?.regenerations && !data.progress) {
      return {
        version: 1,
        updatedAt: data.updatedAt || new Date().toISOString(),
        regenerations: data.regenerations,
      };
    }
    if (data?.progress || data?.notes) {
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * @param {{ sub?: string } | null} userProfile
 * @param {object} payload
 * @param {string | null} idToken
 */
export async function pushStudioCloudPayload(userProfile, payload, idToken = null) {
  const base = syncBaseUrl();
  if (!base || !userProfile?.sub || !payload) {
    return false;
  }
  try {
    const body = {
      userId: userProfile.sub,
      updatedAt: payload.updatedAt,
      state: payload,
      regenerations: payload.regenerations,
    };
    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      writeLocalMeta(payload.updatedAt);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function getLocalCloudUpdatedAt() {
  return readLocalMeta().updatedAt;
}

/** @returns {Record<string, string>} flat backup map */
export function regenerationsForPayload(regenerations) {
  return flattenRegenerationsForBackup(regenerations);
}
