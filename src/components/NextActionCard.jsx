import React from "react";
import { ArrowRight, Target } from "lucide-react";

/**
 * Persistent “what to do next” from progress + prove checklists.
 */
export default function NextActionCard({ action, onOpenLesson, onOpenCourse }) {
  if (!action) {
    return null;
  }

  const { lesson, courseId, courseTitle, kind, proveTitle, checklist } = action;
  const topicTitle = lesson?.lesson || "Topic";

  let headline = "Next topic";
  let detail = `Course ${courseId} · ${topicTitle}`;

  if (kind === "prove_course") {
    headline = "Prove gate in progress";
    detail = `Course ${courseId} — ${proveTitle || courseTitle}`;
    if (checklist?.total > 0) {
      detail += ` · Checklist ${checklist.done}/${checklist.total} required`;
    }
  } else if (kind === "complete") {
    headline = "All topics checked off";
    detail = "Review Prove dashboard and tighten portfolio artifacts.";
  }

  return (
    <section className="home-next-action" aria-labelledby="home-next-action-heading">
      <div className="home-next-action-inner">
        <div className="home-next-action-icon" aria-hidden>
          <Target size={22} />
        </div>
        <div className="home-next-action-body">
          <h2 id="home-next-action-heading">{headline}</h2>
          <p>{detail}</p>
          {kind !== "complete" && lesson && (
            <div className="home-next-action-buttons">
              <button type="button" className="home-cta home-cta-primary" onClick={() => onOpenLesson?.(lesson)}>
                Open topic
                <ArrowRight size={16} aria-hidden />
              </button>
              <button type="button" className="home-cta home-cta-secondary" onClick={() => onOpenCourse?.(courseId)}>
                Course overview
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
