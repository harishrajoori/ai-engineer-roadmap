/**
 * Smoke-test curriculum JSON and core app wiring (no browser).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const lessonsJson = path.join(root, "data/lessons.json");
const publicJson = path.join(root, "public/data/lessons.json");

if (!existsSync(lessonsJson)) {
  console.error("Missing data/lessons.json — run npm run curriculum");
  process.exit(1);
}

if (!existsSync(publicJson)) {
  console.error("Missing public/data/lessons.json — run npm run curriculum");
  process.exit(1);
}

const data = JSON.parse(readFileSync(lessonsJson, "utf8"));
const LESSONS_DATA = data.lessons;
const COURSES_REF_DATA = data.courses_ref || {};

const checks = [];

if (!Array.isArray(LESSONS_DATA) || LESSONS_DATA.length < 50) {
  checks.push(`LESSONS_DATA too small: ${LESSONS_DATA?.length}`);
}

const orders = new Set(LESSONS_DATA.map((l) => l.order));
if (orders.size !== LESSONS_DATA.length) {
  checks.push("Duplicate lesson order in lessons.json");
}

for (const key of ["order", "course", "lesson", "type"]) {
  const bad = LESSONS_DATA.filter((l) => l[key] === undefined || l[key] === null);
  if (bad.length) {
    checks.push(`${bad.length} lessons missing field: ${key}`);
  }
}

if (!COURSES_REF_DATA || typeof COURSES_REF_DATA !== "object") {
  checks.push("courses_ref missing in lessons.json");
} else {
  const courseNums = new Set(LESSONS_DATA.map((l) => String(l.course)));
  for (const c of courseNums) {
    if (!COURSES_REF_DATA[c]) {
      checks.push(`courses_ref missing course ${c}`);
    }
  }
}

const loaderPath = path.join(root, "src/services/curriculumLoader.js");
const loaderSrc = readFileSync(loaderPath, "utf8");
if (!loaderSrc.includes("data/lessons.json")) {
  checks.push("curriculumLoader does not fetch data/lessons.json");
}

const aiPath = path.join(root, "src/services/aiService.js");
const aiSrc = readFileSync(aiPath, "utf8");
if (!aiSrc.includes("ai_hub_react_api_keys")) {
  checks.push("aiService does not read Settings storage key");
}

const appSrc = readFileSync(path.join(root, "src/App.jsx"), "utf8");
if (!appSrc.includes("loadCurriculum")) {
  checks.push("App missing loadCurriculum wiring");
}

const feedSrc = readFileSync(path.join(root, "src/components/LessonFeed.jsx"), "utf8");
if (!feedSrc.includes("progressMap")) {
  checks.push("LessonFeed missing progressMap prop");
}

const stageSrc = readFileSync(path.join(root, "src/components/SmartStage.jsx"), "utf8");
if (!stageSrc.includes("videoOverrides")) {
  checks.push("SmartStage missing videoOverrides");
}

if (checks.length) {
  console.error("APP VALIDATION FAILED:");
  checks.forEach((c) => console.error(" -", c));
  process.exit(1);
}

console.log(
  `APP VALIDATION OK (${LESSONS_DATA.length} lessons, ${Object.keys(COURSES_REF_DATA).length} course refs)`
);
