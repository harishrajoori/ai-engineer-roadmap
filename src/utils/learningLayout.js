const LAYOUT_KEY = "ai_hub_learning_layout";

const DEFAULTS = {
  curriculumOpen: true,
  stageOpen: true,
  mentorExpanded: false,
  navWidth: 228,
  syllabusWidth: 300,
  mentorWidth: 360,
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function readLearningLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        curriculumOpen: parsed.curriculumOpen !== false,
        stageOpen: parsed.stageOpen !== false,
        mentorExpanded: Boolean(parsed.mentorExpanded),
        navWidth: clamp(Number(parsed.navWidth) || DEFAULTS.navWidth, 180, 360),
        syllabusWidth: clamp(Number(parsed.syllabusWidth) || DEFAULTS.syllabusWidth, 220, 480),
        mentorWidth: clamp(Number(parsed.mentorWidth) || DEFAULTS.mentorWidth, 300, 960),
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

export function defaultLearningLayout() {
  return { ...DEFAULTS };
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

/** Desktop grid column template from layout state + drag widths. */
export function gridTemplateColumnsForLayout(layout) {
  const mentor = clamp(layout.mentorWidth ?? DEFAULTS.mentorWidth, 300, 960);

  if (!layout.curriculumOpen && !layout.stageOpen) {
    return "minmax(0, 1fr)";
  }

  const cols = [];
  if (layout.curriculumOpen) {
    cols.push(`${clamp(layout.navWidth, 180, 360)}px`);
    cols.push(`${clamp(layout.syllabusWidth, 220, 480)}px`);
  }
  if (layout.stageOpen) {
    cols.push("minmax(0, 1fr)");
  }
  cols.push(`minmax(280px, ${mentor}px)`);
  return cols.join(" ");
}
