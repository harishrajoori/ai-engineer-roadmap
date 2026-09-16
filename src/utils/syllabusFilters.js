/** Syllabus visibility filters (Node-safe; no React deps). */

export function isRequiredLesson(lesson) {
  return lesson?.required === "Yes";
}

/**
 * @param {object[]} displayLessons
 * @param {{ requiredOnly?: boolean, typeFilter?: string }} filters
 */
export function filterSyllabusLessons(displayLessons, { requiredOnly = false, typeFilter = "all" } = {}) {
  let list = displayLessons || [];
  if (requiredOnly) {
    list = list.filter(isRequiredLesson);
  }
  if (typeFilter && typeFilter !== "all") {
    list = list.filter((l) => l.type === typeFilter);
  }
  return list;
}
