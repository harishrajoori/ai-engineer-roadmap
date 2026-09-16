import React, { useMemo } from "react";
import { CheckCircle2, Circle, PlayCircle, BookOpen, PenTool, ShieldCheck, Filter } from "lucide-react";
import { groupLessonsBySection } from "../utils/sectionGroups";
import {
  filterSyllabusLessons,
  formatTopicTitle,
  isTopicComplete,
  lessonsForSyllabusDisplay,
} from "../utils/syllabusDisplay";
import { capstoneTrackBadge } from "../utils/capstoneTrack";
import NextActionCard from "./NextActionCard";

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
  onSetTypeFilter,
  requiredOnlyFilter = false,
  onSetRequiredOnlyFilter,
  courseOverviewMode = false,
  onOpenCourseOverview,
  entryLessonOrder = null,
  nextAction = null,
  onOpenLessonFromNextAction = null,
}) {
  const displayLessons = useMemo(() => lessonsForSyllabusDisplay(lessons), [lessons]);

  const typeOptions = useMemo(() => {
    const types = new Set(displayLessons.map((l) => l.type));
    return ["all", ...Array.from(types).sort()];
  }, [displayLessons]);

  const filteredLessons = useMemo(
    () => filterSyllabusLessons(displayLessons, { requiredOnly: requiredOnlyFilter, typeFilter }),
    [displayLessons, requiredOnlyFilter, typeFilter]
  );

  const optionalHiddenCount = useMemo(() => {
    if (!requiredOnlyFilter) {
      return 0;
    }
    return displayLessons.filter((l) => l.required !== "Yes").length;
  }, [displayLessons, requiredOnlyFilter]);

  const sectionGroups = useMemo(() => groupLessonsBySection(filteredLessons), [filteredLessons]);

  const completedInView = filteredLessons.filter((l) => isTopicComplete(progressMap, l)).length;

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

  const handleToggleComplete = (e, lesson) => {
    e.stopPropagation();
    onToggleComplete?.(lesson);
  };

  return (
    <div className="syllabus-pane">
      <div className="syllabus-pane-header">
        <div className="syllabus-pane-title-row">
          <h2 className="syllabus-course-title">{courseTitle}</h2>
          {courseMonth && <span className="syllabus-course-month">{courseMonth}</span>}
        </div>
        {onOpenCourseOverview && (
          <button
            type="button"
            className={`syllabus-course-map-btn ${courseOverviewMode ? "active" : ""}`}
            onClick={onOpenCourseOverview}
          >
            How to take this course (walkthrough)
          </button>
        )}
        <div
          className="syllabus-progress-block"
          title="Includes required Prove checklist items when this course has a prove gate"
        >
          <div className="syllabus-progress-track">
            <div className="syllabus-progress-fill" style={{ width: `${courseProgressPct}%` }} />
          </div>
          <div className="syllabus-progress-meta">
            <span>{courseProgressPct}% complete</span>
            <span>{completedInView}/{filteredLessons.length} topics</span>
          </div>
        </div>
      </div>

      {nextAction && onOpenLessonFromNextAction && (
        <NextActionCard
          compact
          action={nextAction}
          onOpenLesson={onOpenLessonFromNextAction}
        />
      )}

      {(onSetRequiredOnlyFilter || (typeOptions.length > 2 && onSetTypeFilter)) && (
        <div className="syllabus-filters">
          <Filter size={12} className="syllabus-filter-icon" aria-hidden />
          {onSetRequiredOnlyFilter && (
            <button
              type="button"
              className={`filter-btn syllabus-filter-btn syllabus-filter-required ${requiredOnlyFilter ? "active" : ""}`}
              onClick={() => onSetRequiredOnlyFilter(!requiredOnlyFilter)}
              title="Hide optional Watch/Read rows—recommended when time-boxed"
              aria-pressed={requiredOnlyFilter}
            >
              Required only
            </button>
          )}
          {typeOptions.length > 2 &&
            onSetTypeFilter &&
            typeOptions.map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-btn syllabus-filter-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => onSetTypeFilter(t)}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          {optionalHiddenCount > 0 && (
            <span className="syllabus-filter-hint">{optionalHiddenCount} optional hidden</span>
          )}
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
                const isCompleted = isTopicComplete(progressMap, lesson);
                const isActive = !courseOverviewMode && activeLessonOrder === lesson.order;
                const isStartHere =
                  lesson.is_start_here || (entryLessonOrder != null && lesson.order === entryLessonOrder);
                const trackMeta = capstoneTrackBadge(lesson.capstone_track);

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
                    onClick={(e) => handleToggleComplete(e, lesson)}
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="syllabus-check-done" />
                    ) : (
                      <Circle size={18} className="syllabus-check-open" />
                    )}
                  </button>
                    <div className="syllabus-topic-body">
                      <div className="syllabus-topic-name">
                        {isStartHere && <span className="topic-start-badge syllabus-start-badge">START</span>}
                        {trackMeta && (
                          <span
                            className={`capstone-track-pill capstone-track-pill-compact ${trackMeta.className}`}
                            title={trackMeta.title}
                          >
                            {trackMeta.label}
                          </span>
                        )}
                        {lesson.display_title || formatTopicTitle(lesson)}
                      </div>
                    <div className="syllabus-topic-meta">
                      {getIcon(lesson.type)}
                      <span>#{lesson.order}</span>
                      <span className="syllabus-topic-dot">·</span>
                      <span>{lesson.section_label || lesson.section}</span>
                      {(lesson.coverage_note || lesson.merge_note) && (
                        <span className="syllabus-shared" title="Shared or merged URL">↗ shared</span>
                      )}
                      {lesson.required === "Yes" ? (
                        <span className="syllabus-required">Required</span>
                      ) : (
                        <span className="syllabus-optional">Optional</span>
                      )}
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
