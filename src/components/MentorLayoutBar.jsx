import React from "react";
import {
  PanelLeft,
  PanelLeftClose,
  PanelRightClose,
  BookOpen,
  BookOpenCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { clamp, defaultLearningLayout } from "../utils/learningLayout";

/**
 * Collapse/expand curriculum rail, theory stage, and mentor width for chat focus.
 */
export default function MentorLayoutBar({ layout, onLayoutChange }) {
  const set = (patch) => onLayoutChange({ ...layout, ...patch });

  return (
    <div className="mentor-layout-bar" role="toolbar" aria-label="Workspace layout">
      <span className="mentor-layout-label">View</span>
      <button
        type="button"
        className={`filter-btn mentor-layout-btn ${layout.curriculumOpen ? "active" : ""}`}
        title={layout.curriculumOpen ? "Hide courses & syllabus" : "Show courses & syllabus"}
        onClick={() => set({ curriculumOpen: !layout.curriculumOpen })}
      >
        {layout.curriculumOpen ? <PanelLeftClose size={13} /> : <PanelLeft size={13} />}
        <span>{layout.curriculumOpen ? "Hide curriculum" : "Show curriculum"}</span>
      </button>
      <button
        type="button"
        className={`filter-btn mentor-layout-btn ${layout.stageOpen ? "active" : ""}`}
        title={layout.stageOpen ? "Hide theory & lecture panel" : "Show theory & lecture panel"}
        onClick={() => set({ stageOpen: !layout.stageOpen })}
      >
        {layout.stageOpen ? <BookOpenCheck size={13} /> : <BookOpen size={13} />}
        <span>{layout.stageOpen ? "Hide theory" : "Show theory"}</span>
      </button>
      <button
        type="button"
        className={`filter-btn mentor-layout-btn ${layout.mentorOpen === false ? "" : "active"}`}
        title={layout.mentorOpen === false ? "Show mentor panel" : "Hide mentor panel"}
        onClick={() => set({ mentorOpen: layout.mentorOpen === false })}
      >
        <PanelRightClose size={13} />
        <span>{layout.mentorOpen === false ? "Show mentor" : "Hide mentor"}</span>
      </button>
      <button
        type="button"
        className={`filter-btn mentor-layout-btn ${layout.mentorExpanded ? "active" : ""}`}
        title={layout.mentorExpanded ? "Normal mentor width" : "Widen mentor chat"}
        onClick={() =>
          set({
            mentorExpanded: !layout.mentorExpanded,
            mentorWidth: layout.mentorExpanded ? 360 : clamp(520, 300, 960),
          })
        }
      >
        {layout.mentorExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        <span>{layout.mentorExpanded ? "Narrow chat" : "Widen chat"}</span>
      </button>
      <button
        type="button"
        className="filter-btn mentor-layout-btn"
        title="Maximize mentor: hide curriculum rails"
        onClick={() =>
          set({
            curriculumOpen: false,
            stageOpen: false,
            mentorOpen: true,
            mentorExpanded: true,
            mentorWidth: 720,
          })
        }
      >
        <Maximize2 size={13} />
        <span>Chat focus</span>
      </button>
      <button
        type="button"
        className="filter-btn mentor-layout-btn"
        title="Reset all panels"
        onClick={() => onLayoutChange(defaultLearningLayout())}
      >
        Reset layout
      </button>
      <p className="mentor-layout-drag-hint">Drag the vertical grip on the <strong>left edge of this chat column</strong> to resize.</p>
    </div>
  );
}
