import { getTopicImplementationResources } from "./implementationResources.js";

/**
 * Always include the syllabus primary URL in the resource stack for the UI.
 */
export function getLessonResources(lesson) {
  if (!lesson) {
    return [];
  }

  const list = [...(lesson.resources || [])];
  const primaryUrl = (lesson.url || "").trim();

  if (primaryUrl.startsWith("http") && !list.some((r) => (r.url || "").trim() === primaryUrl)) {
    list.unshift({
      title: lesson.lesson || "Primary syllabus link",
      url: primaryUrl,
      type: lesson.type === "Video" ? "video" : "guide",
      level: "beginner",
      description: "Main link for this topic from the learning track."
    });
  }

  const impl = getTopicImplementationResources(lesson, { max: 12, includeGeneric: true });
  const implUrls = new Set(impl.map((r) => (r.url || "").trim()));
  const rest = list.filter((r) => {
    if ((r.type || "").toLowerCase() !== "implementation") {
      return true;
    }
    return !implUrls.has((r.url || "").trim());
  });
  return [...impl, ...rest];
}
