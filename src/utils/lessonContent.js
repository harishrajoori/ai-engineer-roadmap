/**
 * Build readable theory markdown when no `content` or AI regeneration exists.
 */
export function buildDefaultLessonMarkdown(lesson, courseRef = {}) {
  if (!lesson) {
    return "";
  }

  const lines = [];
  lines.push(`# ${lesson.lesson}`);
  lines.push("");
  lines.push(`**Course ${lesson.course}** · ${lesson.course_title}`);
  if (lesson.month) {
    lines.push(`**Timeline:** ${lesson.month}`);
  }
  const req = lesson.required === "Yes" ? "Required" : "Optional";
  lines.push(`**Type:** ${lesson.type} · ${req}`);
  if (lesson.duration) {
    lines.push(`**Effort:** ${lesson.duration}`);
  }
  lines.push("");

  const takeaways = lesson.digest?.takeaways?.filter(Boolean) || [];
  if (takeaways.length) {
    lines.push("## Key takeaways");
    takeaways.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  } else if (courseRef.concepts?.length) {
    lines.push("## Concepts for this course");
    courseRef.concepts.slice(0, 8).forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  lines.push("## Learning objective");
  const objectives = {
    Video: "Watch the lecture, then articulate bottlenecks, failure modes, and production constraints for this topic.",
    Read: "Read the source material and summarize invariants, APIs, and when *not* to use this pattern.",
    Build: "Ship the milestone implementation and make tests pass locally before marking complete.",
    Prove: "Demonstrate mastery with an artifact (repo, notebook, or dashboard) and link it in the Prove section.",
    Do: "Complete the hands-on exercise and note what you would monitor in production.",
    Capstone: "Check off capstone items and tie them to measurable SLAs or evaluation metrics.",
    Frontier: "Explore the frontier track and decide adopt / hold / reject with a one-paragraph rationale.",
    Syllabus: "Orient yourself to the module syllabus and schedule deep work blocks."
  };
  lines.push(objectives[lesson.type] || objectives.Do);
  lines.push("");

  if (lesson.url) {
    lines.push(`[Open primary resource ↗](${lesson.url})`);
    lines.push("");
  }

  const resources = lesson.resources || [];
  if (resources.length) {
    lines.push("## Supplemental resources");
    resources.forEach((r) => {
      const title = r.title || r.label || "Resource";
      const level = r.level ? ` *(${r.level})*` : "";
      if (r.url) {
        lines.push(`- [${title}](${r.url})${level}`);
      } else {
        lines.push(`- ${title}${level}`);
      }
      if (r.description) {
        lines.push(`  - ${r.description}`);
      }
    });
  }

  return lines.join("\n");
}
