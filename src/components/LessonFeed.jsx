import React from 'react';
import { Check, Clock, PlayCircle, BookOpen, Terminal, ShieldCheck } from 'lucide-react';

export default function LessonFeed({
  courseTitle,
  lessons,
  activeLessonOrder,
  onSelectLesson,
  onToggleComplete,
  progressMap,
  typeFilter,
  onSetTypeFilter
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{courseTitle}</h3>
        <div className="filter-pills">
          {['all', 'Video', 'Read', 'Build', 'Prove'].map(t => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
              onClick={() => onSetTypeFilter(t)}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-feed">
        {lessons.map(l => {
          if (typeFilter !== 'all' && l.type !== typeFilter) return null;
          const isDone = !!progressMap[l.order];
          const isSelected = l.order === activeLessonOrder;

          return (
            <div
              key={l.order}
              className={`lesson-row ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectLesson(l.order)}
            >
              <div className="lesson-left">
                <div
                  className={`lesson-checkbox ${isDone ? 'completed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(l.order);
                  }}
                  title={isDone ? 'Mark incomplete' : 'Mark completed'}
                >
                  {isDone && <Check size={13} strokeWidth={3} />}
                </div>

                <div className="lesson-info">
                  <div
                    className="lesson-name"
                    style={isDone ? { textDecoration: 'line-through', color: 'var(--muted)' } : {}}
                  >
                    {l.lesson}
                  </div>
                  <div className="lesson-sub">
                    <span className={`badge badge-${l.type || 'Do'}`}>{l.type}</span>
                    <span>• {l.duration || 'Flexible'}</span>
                    <span>• {l.open_how || 'Browser'}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                {isDone ? '✅' : '⏳'}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
