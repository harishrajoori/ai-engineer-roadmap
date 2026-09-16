import { sectionGroupLabel } from "./sectionGroups";
import { filterSyllabusLessons, isRequiredLesson } from "./syllabusFilters.js";

export { filterSyllabusLessons, isRequiredLesson };

/** Lower rank = preferred when deduping the same URL within a course. */
const SECTION_RANK = {
  watch: 1,
  read: 2,
  build: 3,
  prove: 4,
  do: 5,
  syllabus: 6,
  video: 7,
  "capstone checklist": 8,
  "practical gate": 9,
  "pick one or two tracks": 10,
  video_spine: 99
};

function sectionRank(lesson) {
  const key = (lesson?.section || "syllabus").toLowerCase();
  return SECTION_RANK[key] ?? 50;
}

function pickKeeper(a, b) {
  const ra = sectionRank(a);
  const rb = sectionRank(b);
  if (ra !== rb) {
    return ra < rb ? a : b;
  }
  const la = (a.lesson || "").length;
  const lb = (b.lesson || "").length;
  return la >= lb ? a : b;
}

function topicTitleRaw(lesson) {
  return (lesson?.lesson || "Topic").replace(/^\*\(optional\)\*\s*/i, "").trim();
}

function topicDuration(lesson) {
  const duration = (lesson?.duration || "").trim().replace(/^·\s*/, "");
  if (!duration || duration === "Time-box as needed") {
    return "";
  }
  return duration;
}

/** Single-line label (search, legacy rows). */
export function formatTopicTitle(lesson) {
  const type = lesson?.type || "Topic";
  const parts = [type, topicTitleRaw(lesson)];
  const duration = topicDuration(lesson);
  if (duration) {
    parts.push(duration);
  }
  return parts.join(" · ");
}

/** Structured row for course overview (type pill + title + optional duration). */
export function topicRowParts(lesson) {
  return {
    type: lesson?.type || "Topic",
    title: topicTitleRaw(lesson),
    duration: topicDuration(lesson),
  };
}

export function topicProgressKey(lesson) {
  const aliases = lesson?.alias_orders || [];
  return [lesson?.order, ...aliases].filter((o) => o != null);
}

export function isTopicComplete(progressMap, lesson) {
  return topicProgressKey(lesson).some((order) => progressMap[order]);
}

export function ordersForTopicToggle(lesson) {
  return topicProgressKey(lesson);
}

/**
 * One row per unique URL per course; merges spine duplicates into the syllabus topic.
 */
export function lessonsForSyllabusDisplay(lessons) {
  if (!lessons?.length) {
    return [];
  }

  const byUrl = new Map();
  for (const lesson of lessons) {
    const url = (lesson.url || "").trim();
    if (!url.startsWith("http")) {
      continue;
    }
    if (!byUrl.has(url)) {
      byUrl.set(url, []);
    }
    byUrl.get(url).push(lesson);
  }

  const urlKeeper = new Map();
  for (const [url, group] of byUrl) {
    const keeper = group.reduce((a, b) => pickKeeper(a, b));
    const aliasOrders = group.filter((l) => l.order !== keeper.order).map((l) => l.order);
    urlKeeper.set(url, { keeper, aliasOrders });
  }

  const emittedUrl = new Set();
  const result = [];

  for (const lesson of lessons) {
    const url = (lesson.url || "").trim();
    if (!url.startsWith("http")) {
      result.push({ ...lesson, display_title: formatTopicTitle(lesson) });
      continue;
    }
    if (emittedUrl.has(url)) {
      continue;
    }
    emittedUrl.add(url);
    const { keeper, aliasOrders } = urlKeeper.get(url);
    result.push({
      ...keeper,
      alias_orders: aliasOrders.length ? aliasOrders : undefined,
      display_title: formatTopicTitle(keeper),
      merge_note:
        aliasOrders.length > 0
          ? `Merged ${aliasOrders.length + 1} syllabus lines that share this URL.`
          : undefined
    });
  }

  return result;
}

export function buildCourseTopicOutline(lessons) {
  const display = lessonsForSyllabusDisplay(lessons);
  const groups = new Map();
  for (const lesson of display) {
    const label = lesson.section_label || sectionGroupLabel(lesson.section, "");
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(lesson);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}
