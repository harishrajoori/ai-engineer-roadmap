/**
 * Lab & Prove workflow: portfolio URL, per-course acceptance checklists, completion warnings.
 */

export const PORTFOLIO_REPO_STORAGE_KEY = "ai_hub_portfolio_repo_url";
export const PROVE_CHECKLIST_STORAGE_KEY = "ai_hub_prove_checklist";

/** @typedef {{ criterion: string, required?: boolean }} AcceptanceRow */

/**
 * @param {string | number} courseId
 * @param {number} index
 */
export function checklistItemKey(courseId, index) {
  return `${courseId}:${index}`;
}

export function readPortfolioRepoUrl() {
  try {
    return (localStorage.getItem(PORTFOLIO_REPO_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function savePortfolioRepoUrl(url) {
  const trimmed = (url || "").trim();
  if (trimmed) {
    localStorage.setItem(PORTFOLIO_REPO_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(PORTFOLIO_REPO_STORAGE_KEY);
  }
  return trimmed;
}

/** @returns {Record<string, boolean>} */
export function readProveChecklistMap() {
  try {
    const raw = localStorage.getItem(PROVE_CHECKLIST_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeProveChecklistMap(map) {
  localStorage.setItem(PROVE_CHECKLIST_STORAGE_KEY, JSON.stringify(map || {}));
}

export function isChecklistItemChecked(map, courseId, index) {
  return Boolean(map[checklistItemKey(courseId, index)]);
}

export function toggleChecklistItem(map, courseId, index) {
  const key = checklistItemKey(courseId, index);
  const next = { ...map, [key]: !map[key] };
  if (!next[key]) {
    delete next[key];
  }
  return next;
}

/**
 * @param {AcceptanceRow[]} acceptance
 * @param {Record<string, boolean>} checklistMap
 * @param {string | number} courseId
 */
export function requiredChecklistProgress(acceptance, checklistMap, courseId) {
  const rows = acceptance || [];
  const required = rows.filter((r) => r.required);
  if (!required.length) {
    return { done: 0, total: 0, complete: true };
  }
  let done = 0;
  rows.forEach((row, index) => {
    if (row.required && isChecklistItemChecked(checklistMap, courseId, index)) {
      done += 1;
    }
  });
  return { done, total: required.length, complete: done >= required.length };
}

/**
 * @param {object} lesson
 * @param {string} proveUrl
 * @param {string} portfolioRepoUrl
 * @param {{ prove_pack?: { acceptance?: AcceptanceRow[] } }} courseRef
 * @param {Record<string, boolean>} checklistMap
 * @returns {string[]}
 */
export function proveCompletionWarnings(lesson, proveUrl, portfolioRepoUrl, courseRef, checklistMap) {
  const warnings = [];
  const courseId = lesson?.course;
  const artifact = (proveUrl || "").trim();
  const portfolio = (portfolioRepoUrl || "").trim();

  const isProveLesson =
    lesson?.type === "Prove" || lesson?.type === "Build" || Boolean(lesson?.prove_criteria);

  if (isProveLesson && !artifact && !portfolio) {
    warnings.push("Link your portfolio repo or a milestone artifact URL.");
  }

  const acceptance = courseRef?.prove_pack?.acceptance || [];
  const progress = requiredChecklistProgress(acceptance, checklistMap, courseId);
  if (progress.total > 0 && !progress.complete) {
    warnings.push(
      `Course prove checklist: ${progress.done}/${progress.total} required items checked (see Lab tab).`,
    );
  }

  return warnings;
}

/**
 * @param {object} params
 */
export function buildProveWorksheetMarkdown({
  lesson,
  courseRef,
  portfolioRepoUrl,
  proveUrl,
  checklistMap,
}) {
  const courseId = lesson?.course;
  const provePack = courseRef?.prove_pack || {};
  const realWorld = courseRef?.real_world || {};
  const lines = [
    `# Prove worksheet — ${lesson?.lesson || "Topic"}`,
    "",
    `Course ${courseId}: ${courseRef?.name || lesson?.course_title || ""}`,
    "",
  ];

  if (realWorld.summary) {
    lines.push("## Real-world scenario", "", realWorld.summary, "");
  }
  if (lesson?.prove_criteria) {
    lines.push("## This topic", "", lesson.prove_criteria, "");
  }
  if (provePack.title) {
    lines.push(`## Course prove: ${provePack.title}`, "");
  }

  const acceptance = provePack.acceptance || [];
  if (acceptance.length) {
    lines.push("## Acceptance checklist", "");
    acceptance.forEach((row, index) => {
      const checked = isChecklistItemChecked(checklistMap, courseId, index) ? "x" : " ";
      const req = row.required ? "(required)" : "(optional)";
      lines.push(`- [${checked}] ${row.criterion} ${req}`);
    });
    lines.push("");
  }

  if (portfolioRepoUrl) {
    lines.push(`## Portfolio repo`, "", portfolioRepoUrl, "");
  }
  if (proveUrl) {
    lines.push(`## This milestone`, "", proveUrl, "");
  }

  if (provePack.readme_example) {
    lines.push("## README snippet example", "", provePack.readme_example, "");
  }
  if (provePack.commands?.length) {
    lines.push("## Commands to run", "");
    provePack.commands.forEach((c) => lines.push("```bash", c, "```", ""));
  }

  lines.push("---", "_Generated by AI Systems Engineer Studio — run pytest/CI in your repo; studio does not auto-grade._");
  return lines.join("\n");
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
