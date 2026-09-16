#!/usr/bin/env node
/**
 * Unit checks for Lab & Prove helpers (no test runner required).
 */
import assert from "node:assert/strict";
import {
  checklistItemKey,
  proveCompletionWarnings,
  requiredChecklistProgress,
  toggleChecklistItem,
} from "../src/utils/proveWorkflow.js";
import { computeNextAction } from "../src/utils/nextAction.js";

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

console.log("proveWorkflow tests OK");
