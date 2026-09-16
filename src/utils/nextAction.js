/**
 * Compute the learner's next recommended action (topic + prove focus).
 */

import { requiredChecklistProgress } from "./proveWorkflow.js";

/**
 * @param {object[]} lessons
 * @param {Record<string, object>} coursesRef
 * @param {Record<number, boolean>} progressMap
 * @param {Record<string, boolean>} proveChecklistMap
 */
export function computeNextAction(lessons, coursesRef, progressMap, proveChecklistMap) {
  if (!lessons?.length) {
    return null;
  }

  const courseIds = Object.keys(coursesRef || {})
    .map((k) => Number(k))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  for (const courseId of courseIds) {
    const ref = coursesRef[String(courseId)] || {};
    const acceptance = ref.prove_pack?.acceptance || [];
    const checklist = requiredChecklistProgress(acceptance, proveChecklistMap, courseId);
    if (checklist.total > 0 && !checklist.complete) {
      const courseLessons = lessons
        .filter((l) => l.course === courseId)
        .sort((a, b) => a.order - b.order);
      const proveLesson = courseLessons.find((l) => l.type === "Prove" || l.type === "Capstone");
      const startLesson =
        courseLessons.find((l) => l.is_start_here) ||
        courseLessons.find((l) => !progressMap[l.order]) ||
        courseLessons[0];
      const focusLesson = proveLesson || startLesson;
      if (focusLesson) {
        return {
          kind: "prove_course",
          courseId,
          courseTitle: ref.walkthrough?.plain_title || ref.name || `Course ${courseId}`,
          proveTitle: ref.prove_pack?.title || "Prove gate",
          checklist,
          lesson: focusLesson,
        };
      }
    }
  }

  const nextLesson = lessons.find((l) => !progressMap[l.order]);
  if (nextLesson) {
    const ref = coursesRef[String(nextLesson.course)] || {};
    return {
      kind: "next_topic",
      courseId: nextLesson.course,
      courseTitle: ref.walkthrough?.plain_title || `Course ${nextLesson.course}`,
      lesson: nextLesson,
      checklist: null,
    };
  }

  const last = lessons[lessons.length - 1];
  return {
    kind: "complete",
    courseId: last?.course,
    courseTitle: "Program",
    lesson: last,
    checklist: null,
  };
}

/**
 * Latest non-empty prove artifact URL for a course (Prove/Capstone topics).
 *
 * @param {object[]} lessons
 * @param {Record<string, string>} proveMap
 * @param {number} courseId
 */
export function latestProveArtifactForCourse(lessons, proveMap, courseId) {
  if (!lessons?.length || !proveMap) {
    return null;
  }
  const proveLessons = lessons
    .filter(
      (l) =>
        l.course === courseId && (l.type === "Prove" || l.type === "Capstone" || l.type === "Frontier")
    )
    .sort((a, b) => b.order - a.order);
  for (const lesson of proveLessons) {
    const url = (proveMap[lesson.order] || proveMap[String(lesson.order)] || "").trim();
    if (url) {
      return { url, order: lesson.order, title: lesson.lesson || "Prove" };
    }
  }
  return null;
}

/**
 * @param {Record<string, object>} coursesRef
 * @param {Record<string, boolean>} proveChecklistMap
 * @param {string} portfolioRepoUrl
 * @param {object[]} [lessons]
 * @param {Record<string, string>} [proveMap]
 */
export function buildProveDashboardRows(
  coursesRef,
  proveChecklistMap,
  portfolioRepoUrl,
  lessons = [],
  proveMap = {}
) {
  const portfolio = (portfolioRepoUrl || "").trim();
  return Object.keys(coursesRef || {})
    .map((key) => Number(key))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
    .map((courseId) => {
      const ref = coursesRef[String(courseId)] || {};
      const acceptance = ref.prove_pack?.acceptance || [];
      const checklist = requiredChecklistProgress(acceptance, proveChecklistMap, courseId);
      return {
        courseId,
        title: ref.walkthrough?.plain_title || ref.name || `Course ${courseId}`,
        proveTitle: ref.prove_pack?.title || "Prove",
        assignment: ref.assignment || "",
        checklist,
        hasPortfolio: Boolean(portfolio),
        proveArtifact: latestProveArtifactForCourse(lessons, proveMap, courseId),
      };
    });
}
