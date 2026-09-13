/**
 * Lazy-load curriculum from /data/lessons.json (copied to dist on build).
 */

let cached = null;

/** Clear in-memory cache (e.g. after `npm run curriculum` or Retry). */
export function invalidateCurriculumCache() {
  cached = null;
}

function buildCoursesRefFromLessons(lessons) {
  const ref = {};
  for (const les of lessons) {
    const key = String(les.course);
    const concepts = (les.course_concepts || []).filter(Boolean).slice(0, 10);
    const prompts = (les.course_prompts || []).filter((p) => p && String(p).trim()).slice(0, 6);
    if (!ref[key]) {
      ref[key] = {
        name: les.course_title || `Course ${les.course}`,
        concepts,
        prompts
      };
      continue;
    }
    if (concepts.length && !ref[key].concepts.length) {
      ref[key].concepts = concepts;
      ref[key].prompts = prompts;
      ref[key].name = les.course_title || ref[key].name;
    }
  }
  return ref;
}

/**
 * @returns {Promise<{ lessons: object[], coursesRef: Record<string, { name: string, concepts: string[], prompts: string[] }> }>}
 */
export async function loadCurriculum() {
  if (cached) {
    return cached;
  }

  const jsonUrl = `${import.meta.env.BASE_URL}data/lessons.json`;
  const res = await fetch(jsonUrl, { cache: import.meta.env.DEV ? "no-store" : "default" });
  if (!res.ok) {
    throw new Error(`Failed to load curriculum (${res.status}). Run npm run curriculum and rebuild.`);
  }

  const data = await res.json();
  const lessons = data.lessons;
  if (!Array.isArray(lessons) || lessons.length < 1) {
    throw new Error("Curriculum file is empty or invalid.");
  }

  const coursesRef = data.courses_ref || buildCoursesRefFromLessons(lessons);
  cached = {
    lessons,
    coursesRef,
    programPrimerMarkdown: data.program_primer_markdown || "",
    glossary: Array.isArray(data.glossary) ? data.glossary : [],
  };
  return cached;
}

/** @param {string} [url] */
export function curriculumDataUrl(url = import.meta.env.BASE_URL) {
  return new URL("data/lessons.json", window.location.origin + (url || "/")).href;
}
