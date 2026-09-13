import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen, ExternalLink, ListChecks } from "lucide-react";
import { buildCourseTopicOutline, formatTopicTitle } from "../utils/syllabusDisplay";
import CourseEnrichmentPanels from "./CourseEnrichmentPanels";

export default function CourseStage({
  course,
  courseRef,
  onSelectLesson,
  programPrimerMarkdown = "",
  glossary = [],
}) {
  const outline = useMemo(() => buildCourseTopicOutline(course?.lessons || []), [course]);

  if (!course) {
    return null;
  }

  const ref = courseRef || {};
  const outcomes = ref.outcomes || [];
  const summaryMd = ref.summary_markdown || "";

  return (
    <div className="learning-stage course-overview-stage">
      <div className="learning-stage-breadcrumb">
        <span className="learning-stage-course">Course {course.course}</span>
        <span className="learning-stage-sep">/</span>
        <span className="learning-stage-topic">Overview</span>
      </div>

      <div className="learning-stage-hero">
        <div className="learning-stage-hero-text">
          <div className="learning-stage-meta">
            <span className="badge badge-Read">Course map</span>
            {ref.duration && <span className="learning-stage-effort">{ref.duration}</span>}
            {course.month && <span className="learning-stage-month">{course.month}</span>}
          </div>
          <h1 className="learning-stage-title">{ref.name || course.title}</h1>
          {ref.assignment && (
            <p className="course-overview-assignment">
              <ListChecks size={16} />
              <span>
                <strong>Prove gate:</strong> {ref.assignment}
              </span>
            </p>
          )}
        </div>
      </div>

      <CourseEnrichmentPanels
        courseNum={course.course}
        programPrimerMarkdown={programPrimerMarkdown}
        glossary={glossary}
        courseRef={ref}
      />

      {outcomes.length > 0 && (
        <section className="course-overview-block">
          <h2>
            <BookOpen size={18} />
            What you will learn
          </h2>
          <ul className="course-overview-list">
            {outcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      {summaryMd && (
        <section className="course-overview-block markdown-theory prose-learning">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryMd}</ReactMarkdown>
        </section>
      )}

      <section className="course-overview-block">
        <h2>Topics in this course</h2>
        <p className="course-overview-hint">
          Duplicate checklist lines that share the same URL are merged here. Select a topic for the full study guide,
          primary source, and alternate links.
        </p>
        {outline.map((group) => (
          <div key={group.label} className="course-overview-section">
            <h3>{group.label}</h3>
            <ul className="course-overview-topic-list">
              {group.items.map((lesson) => (
                <li key={lesson.order}>
                  <button type="button" className="course-overview-topic-btn" onClick={() => onSelectLesson(lesson.order)}>
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
    </div>
  );
}
