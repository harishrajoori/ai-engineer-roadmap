const LAYOUT_KEY = "ai_hub_learning_layout";

export function readLearningLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        curriculumOpen: parsed.curriculumOpen !== false,
        stageOpen: parsed.stageOpen !== false,
        mentorExpanded: Boolean(parsed.mentorExpanded),
      };
    }
  } catch {
    /* ignore */
  }
  return { curriculumOpen: true, stageOpen: true, mentorExpanded: false };
}

export function persistLearningLayout(layout) {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

export function layoutContainerClass(layout) {
  const parts = [];
  if (!layout.curriculumOpen) {
    parts.push("layout-curriculum-collapsed");
  }
  if (!layout.stageOpen) {
    parts.push("layout-stage-collapsed");
  }
  if (layout.mentorExpanded) {
    parts.push("layout-mentor-expanded");
  }
  return parts.join(" ");
}
