import React from "react";
import {
  Focus,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  RotateCcw,
} from "lucide-react";
import { defaultLearningLayout } from "../utils/learningLayout";

/**
 * Quick toggles to hide curriculum rails or mentor chat and maximize lesson content.
 */
export default function LearningFocusBar({
  layout,
  onLayoutChange,
  isWideDesktop = false,
  mobilePanel = null,
  onMobilePanelChange,
}) {
  if (!layout || !onLayoutChange) {
    return null;
  }

  const set = (patch) => onLayoutChange({ ...layout, ...patch });

  const leftOpen = isWideDesktop
    ? layout.curriculumOpen
    : mobilePanel === "courses" || mobilePanel === "syllabus";
  const rightOpen = isWideDesktop ? layout.mentorOpen !== false : mobilePanel === "mentor";

  const toggleLeft = () => {
    if (isWideDesktop) {
      set({ curriculumOpen: !layout.curriculumOpen });
      return;
    }
    if (mobilePanel === "courses" || mobilePanel === "syllabus") {
      onMobilePanelChange?.(null);
    } else {
      onMobilePanelChange?.("syllabus");
    }
  };

  const toggleRight = () => {
    if (isWideDesktop) {
      set({ mentorOpen: layout.mentorOpen === false });
      return;
    }
    onMobilePanelChange?.(mobilePanel === "mentor" ? null : "mentor");
  };

  const focusContent = () => {
    if (isWideDesktop) {
      set({ curriculumOpen: false, mentorOpen: false });
    } else {
      onMobilePanelChange?.(null);
    }
  };

  const expandAll = () => {
    if (isWideDesktop) {
      onLayoutChange(defaultLearningLayout());
    } else {
      onMobilePanelChange?.(null);
    }
  };

  const contentFocused =
    isWideDesktop && !layout.curriculumOpen && layout.mentorOpen === false;

  return (
    <div className="learning-focus-bar" role="toolbar" aria-label="Panel visibility">
      <button
        type="button"
        className={`learning-focus-btn ${leftOpen ? "active" : ""}`}
        title={leftOpen ? "Hide courses and topic list" : "Show courses and topic list"}
        onClick={toggleLeft}
      >
        {leftOpen ? <PanelLeftClose size={15} aria-hidden /> : <PanelLeft size={15} aria-hidden />}
        <span>{leftOpen ? "Hide left" : "Show left"}</span>
      </button>
      <button
        type="button"
        className={`learning-focus-btn learning-focus-btn-primary ${contentFocused ? "active" : ""}`}
        title="Full-width lesson content"
        onClick={focusContent}
      >
        <Focus size={15} aria-hidden />
        <span>Focus content</span>
      </button>
      <button
        type="button"
        className={`learning-focus-btn ${rightOpen ? "active" : ""}`}
        title={rightOpen ? "Hide mentor panel" : "Show mentor panel"}
        onClick={toggleRight}
      >
        {rightOpen ? <PanelRightClose size={15} aria-hidden /> : <PanelRight size={15} aria-hidden />}
        <span>{rightOpen ? "Hide right" : "Show right"}</span>
      </button>
      <button type="button" className="learning-focus-btn" title="Reset panel layout" onClick={expandAll}>
        <RotateCcw size={14} aria-hidden />
        <span className="learning-focus-btn-sr">Reset</span>
      </button>
    </div>
  );
}
