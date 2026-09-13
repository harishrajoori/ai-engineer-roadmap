import React, { useMemo } from "react";
import { CheckCircle2, Circle, PlayCircle, BookOpen, PenTool, ShieldCheck, Filter } from "lucide-react";

export default function LessonFeed({
  courseTitle,
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

  const getIcon = (type) => {
    if (type === "Video") {
      return <PlayCircle size={14} className="topic-icon text-blue-400" />;
    }
    if (type === "Read") {
      return <BookOpen size={14} className="topic-icon text-purple-400" />;
    }
    if (type === "Build") {
      return <PenTool size={14} className="topic-icon text-amber-400" />;
    }
    if (type === "Prove") {
      return <ShieldCheck size={14} className="topic-icon text-emerald-400" />;
    }
    return <Circle size={14} className="topic-icon text-slate-400" />;
  };

  const handleToggleComplete = (e, order) => {
    e.stopPropagation();
    onToggleComplete?.(order);
  };

  return (
    <div className="coursera-sidebar lesson-feed-pane">
      <div className="lesson-feed-header" style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))" }}>
        <h3 className="text-sm font-bold text-slate-200 leading-snug">{courseTitle}</h3>
        <p className="text-xs text-slate-500 mt-1">{filteredLessons.length} topics</p>
      </div>

      {typeOptions.length > 2 && onSetTypeFilter && (
        <div className="lesson-feed-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", padding: "0.5rem 0.75rem" }}>
          <Filter size={12} className="text-slate-500" style={{ alignSelf: "center" }} />
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-btn text-xs ${typeFilter === t ? "active" : ""}`}
              onClick={() => onSetTypeFilter(t)}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      )}

      <div className="course-topics-list">
        {filteredLessons.map((lesson) => {
          const isCompleted = !!progressMap[lesson.order];
          const isActive = activeLessonOrder === lesson.order;

          return (
            <div
              key={lesson.order}
              onClick={() => onSelectLesson(lesson.order)}
              className={`topic-item ${isActive ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectLesson(lesson.order);
                }
              }}
            >
              <button
                type="button"
                className="topic-status topic-status-btn"
                onClick={(e) => handleToggleComplete(e, lesson.order)}
                aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-slate-500" />
                )}
              </button>
              <div className="topic-info">
                <div className="topic-name">{lesson.lesson}</div>
                <div className="topic-meta">
                  {getIcon(lesson.type)}
                  <span className="topic-type">{lesson.type}</span>
                  <span className="topic-duration">• {lesson.duration || "15m"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
