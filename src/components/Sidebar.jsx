import React from 'react';
import { Layers } from 'lucide-react';

export default function Sidebar({ 
  courses, 
  activeCourseNum, 
  onSelectCourse, 
  currentTier, 
  onSetTier, 
  progressMap 
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={13} />
          <span>Curriculum Modules</span>
        </div>
        <div className="filter-pills">
          {['all', 'P0', 'P1', 'P2'].map(tier => (
            <button
              key={tier}
              className={`filter-btn ${currentTier === tier ? 'active' : ''}`}
              onClick={() => onSetTier(tier)}
            >
              {tier === 'all' ? 'All' : tier === 'P0' ? 'P0 Boot' : tier === 'P1' ? 'P1 Core' : 'P2 Scale'}
            </button>
          ))}
        </div>
      </div>

      <div className="course-list">
        {courses.map(c => {
          if (currentTier !== 'all' && c.tier !== currentTier) return null;
          const total = c.lessons.length;
          const comp = c.lessons.filter(l => progressMap[l.order]).length;
          const isSelected = c.course === activeCourseNum;
          const pct = total > 0 ? Math.round((comp / total) * 100) : 0;

          return (
            <div
              key={c.course}
              className={`course-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCourse(c.course)}
            >
              <div className="course-header-row">
                <span className={`course-tag tag-${c.tier.toLowerCase()}`}>
                  {c.tier} • Course {c.course}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)' }}>
                  {comp}/{total}
                </span>
              </div>
              <div className="course-title">{c.title}</div>
              <div className="course-meta">
                <span>{c.month || 'Flexible'}</span>
                <span>{pct}% done</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
