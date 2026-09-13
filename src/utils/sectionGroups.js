/** Syllabus section ordering and labels (mirrors scripts/theory_builder.py). */
export const SECTION_ORDER = [
  "video_spine",
  "syllabus",
  "watch",
  "read",
  "build",
  "prove",
  "do",
  "capstone checklist",
  "practical gate",
  "pick one or two tracks",
  "video"
];

const LABELS = {
  video_spine: "Coursera / DL.AI spine",
  watch: "Watch",
  read: "Read",
  build: "Build",
  prove: "Prove & certify",
  do: "Practice",
  syllabus: "Syllabus",
  video: "Video",
  "capstone checklist": "Capstone",
  "practical gate": "Practical gate",
  "pick one or two tracks": "Frontier"
};

export function sectionGroupLabel(section, fallback) {
  if (fallback) {
    return fallback;
  }
  const key = (section || "syllabus").toLowerCase();
  return LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function groupLessonsBySection(lessons) {
  const map = new Map();
  for (const lesson of lessons) {
    const key = (lesson.section || "other").toLowerCase();
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(lesson);
  }

  const orderedKeys = [
    ...SECTION_ORDER.filter((k) => map.has(k)),
    ...[...map.keys()].filter((k) => !SECTION_ORDER.includes(k))
  ];

  return orderedKeys.map((key) => ({
    id: key,
    label: sectionGroupLabel(key, lessons.find((l) => (l.section || "").toLowerCase() === key)?.section_label),
    lessons: map.get(key)
  }));
}
