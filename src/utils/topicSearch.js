/**
 * Search topics across lesson titles, types, and linked resources.
 */

/**
 * @param {object[]} lessons
 * @param {string} query
 * @param {number} limit
 */
export function searchLessons(lessons, query, options = {}) {
  const limit = options.limit ?? 30;
  const coursesRef = options.coursesRef || {};
  const q = (query || "").trim().toLowerCase();
  if (!q || q.length < 2 || !lessons?.length) {
    return [];
  }
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = [];
  for (const lesson of lessons) {
    const ref = coursesRef[String(lesson.course)] || coursesRef[lesson.course] || {};
    const provePackText = (ref.prove_pack?.acceptance || []).map((r) => r.criterion).join(" ");
    const parts = [
      lesson.lesson,
      lesson.course_title,
      lesson.type,
      lesson.section,
      lesson.section_label,
      lesson.prove_criteria,
      provePackText,
      ...(lesson.resources || []).map((r) => `${r.title || ""} ${r.description || ""}`),
    ];
    const hay = parts.join(" ").toLowerCase();
    if (!tokens.every((t) => hay.includes(t))) {
      continue;
    }
    let score = 0;
    if (lesson.lesson?.toLowerCase().includes(q)) {
      score += 10;
    }
    for (const t of tokens) {
      if (lesson.lesson?.toLowerCase().includes(t)) {
        score += 3;
      }
    }
    scored.push({ lesson, score });
  }

  scored.sort((a, b) => b.score - a.score || a.lesson.order - b.lesson.order);
  return scored.slice(0, limit).map((row) => row.lesson);
}
