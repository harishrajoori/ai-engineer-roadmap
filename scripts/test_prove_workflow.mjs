#!/usr/bin/env node
/**
 * Unit checks for Lab & Prove helpers (no test runner required).
 */
import assert from "node:assert/strict";
import {
  buildProgramPortfolioSummaryMarkdown,
  checklistItemKey,
  proveCompletionWarnings,
  requiredChecklistProgress,
  toggleChecklistItem,
} from "../src/utils/proveWorkflow.js";
import { computeNextAction } from "../src/utils/nextAction.js";
import {
  courseWeightedProgressPct,
  programWeightedProgressPct,
} from "../src/utils/learningProgress.js";
import { filterSyllabusLessons } from "../src/utils/syllabusFilters.js";
import { searchLessons } from "../src/utils/topicSearch.js";
import { isBackupExportShape } from "../src/utils/learnerStateSchema.js";

const acceptance = [
  { criterion: "Repo public", required: true },
  { criterion: "README", required: true },
  { criterion: "Blog post", required: false },
];

const courseId = 0;
let map = {};
map = toggleChecklistItem(map, courseId, 0);
const progress = requiredChecklistProgress(acceptance, map, courseId);
assert.equal(progress.done, 1);
assert.equal(progress.total, 2);
assert.equal(progress.complete, false);

assert.equal(checklistItemKey(3, 1), "3:1");

const proveLesson = { type: "Prove", course: 0 };
const courseRef = { prove_pack: { acceptance } };
const warningsProve = proveCompletionWarnings(proveLesson, "", "", courseRef, map);
assert.ok(warningsProve.some((w) => w.includes("portfolio")));
assert.ok(warningsProve.some((w) => w.includes("checklist")));

const readLesson = { type: "Read", course: 0 };
const warningsRead = proveCompletionWarnings(readLesson, "", "", courseRef, map);
assert.equal(warningsRead.length, 0, "Read topics should not nag on course checklist");

map = toggleChecklistItem(map, courseId, 1);
const progressDone = requiredChecklistProgress(acceptance, map, courseId);
assert.equal(progressDone.complete, true);

const lessons = [{ order: 1, course: 0, lesson: "Start", type: "Video" }];
const coursesRef = {
  "0": { prove_pack: { acceptance, title: "Boot" }, walkthrough: { plain_title: "Boot" } },
};
const action = computeNextAction(lessons, coursesRef, {}, {});
assert.equal(action?.kind, "prove_course");
assert.equal(action?.courseId, 0);

const displayLessons = [{ order: 1, course: 0, lesson: "Start", type: "Video" }];
const allTopicsDone = { 1: true };
const coursesRefWeighted = {
  "0": { prove_pack: { acceptance, title: "Boot" } },
};
assert.equal(
  courseWeightedProgressPct(displayLessons, allTopicsDone, coursesRefWeighted, 0, {}),
  50,
  "100% topics + 0% prove should average to 50%"
);
assert.equal(
  courseWeightedProgressPct(displayLessons, {}, coursesRefWeighted, 0, map),
  50,
  "0% topics + 100% prove should average to 50%"
);

const courseRows = [{ courseId: 0, displayLessons }];
assert.equal(
  programWeightedProgressPct(courseRows, coursesRefWeighted, allTopicsDone, map),
  100,
  "course with full topic + prove should be 100% program"
);

const syllabusRows = [
  { order: 1, type: "Read", required: "Yes" },
  { order: 2, type: "Read", required: "No" },
];
assert.equal(filterSyllabusLessons(syllabusRows, { requiredOnly: true }).length, 1);
assert.equal(filterSyllabusLessons(syllabusRows, { typeFilter: "Video" }).length, 0);

const searchHits = searchLessons(
  [{ order: 5, course: 1, lesson: "LiteLLM gateway routing", type: "Read", resources: [] }],
  "litellm"
);
assert.equal(searchHits.length, 1);
assert.ok(isBackupExportShape({ exported_at: "2026-01-01", progress: {} }));
assert.equal(isBackupExportShape({}), false);

const summaryMd = buildProgramPortfolioSummaryMarkdown({
  coursesRef: coursesRefWeighted,
  proveChecklistMap: map,
  portfolioRepoUrl: "https://github.com/example/lab",
  progressMap: { 1: true },
  lessons: [{ order: 1, course: 0, lesson: "Start", type: "Video" }],
});
assert.ok(summaryMd.includes("Course 0"));
assert.ok(summaryMd.includes("github.com/example/lab"));

console.log("proveWorkflow tests OK");
