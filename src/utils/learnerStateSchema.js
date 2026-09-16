/**
 * Local learner state shape (localStorage + backup JSON).
 * Keep in sync with src/hooks/storageKeys.js and studioCloudSync payload.
 */

export const LEARNER_STATE_SCHEMA_VERSION = 1;

/** @typedef {Record<number, boolean>} ProgressMap */
/** @typedef {Record<number, string>} NotesMap */
/** @typedef {Record<number, string>} ProveUrlMap */
/** @typedef {Record<string, boolean>} ProveChecklistMap */

export const BACKUP_EXPORT_KEYS = [
  "exported_at",
  "user",
  "progress",
  "notes",
  "proveUrls",
  "portfolioRepoUrl",
  "proveChecklistMap",
  "videoOverrides",
  "regenerations",
  "theory_regenerations",
  "studyDays",
  "preferredModel",
];

/**
 * @param {unknown} data
 */
export function isBackupExportShape(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  const o = data;
  return typeof o.exported_at === "string" && (o.progress == null || typeof o.progress === "object");
}
