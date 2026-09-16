#!/usr/bin/env node
/**
 * Unit checks for studio cloud merge/apply (no browser).
 */
import assert from "node:assert/strict";

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const {
  applyStudioCloudPayload,
  buildStudioCloudPayload,
  mergeStudioCloudPayload,
} = await import("../src/utils/studioCloudSync.js");

const local = {
  version: 2,
  updatedAt: "2026-01-01T10:00:00.000Z",
  progress: { 1: true },
  notes: {},
  proveUrls: {},
  portfolioRepoUrl: "",
  proveChecklistMap: {},
};

const cloud = {
  version: 2,
  updatedAt: "2026-01-02T10:00:00.000Z",
  progress: { 1: true, 2: true },
  notes: { 2: "note" },
  proveUrls: { 9: "https://example.com/pr" },
  portfolioRepoUrl: "https://github.com/you/lab",
  proveChecklistMap: { "0:0": true },
};

assert.deepEqual(mergeStudioCloudPayload(local, cloud), cloud);
assert.deepEqual(mergeStudioCloudPayload(cloud, local), cloud);
assert.equal(mergeStudioCloudPayload(null, cloud), cloud);

const built = buildStudioCloudPayload({
  progressMap: { 3: true },
  notesMap: {},
  proveMap: { 3: "https://x.dev" },
  portfolioRepoUrl: " https://github.com/a/b ",
  proveChecklistMap: {},
  videoOverrides: {},
  studyDays: [],
  preferredModel: "gemini-3.6-flash",
  regenerations: {},
  apiKeys: {},
});
assert.equal(built.progress["3"], true);
assert.equal(built.proveUrls["3"], "https://x.dev");
assert.equal(built.portfolioRepoUrl, "https://github.com/a/b");
assert.ok(built.updatedAt);

let appliedProgress = null;
let appliedProve = null;
applyStudioCloudPayload(cloud, {
  setProgressMap: (v) => {
    appliedProgress = v;
  },
  setNotesMap: () => {},
  setProveMap: (v) => {
    appliedProve = v;
  },
  setPortfolioRepoUrl: () => {},
  setProveChecklistMap: () => {},
  setVideoOverrides: () => {},
  setStudyDays: () => {},
  setPreferredModel: () => {},
  setRegenerations: () => {},
  setApiKeys: () => {},
  saveStudyDays: () => {},
  importRegenerationsFromBackup: () => ({}),
  userProfile: null,
});
assert.equal(appliedProgress["2"], true);
assert.equal(appliedProve["9"], "https://example.com/pr");

console.log("studioCloudSync tests OK");
