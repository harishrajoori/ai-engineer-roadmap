import React from "react";
import { ArrowRight, Target } from "lucide-react";

/**
 * Persistent “what to do next” from progress + prove checklists.
 */
export default function NextActionCard({ action, onOpenLesson, onOpenCourse, compact = false }) {
  if (!action) {
    return null;
  }

  const { lesson, courseId, courseTitle, kind, proveTitle, checklist } = action;
  const topicTitle = lesson?.lesson || "Topic";

  let headline = "Next topic";
  let detail = `Course ${courseId} · ${topicTitle}`;

  if (kind === "prove_course") {
    headline = "Finish Prove gate";
    detail = `Course ${courseId} — ${proveTitle || courseTitle}. Open the Prove topic → Lab & Prove tab.`;
    if (checklist?.total > 0) {
      detail += ` Checklist ${checklist.done}/${checklist.total} required.`;
    }
  } else if (kind === "complete") {
    headline = "All topics checked off";
    detail = "Review Prove dashboard and tighten portfolio artifacts.";
  }

  const headingId = compact ? "syllabus-next-action-heading" : "home-next-action-heading";

  return (
    <section
      className={compact ? "syllabus-next-action" : "home-next-action"}
      aria-labelledby={headingId}
    >
      <div className="home-next-action-inner">
        <div className="home-next-action-icon" aria-hidden>
          <Target size={compact ? 18 : 22} />
        </div>
        <div className="home-next-action-body">
          <h2 id={headingId} className={compact ? "syllabus-next-action-title" : undefined}>{headline}</h2>
          <p>{detail}</p>
          {kind !== "complete" && lesson && (
            <div className="home-next-action-buttons">
              <button
                type="button"
                className={compact ? "syllabus-next-action-btn" : "home-cta home-cta-primary"}
                onClick={() => onOpenLesson?.(lesson)}
              >
                {kind === "prove_course" ? "Open Prove topic" : "Open topic"}
                <ArrowRight size={16} aria-hidden />
              </button>
              {!compact && (
                <button type="button" className="home-cta home-cta-secondary" onClick={() => onOpenCourse?.(courseId)}>
                  Course overview
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
