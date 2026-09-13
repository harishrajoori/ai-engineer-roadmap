import React from "react";
import { Check, Video, BookOpen, Terminal, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";

export default function LessonFeed({
  courseTitle,
  lessons = [],
  activeLessonOrder,
  onSelectLesson,
  onToggleComplete,
  progressMap = {},
  typeFilter = "all",
  onSetTypeFilter
}) {
  // Categorize lessons into topic clusters
  const categories = [
    {
      id: "foundations",
      title: "Core Foundations & Visual Architecture",
      icon: <Video size={14} color="#fb7185" />,
      filter: (l) => l.type === "Video"
    },
    {
      id: "implementation",
      title: "Hands-on Code & Engineering Sprints",
      icon: <Terminal size={14} color="#fbbf24" />,
      filter: (l) => l.type === "Build" || l.lesson.toLowerCase().includes("scratch") || l.lesson.toLowerCase().includes("repo")
    },
    {
      id: "production",
      title: "Production Patterns, Invariants & System Evals",
      icon: <BookOpen size={14} color="#60a5fa" />,
      filter: (l) => l.type === "Read" && !l.lesson.toLowerCase().includes("scratch") && !l.lesson.toLowerCase().includes("repo")
    },
    {
      id: "prove",
      title: "Staff Milestone Verification Gates",
      icon: <ShieldCheck size={14} color="#34d399" />,
      filter: (l) => l.type === "Prove"
    }
  ];

  // If typeFilter is not "all", we just display filtered lessons flat
  const isFiltered = typeFilter !== "all";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Feed Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)" }}>{courseTitle}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Topic breakdown with dedicated lectures, executive briefs, and production code.
          </span>
        </div>

        {/* Type Filter Pills */}
        <div className="filter-pills">
          {["all", "Video", "Read", "Build", "Prove"].map((t) => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? "active" : ""}`}
              onClick={() => onSetTypeFilter(t)}
            >
              {t === "all" ? "All Topics" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Render Categorized or Filtered Topic Groups */}
      {isFiltered ? (
        <div className="lesson-feed">
          {lessons
            .filter((l) => l.type === typeFilter)
            .map((l) => renderLessonRow(l, activeLessonOrder, onSelectLesson, onToggleComplete, progressMap))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {categories.map((cat) => {
            const catLessons = lessons.filter(cat.filter);
            if (catLessons.length === 0) return null;

            const completedInCat = catLessons.filter((l) => progressMap[l.order]).length;

            return (
              <div key={cat.id} className="topic-group-block">
                <div className="topic-group-header">
                  <div className="topic-group-title">
                    {cat.icon}
                    <span>{cat.title}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {completedInCat} / {catLessons.length} Completed
                  </span>
                </div>

                <div className="lesson-feed">
                  {catLessons.map((l) =>
                    renderLessonRow(l, activeLessonOrder, onSelectLesson, onToggleComplete, progressMap)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderLessonRow(l, activeLessonOrder, onSelectLesson, onToggleComplete, progressMap) {
  const isDone = !!progressMap[l.order];
  const isSelected = l.order === activeLessonOrder;

  return (
    <div
      key={l.order}
      className={`lesson-row ${isSelected ? "active" : ""}`}
      onClick={() => onSelectLesson(l.order)}
    >
      <div className="lesson-left">
        <div
          className={`lesson-checkbox ${isDone ? "completed" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(l.order);
          }}
          title={isDone ? "Mark incomplete" : "Mark completed"}
        >
          {isDone && <Check size={13} strokeWidth={3} />}
        </div>

        <div className="lesson-info">
          <div
            className="lesson-name"
            style={isDone ? { textDecoration: "line-through", color: "var(--muted)" } : {}}
          >
            {l.lesson}
          </div>
          <div className="lesson-sub">
            <span className={`badge badge-${l.type || "Do"}`}>{l.type}</span>
            <span>• {l.duration || "Flexible"}</span>
            <span>• {l.open_how || "Browser"}</span>
            {l.required === "Yes" && (
              <span style={{ color: "var(--warning)", fontWeight: 700 }}>• Required</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: "0.85rem" }}>
        {isDone ? "✅" : "⏳"}
      </div>
    </div>
  );
}
