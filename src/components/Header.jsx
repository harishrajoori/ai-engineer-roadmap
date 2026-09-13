import React from "react";
import { Flame, Settings, Download, Sun, Moon, LogOut } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";

export default function Header({
  progressPct,
  completedCount,
  totalCount,
  streakDays = 0,
  theme = "dark",
  onToggleTheme,
  userProfile,
  onGoogleLogin,
  onGoogleLogout,
  googleOAuthEnabled = false,
  onOpenSettings,
  onExportBackup,
  onGoHome,
}) {
  const handleBrandClick = (e) => {
    e.preventDefault();
    onGoHome?.();
  };

  return (
    <header>
      <a href="/" className="brand" onClick={handleBrandClick}>
        <div className="brand-logo">AI</div>
        <div className="brand-text">
          <div className="brand-title">AI Systems Engineer Studio</div>
          <div className="brand-subtitle">Step-by-step · Theory before lecture</div>
        </div>
      </a>

      <div className="stats-bar">
        <div className="stat-pill" title="Daily study streak">
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
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>

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
              type="button"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="google-signin-header" style={{ minWidth: googleOAuthEnabled ? 180 : undefined }}>
            <GoogleSignInButton enabled={googleOAuthEnabled} onSuccess={onGoogleLogin} />
          </div>
        )}

        <button type="button" className="filter-btn" onClick={onExportBackup} title="Export / Import Backup">
          <Download size={13} />
          <span>Backup</span>
        </button>

        <button type="button" className="filter-btn" onClick={onOpenSettings} title="API keys, model, and studio settings">
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
