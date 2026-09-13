/**
 * Smoke-test bundled curriculum module and core app imports (no browser).
 */
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const lessonsJs = path.join(root, "src/data/lessonsData.js");

if (!existsSync(lessonsJs)) {
  console.error("Missing src/data/lessonsData.js — run npm run curriculum");
  process.exit(1);
}

const mod = await import(pathToFileURL(lessonsJs).href);
const { LESSONS_DATA, COURSES_REF_DATA } = mod;

const checks = [];

if (!Array.isArray(LESSONS_DATA) || LESSONS_DATA.length < 50) {
  checks.push(`LESSONS_DATA too small: ${LESSONS_DATA?.length}`);
}

const orders = new Set(LESSONS_DATA.map((l) => l.order));
if (orders.size !== LESSONS_DATA.length) {
  checks.push("Duplicate lesson order in LESSONS_DATA");
}

for (const key of ["order", "course", "lesson", "type"]) {
  const bad = LESSONS_DATA.filter((l) => l[key] === undefined || l[key] === null);
  if (bad.length) {
    checks.push(`${bad.length} lessons missing field: ${key}`);
  }
}

if (!COURSES_REF_DATA || typeof COURSES_REF_DATA !== "object") {
  checks.push("COURSES_REF_DATA missing");
} else {
  const courseNums = new Set(LESSONS_DATA.map((l) => String(l.course)));
  for (const c of courseNums) {
    if (!COURSES_REF_DATA[c]) {
      checks.push(`COURSES_REF_DATA missing course ${c}`);
    }
  }
}

// aiService exports
const aiPath = path.join(root, "src/services/aiService.js");
const aiSrc = readFileSync(aiPath, "utf8");
if (!aiSrc.includes("ai_hub_react_api_keys")) {
  checks.push("aiService does not read Settings storage key");
}
if (!aiSrc.includes("readStoredApiKeys")) {
  checks.push("aiService missing readStoredApiKeys");
}

// Component contract hints
const appSrc = readFileSync(path.join(root, "src/App.jsx"), "utf8");
if (!appSrc.includes("activeLessonOrder")) {
  checks.push("App missing activeLessonOrder wiring");
}
if (!appSrc.includes("computeStreakDays")) {
  checks.push("App missing streak computation");
}

const feedSrc = readFileSync(path.join(root, "src/components/LessonFeed.jsx"), "utf8");
if (!feedSrc.includes("progressMap")) {
  checks.push("LessonFeed missing progressMap prop");
}

const stageSrc = readFileSync(path.join(root, "src/components/SmartStage.jsx"), "utf8");
if (!stageSrc.includes("videoOverrides")) {
  checks.push("SmartStage missing videoOverrides");
}
if (!stageSrc.includes("regeneratedContent")) {
  checks.push("SmartStage missing regeneratedContent");
}

if (checks.length) {
  console.error("APP VALIDATION FAILED:");
  checks.forEach((c) => console.error(" -", c));
  process.exit(1);
}

console.log(`APP VALIDATION OK (${LESSONS_DATA.length} lessons, ${Object.keys(COURSES_REF_DATA).length} course refs)`);
