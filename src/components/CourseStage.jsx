import React, { useMemo } from "react";

import MarkdownProse from "./MarkdownProse";
import { BookOpen, ExternalLink, ListChecks } from "lucide-react";
import { buildCourseTopicOutline, formatTopicTitle } from "../utils/syllabusDisplay";
import CourseEnrichmentPanels from "./CourseEnrichmentPanels";
import CourseWalkthroughPanel from "./CourseWalkthroughPanel";
import LearningFocusBar from "./LearningFocusBar";

export default function CourseStage({
  course,
  courseRef,
  onSelectLesson,
  programPrimerMarkdown = "",
  glossary = [],
  learningLayout = null,
  onLearningLayoutChange = null,
  isWideDesktop = false,
  mobilePanel = null,
  onMobilePanelChange = null,
}) {
  const outline = useMemo(() => buildCourseTopicOutline(course?.lessons || []), [course]);

  if (!course) {
    return null;
  }

  const ref = courseRef || {};
  const outcomes = ref.outcomes || [];
  const summaryMd = ref.summary_markdown || "";
  const entryOrder = ref.entry_lesson_order;

  const handleStartHere = () => {
    if (entryOrder != null) {
      onSelectLesson(entryOrder);
    }
  };

  return (
    <div className="learning-stage course-overview-stage">
      <div className="learning-stage-breadcrumb">
        <span className="learning-stage-course">Course {course.course}</span>
        <span className="learning-stage-sep">/</span>
        <span className="learning-stage-topic">Overview &amp; walkthrough</span>
      </div>

      <LearningFocusBar
        layout={learningLayout}
        onLayoutChange={onLearningLayoutChange}
        isWideDesktop={isWideDesktop}
        mobilePanel={mobilePanel}
        onMobilePanelChange={onMobilePanelChange}
      />

      <div className="learning-stage-hero">
        <div className="learning-stage-hero-text">
          <div className="learning-stage-meta">
            <span className="badge badge-Read">Course map</span>
            {ref.duration && <span className="learning-stage-effort">{ref.duration}</span>}
            {course.month && <span className="learning-stage-month">{course.month}</span>}
          </div>
          <h1 className="learning-stage-title">{ref.walkthrough?.plain_title || ref.name || course.title}</h1>
          {ref.assignment && (
            <p className="course-overview-assignment">
              <ListChecks size={16} />
              <span>
                <strong>End-of-course goal:</strong> {ref.assignment}
              </span>
            </p>
          )}
        </div>
      </div>

      <CourseWalkthroughPanel
        walkthrough={ref.walkthrough}
        entryLessonOrder={entryOrder}
        onStartHere={handleStartHere}
      />

      <section className="course-overview-block course-overview-topics-first">
        <h2>Topics — do these in order</h2>
        <p className="course-overview-hint">
          The topic marked START HERE is your entry point. On each topic: Theory (Foundations) → Lecture → Lab when
          needed.
        </p>
        {outline.map((group) => (
          <div key={group.label} className="course-overview-section">
            <h3>{group.label}</h3>
            <ul className="course-overview-topic-list">
              {group.items.map((lesson) => (
                <li key={lesson.order}>
                  <button type="button" className="course-overview-topic-btn" onClick={() => onSelectLesson(lesson.order)}>
                    {lesson.is_start_here && <span className="topic-start-badge">START HERE</span>}
                    <span className="course-overview-topic-title">{formatTopicTitle(lesson)}</span>
                    {lesson.url?.startsWith("http") && (
                      <ExternalLink size={12} className="course-overview-topic-ext" aria-hidden />
                    )}
                  </button>
                  {lesson.merge_note && <span className="course-overview-merge-note">{lesson.merge_note}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {outcomes.length > 0 && (
        <section className="course-overview-block">
          <h2>
            <BookOpen size={18} />
            Skills you will have by the end
          </h2>
          <ul className="course-overview-list">
            {outcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      <CourseEnrichmentPanels
        courseNum={course.course}
        programPrimerMarkdown={programPrimerMarkdown}
        glossary={glossary}
        courseRef={ref}
      />

      {summaryMd && (
        <details className="course-overview-block course-syllabus-details">
          <summary>Full syllabus checklist (optional)</summary>
          <MarkdownProse variant="primer">{summaryMd}</MarkdownProse>
        </details>
      )}
    </div>
  );
}
