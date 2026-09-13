const THEORY_LEVEL_KEY = "ai_hub_theory_level_pref";

/** @typedef {'beginner' | 'intermediate' | 'advanced'} TheoryLevel */

export const THEORY_LEVELS = [
  { id: "beginner", label: "Foundations", hint: "Plain English and data-pipeline analogies" },
  { id: "intermediate", label: "Study guide", hint: "Checklists, prove rubric, and steps" },
  { id: "advanced", label: "Platform depth", hint: "Tradeoffs, metrics, failures, interviews" },
];

export function loadTheoryLevelPreference() {
  const v = localStorage.getItem(THEORY_LEVEL_KEY);
  if (v === "beginner" || v === "intermediate" || v === "advanced") {
    return v;
  }
  return "beginner";
}

export function saveTheoryLevelPreference(level) {
  localStorage.setItem(THEORY_LEVEL_KEY, level);
}

/**
 * @param {object | null | undefined} lesson
 * @param {TheoryLevel} level
 * @param {string} regeneratedContent
 */
export function markdownForTheoryLevel(lesson, level, regeneratedContent = "") {
  if (regeneratedContent) {
    return regeneratedContent;
  }
  const levels = lesson?.theory_levels;
  if (levels && typeof levels[level] === "string" && levels[level].trim()) {
    return levels[level];
  }
  if (level !== "intermediate" && levels?.intermediate) {
    return levels.intermediate;
  }
  return lesson?.theory_summary || lesson?.content || "";
}
