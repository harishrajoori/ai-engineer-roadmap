/**
 * Blend topic checkmarks with per-course Prove checklist completion for headline %.
 */

import { requiredChecklistProgress } from "./proveWorkflow.js";

function topicProgressKeys(lesson) {
  const aliases = lesson?.alias_orders || [];
  return [lesson?.order, ...aliases].filter((o) => o != null);
}

/**
 * Topic-only completion for a syllabus lesson list.
 *
 * @param {object[]} displayLessons
 * @param {Record<number, boolean>} progressMap
 */
export function topicProgressPct(displayLessons, progressMap) {
  if (!displayLessons?.length) {
    return 0;
  }
  const done = displayLessons.filter((l) =>
    topicProgressKeys(l).some((order) => progressMap[order])
  ).length;
  return Math.round((done / displayLessons.length) * 100);
}

/**
 * Prove checklist % for a course (100 when no required items).
 *
 * @param {Record<string, object>} coursesRef
 * @param {Record<string, boolean>} proveChecklistMap
 * @param {number} courseId
 */
export function proveProgressPct(coursesRef, proveChecklistMap, courseId) {
  const ref = coursesRef[String(courseId)] || coursesRef[courseId] || {};
  const acceptance = ref.prove_pack?.acceptance || [];
  const { done, total } = requiredChecklistProgress(acceptance, proveChecklistMap, courseId);
  if (!total) {
    return 100;
  }
  return Math.round((done / total) * 100);
}

/**
 * Average of topic % and prove % when the course has prove gates; otherwise topic % only.
 */
export function courseWeightedProgressPct(
  displayLessons,
  progressMap,
  coursesRef,
  courseId,
  proveChecklistMap
) {
  const topicPct = topicProgressPct(displayLessons, progressMap);
  const ref = coursesRef[String(courseId)] || coursesRef[courseId] || {};
  const acceptance = ref.prove_pack?.acceptance || [];
  const { total } = requiredChecklistProgress(acceptance, proveChecklistMap, courseId);
  if (!total) {
    return topicPct;
  }
  const provePct = proveProgressPct(coursesRef, proveChecklistMap, courseId);
  return Math.round((topicPct + provePct) / 2);
}

/**
 * Program-wide % weighted by syllabus topic count per course.
 *
 * @param {{ courseId: number, displayLessons: object[] }[]} courseRows
 */
export function programWeightedProgressPct(courseRows, coursesRef, progressMap, proveChecklistMap) {
  if (!courseRows?.length) {
    return 0;
  }
  let sum = 0;
  let weight = 0;
  for (const row of courseRows) {
    const displayLessons = row.displayLessons || [];
    const w = displayLessons.length || 1;
    const pct = courseWeightedProgressPct(
      displayLessons,
      progressMap,
      coursesRef,
      row.courseId,
      proveChecklistMap
    );
    sum += pct * w;
    weight += w;
  }
  return weight ? Math.round(sum / weight) : 0;
}
