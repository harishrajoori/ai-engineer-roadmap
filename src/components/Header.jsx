import React from "react";
import { Flame, Settings, Download, Sun, Moon, LogIn, LogOut, CheckCircle2 } from "lucide-react";

export default function Header({
  progressPct,
  completedCount,
  totalCount,
  streakDays = 5,
  theme = "dark",
  onToggleTheme,
  userProfile,
  onGoogleLogin,
  onGoogleLogout,
  onOpenSettings,
  onExportBackup
}) {
  return (
    <header>
      <a href="#" className="brand">
        <div className="brand-logo">AI</div>
        <div className="brand-text">
          <div className="brand-title">AI System Engineer Hub</div>
          <div className="brand-subtitle">Staff / Principal Engineering Mastery</div>
        </div>
      </a>

      <div className="stats-bar">
        {/* Streak Pill */}
        <div className="stat-pill" title="Daily study streak">
          <Flame size={14} color="#f59e0b" />
          <span>Streak:</span>
          <span className="value">{streakDays}d</span>
        </div>

        {/* Progress Pill */}
        <div className="stat-pill">
          <span>Progress:</span>
          <span className="value">{progressPct}%</span>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        {/* Completed Count Pill */}
        <div className="stat-pill">
          <span>Completed:</span>
          <span className="value">{completedCount} / {totalCount}</span>
        </div>

        {/* Light / Dark Theme Switcher */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* Google Authentication / Profile */}
        {userProfile ? (
          <div className="user-profile-btn" title={`Signed in as ${userProfile.email}`}>
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                style={{ width: 22, height: 22, borderRadius: "50%" }}
              />
            ) : (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700
                }}
              >
                {userProfile.name?.charAt(0) || "G"}
              </div>
            )}
            <span style={{ fontWeight: 600 }}>{userProfile.name?.split(" ")[0] || "User"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGoogleLogout();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: "0 2px"
              }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            className="filter-btn"
            onClick={onGoogleLogin}
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)"
            }}
            title="Sign in with your Google Account"
          >
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google Login</span>
          </button>
        )}

        {/* Backup Button */}
        <button
          className="filter-btn"
          onClick={onExportBackup}
          title="Export / Import Backup"
        >
          <Download size={13} />
          <span>Backup</span>
        </button>

        {/* Settings Button */}
        <button
          className="filter-btn"
          onClick={onOpenSettings}
          title="API Keys, Model & Hub Configuration"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
