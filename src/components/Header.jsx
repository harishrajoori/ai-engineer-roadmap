import React from 'react';
import { Flame, Sparkles, Settings, Download, Upload } from 'lucide-react';

export default function Header({ progressPct, completedCount, totalCount, streakDays = 5, onOpenSettings, onExportBackup }) {
  return (
    <header>
      <a href="#" className="brand">
        <div className="brand-logo">AI</div>
        <div className="brand-text">
          <span className="brand-title">AI System Engineer Hub</span>
          <span className="brand-subtitle">15-Month Staff Engineering Mastery</span>
        </div>
      </a>

      <div className="stats-bar">
        <div className="stat-pill" title="Daily consecutive study streak">
          <Flame size={14} color="#f59e0b" />
          <span>Streak:</span>
          <span className="value">{streakDays}d</span>
        </div>

        <div className="stat-pill">
          <span>Progress:</span>
          <span className="value">{progressPct}%</span>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        <div className="stat-pill">
          <span>Completed:</span>
          <span className="value">{completedCount} / {totalCount}</span>
        </div>

        <button 
          className="filter-btn" 
          onClick={onExportBackup}
          title="Backup all progress and notes"
        >
          <Download size={13} />
          <span>Backup</span>
        </button>

        <button 
          className="filter-btn" 
          onClick={onOpenSettings}
          title="API Keys & Model Settings"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
