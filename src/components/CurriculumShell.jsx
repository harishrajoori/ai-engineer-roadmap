import React from "react";
import { BookOpen, RefreshCw } from "lucide-react";

export function CurriculumLoading() {
  return (
    <div className="curriculum-loading">
      <div className="curriculum-loading-card">
        <BookOpen size={32} className="curriculum-loading-icon" />
        <h1>Loading your curriculum</h1>
        <p>Fetching lessons and course map…</p>
        <div className="curriculum-loading-bar">
          <div className="curriculum-loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}

export function CurriculumError({ message, onRetry }) {
  return (
    <div className="curriculum-loading">
      <div className="curriculum-loading-card error">
        <h1>Could not load curriculum</h1>
        <p>{message}</p>
        <button type="button" className="stage-action-btn primary" onClick={onRetry}>
          <RefreshCw size={16} />
          Retry
        </button>
        <p className="curriculum-loading-hint">Run <code>npm run curriculum</code> then refresh.</p>
      </div>
    </div>
  );
}
