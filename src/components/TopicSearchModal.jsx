import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchLessons } from "../utils/topicSearch";
import { formatTopicTitle } from "../utils/syllabusDisplay";

export default function TopicSearchModal({
  isOpen,
  onClose,
  lessons = [],
  coursesRef = {},
  onSelectLesson,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const results = useMemo(
    () => searchLessons(lessons, query, { coursesRef }),
    [lessons, query, coursesRef]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="topic-search-backdrop" role="presentation" onClick={onClose}>
      <div
        className="topic-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search topics"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="topic-search-header">
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            className="topic-search-input"
            placeholder="Search topics, resources, prove criteria…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="button" className="topic-search-close" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </button>
        </div>
        <ul className="topic-search-results">
          {query.trim().length < 2 && (
            <li className="topic-search-hint">Type at least 2 characters</li>
          )}
          {query.trim().length >= 2 && results.length === 0 && (
            <li className="topic-search-hint">No matches</li>
          )}
          {results.map((lesson) => (
            <li key={lesson.order}>
              <button
                type="button"
                className="topic-search-result-btn"
                onClick={() => {
                  onSelectLesson?.(lesson);
                  onClose?.();
                }}
              >
                <span className="topic-search-result-title">{formatTopicTitle(lesson)}</span>
                <span className="topic-search-result-meta">
                  Course {lesson.course} · #{lesson.order} · {lesson.type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
