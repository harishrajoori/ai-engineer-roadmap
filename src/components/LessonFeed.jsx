import React, { useMemo } from "react";
import { CheckCircle2, Circle, PlayCircle, BookOpen, PenTool, ShieldCheck, Filter } from "lucide-react";
import { groupLessonsBySection } from "../utils/sectionGroups";

export default function LessonFeed({
  courseTitle,
  courseMonth,
  courseProgressPct = 0,
  lessons,
  activeLessonOrder,
  onSelectLesson,
  onToggleComplete,
  progressMap = {},
  typeFilter = "all",
  onSetTypeFilter
}) {
  const typeOptions = useMemo(() => {
    const types = new Set(lessons.map((l) => l.type));
    return ["all", ...Array.from(types).sort()];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (typeFilter === "all") {
      return lessons;
    }
    return lessons.filter((l) => l.type === typeFilter);
  }, [lessons, typeFilter]);

  const sectionGroups = useMemo(() => groupLessonsBySection(filteredLessons), [filteredLessons]);

  const completedInView = filteredLessons.filter((l) => progressMap[l.order]).length;

  const getIcon = (type) => {
    if (type === "Video") {
      return <PlayCircle size={14} className="topic-icon topic-icon-video" />;
    }
    if (type === "Read") {
      return <BookOpen size={14} className="topic-icon topic-icon-read" />;
    }
    if (type === "Build") {
      return <PenTool size={14} className="topic-icon topic-icon-build" />;
    }
    if (type === "Prove") {
      return <ShieldCheck size={14} className="topic-icon topic-icon-prove" />;
    }
    return <Circle size={14} className="topic-icon" />;
  };

  const handleToggleComplete = (e, order) => {
    e.stopPropagation();
    onToggleComplete?.(order);
  };

  return (
    <div className="syllabus-pane">
      <div className="syllabus-pane-header">
        <div className="syllabus-pane-title-row">
          <h2 className="syllabus-course-title">{courseTitle}</h2>
          {courseMonth && <span className="syllabus-course-month">{courseMonth}</span>}
        </div>
        <div className="syllabus-progress-block">
          <div className="syllabus-progress-track">
            <div className="syllabus-progress-fill" style={{ width: `${courseProgressPct}%` }} />
          </div>
          <div className="syllabus-progress-meta">
            <span>{courseProgressPct}% complete</span>
            <span>{completedInView}/{filteredLessons.length} topics</span>
          </div>
        </div>
      </div>

      {typeOptions.length > 2 && onSetTypeFilter && (
        <div className="syllabus-filters">
          <Filter size={12} className="syllabus-filter-icon" />
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-btn syllabus-filter-btn ${typeFilter === t ? "active" : ""}`}
              onClick={() => onSetTypeFilter(t)}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      )}

      <div className="syllabus-topic-list" role="list">
        {sectionGroups.reduce((acc, group) => {
          acc.nodes.push(
            <div key={group.id} className="syllabus-section-group">
              <div className="syllabus-section-heading">{group.label}</div>
              {group.lessons.map((lesson) => {
                acc.index += 1;
                const displayIndex = acc.index;
                const isCompleted = !!progressMap[lesson.order];
                const isActive = activeLessonOrder === lesson.order;

                return (
                  <div
                    key={lesson.order}
                    role="listitem"
                    onClick={() => onSelectLesson(lesson.order)}
                    className={`syllabus-topic ${isActive ? "active" : ""} ${isCompleted ? "done" : ""}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectLesson(lesson.order);
                      }
                    }}
                  >
                    <span className="syllabus-topic-index">{displayIndex}</span>
                  <button
                    type="button"
                    className="syllabus-topic-check"
                    onClick={(e) => handleToggleComplete(e, lesson.order)}
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="syllabus-check-done" />
                    ) : (
                      <Circle size={18} className="syllabus-check-open" />
                    )}
                  </button>
                  <div className="syllabus-topic-body">
                    <div className="syllabus-topic-name">{lesson.lesson}</div>
                    <div className="syllabus-topic-meta">
                      {getIcon(lesson.type)}
                      <span>{lesson.type}</span>
                      <span className="syllabus-topic-dot">·</span>
                      <span>{lesson.duration || "~15m"}</span>
                      {lesson.coverage_note && <span className="syllabus-shared" title="Shared URL">↗ shared</span>}
                      {lesson.required === "Yes" && <span className="syllabus-required">Required</span>}
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          );
          return acc;
        }, { index: 0, nodes: [] }).nodes}
      </div>
    </div>
  );
}
