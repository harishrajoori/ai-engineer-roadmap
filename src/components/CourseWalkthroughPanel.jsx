import React from "react";
import { ArrowRight, Compass, ListOrdered } from "lucide-react";

/**
 * Plain-language guide for one course — where to start and how to finish.
 */
export default function CourseWalkthroughPanel({
  walkthrough,
  entryLessonOrder,
  onStartHere,
  embedded = false,
}) {
  if (!walkthrough?.plain_title) {
    return null;
  }

  return (
    <section
      className={`course-walkthrough-panel ${embedded ? "course-walkthrough-panel-embedded" : ""}`}
      aria-labelledby={embedded ? undefined : "course-walkthrough-heading"}
    >
      {!embedded && (
        <h2 id="course-walkthrough-heading">
          <Compass size={20} aria-hidden />
          How to take this course
        </h2>
      )}
      <p className="course-walkthrough-lead">{walkthrough.in_plain_english}</p>

      {walkthrough.theory_first_steps?.length > 0 && (
        <div className="course-walkthrough-card course-walkthrough-theory-first">
          <h3>Theory before lecture (every topic)</h3>
          <ol className="course-walkthrough-theory-steps">
            {walkthrough.theory_first_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {walkthrough.model_fundamentals_note && (
            <p className="course-walkthrough-model-note">{walkthrough.model_fundamentals_note}</p>
          )}
        </div>
      )}

      {walkthrough.learning_objectives?.length > 0 && (
        <div className="course-walkthrough-card course-walkthrough-objectives-card">
          <h3>By the end you can</h3>
          <ul className="course-walkthrough-objectives">
            {walkthrough.learning_objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="course-walkthrough-grid">
        <div className="course-walkthrough-card course-walkthrough-start">
          <h3>Start here</h3>
          <p>{walkthrough.start_here_label}</p>
          {entryLessonOrder != null && onStartHere && (
            <button type="button" className="home-cta home-cta-primary course-start-btn" onClick={onStartHere}>
              Open first topic
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="course-walkthrough-card">
          <h3>
            <ListOrdered size={16} aria-hidden />
            Topic order
          </h3>
          <p>{walkthrough.topic_order}</p>
        </div>
        <div className="course-walkthrough-card">
          <h3>End of course</h3>
          <p>{walkthrough.end_of_course}</p>
        </div>
      </div>

      {walkthrough.do_not_worry_about && (
        <p className="course-walkthrough-reassure">
          <strong>You can ignore for now:</strong> {walkthrough.do_not_worry_about}
        </p>
      )}
    </section>
  );
}
