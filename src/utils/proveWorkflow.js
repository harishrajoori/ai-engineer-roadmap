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
  const checklistGateLesson =
    lesson?.type === "Prove" ||
    lesson?.type === "Build" ||
    lesson?.type === "Capstone" ||
    Boolean(lesson?.prove_criteria);
  if (checklistGateLesson && progress.total > 0 && !progress.complete) {
    warnings.push(
      `Course prove checklist: ${progress.done}/${progress.total} required items checked (see Lab tab).`,
    );
  }

  return warnings;
}

/**
 * @param {object} lesson
 * @param {{ prove_pack?: { acceptance?: AcceptanceRow[], title?: string } }} courseRef
 * @param {{ portfolioRepoUrl?: string, proveUrl?: string, proveChecklistMap?: Record<string, boolean> }} lab
 */
export function buildProveLabContextBlock(lesson, courseRef, lab = {}) {
  if (!lesson) {
    return "";
  }
  const courseId = lesson.course;
  const provePack = courseRef?.prove_pack || {};
  const acceptance = provePack.acceptance || [];
  const progress = requiredChecklistProgress(acceptance, lab.proveChecklistMap || {}, courseId);
  const lines = [
    `Lab & Prove — course ${courseId} (${provePack.title || "prove pack"})`,
    `Checklist: ${progress.done}/${progress.total} required items checked`,
  ];
  if ((lab.portfolioRepoUrl || "").trim()) {
    lines.push(`Portfolio repo: ${lab.portfolioRepoUrl.trim()}`);
  }
  if ((lab.proveUrl || "").trim()) {
    lines.push(`This topic milestone: ${lab.proveUrl.trim()}`);
  }
  const labPlan = lesson.lab_plan;
  if (labPlan?.steps?.length) {
    lines.push("Implementation plan:");
    labPlan.steps.forEach((step) => {
      lines.push(`- ${step.title}`);
      (step.bullets || []).forEach((b) => lines.push(`  - ${b}`));
    });
    if (labPlan.done_when) {
      lines.push(`Done when: ${labPlan.done_when}`);
    }
  }
  if (acceptance.length) {
    lines.push("Acceptance (unchecked required items are gaps):");
    acceptance.forEach((row, index) => {
      if (!row.required) {
        return;
      }
      const mark = isChecklistItemChecked(lab.proveChecklistMap || {}, courseId, index) ? "done" : "open";
      lines.push(`- [${mark}] ${row.criterion}`);
    });
  }
  return lines.join("\n");
}

/**
 * User message for mentor "Plan my prove" chip.
 */
export function buildProvePlanMentorQuestion(lesson, courseRef, lab = {}) {
  const title = lesson?.lesson || "this topic";
  const courseId = lesson?.course;
  const provePack = courseRef?.prove_pack || {};
  const realWorld = courseRef?.real_world || {};
  return [
    `Plan my prove work for **${title}** (Course ${courseId}).`,
    "",
    "Use the Lab & Prove context below. Give me:",
    "1. **This week** — 3–5 concrete tasks with time-boxes",
    "2. **Repo changes** — files/folders to add or touch",
    "3. **Evidence** — what URL, tag, or README metric I should link in the Lab tab",
    "4. **Tests** — pytest or CI checks to run before I mark complete",
    "5. **Risks** — one failure mode and how to detect it in metrics",
    "",
    "=== Lab context ===",
    buildProveLabContextBlock(lesson, courseRef, lab),
    realWorld.summary ? `\nReal-world scenario: ${realWorld.summary}` : "",
    lesson.prove_criteria ? `\nTopic prove bar: ${lesson.prove_criteria}` : "",
    provePack.commands?.length
      ? `\nSuggested commands:\n${provePack.commands.map((c) => `- \`${c}\``).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
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

  const labPlan = lesson?.lab_plan;
  const deLab = labPlan?.de_lab;
  if (deLab?.scenario_markdown) {
    lines.push(`## ${deLab.scenario_title || "DE scenario"}`, "", deLab.scenario_markdown, "");
    (deLab.code_snippets || []).forEach((block) => {
      lines.push(`### ${block.title}`, "");
      if (block.filename) {
        lines.push(`File: \`${block.filename}\``, "");
      }
      lines.push(`\`\`\`${block.language || ""}`, block.code, "```", "");
    });
  }

  if (labPlan?.steps?.length) {
    lines.push(`## ${labPlan.title || "Implementation plan"}`, "");
    if (labPlan.done_when) {
      lines.push(`**Done when:** ${labPlan.done_when}`, "");
    }
    labPlan.steps.forEach((step, index) => {
      lines.push(`### ${index + 1}. ${step.title}`, "");
      if (step.detail) {
        lines.push(step.detail, "");
      }
      (step.bullets || []).forEach((b) => lines.push(`- ${b}`));
      lines.push("");
    });
    if (labPlan.implementation_links?.length) {
      lines.push("### Reference implementations", "");
      labPlan.implementation_links.forEach((link) => {
        lines.push(`- [${link.title}](${link.url})`);
      });
      lines.push("");
    }
    const local = labPlan.local_setup;
    if (local?.steps?.length) {
      lines.push("### Local setup", "");
      if (local.prerequisites?.length) {
        lines.push(`Prerequisites: ${local.prerequisites.join(", ")}`, "");
      }
      lines.push("```bash", ...local.steps, "```", "");
      if (local.env_vars?.length) {
        lines.push("```bash", ...local.env_vars, "```", "");
      }
      if (local.portfolio_note) {
        lines.push(local.portfolio_note, "");
      }
    }
  }

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
