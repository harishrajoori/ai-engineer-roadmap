import React, { useState, useEffect } from "react";
import {
  PlayCircle,
  BookOpen,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Edit3,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  Maximize2,
  Minimize2,
  Tv,
  Layers,
  Flame,
  Info
} from "lucide-react";

export default function SmartStage({
  lesson,
  isCompleted,
  onToggleComplete,
  videoOverrides = {},
  onSaveVideoOverride,
  onOpenRegenerateModal,
  regeneratedContent
}) {
  const [viewMode, setViewMode] = useState("auto"); // "auto" | "video" | "digest" | "code" | "ai"
  const [videoSize, setVideoSize] = useState("cinema"); // "compact" | "cinema" | "full"
  const [activeVideoId, setActiveVideoId] = useState("");
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setViewMode("auto");
    setIsEditingVideo(false);
    if (lesson) {
      const override = videoOverrides[lesson.order];
      setActiveVideoId(override || lesson.youtube_id || "zjkBMFhNj_g");
    }
  }, [lesson?.order, videoOverrides]);

  if (!lesson) {
    return (
      <div className="smart-stage-card">
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          Select a topic from the curriculum to begin studying.
        </div>
      </div>
    );
  }

  const ltype = lesson.type || "Read";
  const digest = lesson.digest || {
    title: lesson.lesson,
    takeaways: ["Understand the core data contracts and architectural tradeoffs."],
    rules: ["Rule 1: Always enforce strict Pydantic schemas for LLM outputs."],
    pitfalls: ["Avoid testing with subjective vibes instead of assertions."]
  };

  // Determine active view mode
  let currentView = viewMode;
  if (currentView === "auto") {
    currentView = ltype.toLowerCase();
  }

  // Multi-video resources
  const allResources = lesson.resources || [];
  const videoResources = allResources.filter(r => r.type === "video");
  const beginnerRes = allResources.find(r => r.level === "beginner");
  const intermediateRes = allResources.find(r => r.level === "intermediate");
  const advancedRes = allResources.find(r => r.level === "advanced");

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveVideoUrl = () => {
    if (!customVideoUrl) return;
    let vid = customVideoUrl;
    if (customVideoUrl.includes("v=")) {
      vid = customVideoUrl.split("v=")[1].split("&")[0];
    } else if (customVideoUrl.includes("youtu.be/")) {
      vid = customVideoUrl.split("youtu.be/")[1].split("?")[0];
    }
    onSaveVideoOverride(lesson.order, vid);
    setActiveVideoId(vid);
    setIsEditingVideo(false);
    setCustomVideoUrl("");
  };

  const extractYtId = (url) => {
    if (!url) return null;
    if (url.includes("v=")) return url.split("v=")[1].split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
    return null;
  };

  const handleSelectVideoResource = (res) => {
    const vid = extractYtId(res.url);
    if (vid) {
      setActiveVideoId(vid);
      setViewMode("video");
    } else if (res.url) {
      window.open(res.url, "_blank");
    }
  };

  return (
    <div className="smart-stage-card">
      {/* 1. TEXT FIRST: Architectural Overview & Topic Header */}
      <div className="topic-header-block">
        <div className="topic-meta-row">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className={`badge badge-${lesson.type || "Do"}`}>{lesson.type}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>• {lesson.duration || "Flexible"}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>• Course {lesson.course} ({lesson.month})</span>
            {lesson.required === "Yes" && (
              <span className="level-badge level-advanced" style={{ fontSize: "0.65rem" }}>⭐ Staff Core</span>
            )}
          </div>

          {/* Sizing & Mode Quick Switchers */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Sizing Controls */}
            <div className="video-size-controls">
              <button
                className={`filter-btn ${videoSize === "compact" ? "active" : ""}`}
                style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
                onClick={() => setVideoSize("compact")}
                title="Compact Width (480p standard reading layout)"
              >
                Compact
              </button>
              <button
                className={`filter-btn ${videoSize === "cinema" ? "active" : ""}`}
                style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
                onClick={() => setVideoSize("cinema")}
                title="Cinema 16:9 Standard"
              >
                Cinema
              </button>
              <button
                className={`filter-btn ${videoSize === "full" ? "active" : ""}`}
                style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
                onClick={() => setVideoSize("full")}
                title="Full Width Stage"
              >
                <Maximize2 size={11} />
                <span>Full</span>
              </button>
            </div>

            {/* AI Regenerate Button */}
            <button
              className="stage-launch-btn"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                fontSize: "0.74rem",
                padding: "0.35rem 0.75rem"
              }}
              onClick={onOpenRegenerateModal}
            >
              <Sparkles size={12} />
              <span>Regenerate with AI</span>
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <h1 className="topic-title">{lesson.lesson}</h1>

        {/* Level-Wise Quick Jump Resource Links */}
        <div className="level-pills-container">
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
            Quick Resources:
          </span>
          {beginnerRes && (
            <a
              href={beginnerRes.url}
              target="_blank"
              rel="noopener noreferrer"
              className="level-pill level-beginner"
              title={beginnerRes.description}
            >
              <span>🟢 Beginner: {beginnerRes.title.split(":")[0]}</span>
              <ExternalLink size={10} />
            </a>
          )}
          {intermediateRes && (
            <a
              href={intermediateRes.url}
              target="_blank"
              rel="noopener noreferrer"
              className="level-pill level-intermediate"
              title={intermediateRes.description}
            >
              <span>🟣 Intermediate: {intermediateRes.title.split(":")[0]}</span>
              <ExternalLink size={10} />
            </a>
          )}
          {advancedRes && (
            <a
              href={advancedRes.url}
              target="_blank"
              rel="noopener noreferrer"
              className="level-pill level-advanced"
              title={advancedRes.description}
            >
              <span>🔴 Advanced: {advancedRes.title.split(":")[0]}</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Text-First Architectural Summary Box */}
        <div className="topic-description-box">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "var(--cyan)", fontSize: "0.78rem", textTransform: "uppercase", marginBottom: "0.3rem" }}>
            <Info size={13} />
            <span>Topic Architectural Brief:</span>
          </div>
          <p style={{ margin: 0 }}>
            {digest.takeaways?.[0] || "Deep dive into system invariants, production scaling patterns, and latency optimization for enterprise AI architectures."}
          </p>
        </div>
      </div>

      {/* 2. Mode Navigation Switcher Bar */}
      <div className="stage-top-bar">
        <div className="stage-mode-badge">
          {currentView === "video" && <><PlayCircle size={15} color="#fb7185" /> <span>Cinema Lecture</span></>}
          {currentView === "read" && <><BookOpen size={15} color="#60a5fa" /> <span>Executive Digest</span></>}
          {currentView === "build" && <><Terminal size={15} color="#fbbf24" /> <span>Code Architecture Lab</span></>}
          {currentView === "prove" && <><ShieldCheck size={15} color="#34d399" /> <span>Verification Gate</span></>}
          {currentView === "ai" && <><Sparkles size={15} color="#a78bfa" /> <span>AI Custom Rewrite</span></>}
        </div>

        <div className="stage-switcher">
          <button
            className={`stage-switcher-btn ${currentView === "video" ? "active" : ""}`}
            onClick={() => setViewMode("video")}
          >
            <PlayCircle size={12} />
            <span>Video Player</span>
          </button>

          <button
            className={`stage-switcher-btn ${currentView === "read" ? "active" : ""}`}
            onClick={() => setViewMode("read")}
          >
            <BookOpen size={12} />
            <span>Executive Digest</span>
          </button>

          <button
            className={`stage-switcher-btn ${currentView === "build" ? "active" : ""}`}
            onClick={() => setViewMode("build")}
          >
            <Terminal size={12} />
            <span>Code Lab</span>
          </button>

          {regeneratedContent && (
            <button
              className={`stage-switcher-btn ${currentView === "ai" ? "active" : ""}`}
              onClick={() => setViewMode("ai")}
            >
              <Sparkles size={12} />
              <span>AI Lens View</span>
            </button>
          )}

          {lesson.url && (
            <a
              href={lesson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stage-switcher-btn"
              title="Open external documentation"
            >
              <ExternalLink size={12} />
              <span>Original Source</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. Cinema Video Viewport (when in video mode) */}
      {currentView === "video" && (
        <div className="video-container-wrapper">
          <div className={`video-viewport size-${videoSize}`}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0`}
              title={lesson.lesson}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="video-control-subbar">
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
              <span style={{ color: "var(--muted)" }}>Playing:</span>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{lesson.lesson}</span>
              {videoOverrides[lesson.order] && (
                <span className="level-badge level-intermediate">Custom Override Active</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="filter-btn"
                style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", textDecoration: "none" }}
              >
                <ExternalLink size={11} />
                <span>Watch on YouTube</span>
              </a>

              <button
                className="filter-btn"
                style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                onClick={() => setIsEditingVideo(!isEditingVideo)}
              >
                <Edit3 size={11} />
                <span>Override Video URL</span>
              </button>
            </div>
          </div>

          {isEditingVideo && (
            <div style={{ background: "var(--bg-alt)", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="text"
                className="chat-input"
                placeholder="Paste replacement YouTube link (https://www.youtube.com/watch?v=...)"
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
              />
              <button className="stage-launch-btn" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }} onClick={handleSaveVideoUrl}>
                Save URL
              </button>
              <button className="stage-launch-btn secondary-btn" style={{ padding: "0.4rem 0.85rem", fontSize: "0.75rem" }} onClick={() => setIsEditingVideo(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Multi-Video Masterclass Playlist with Special Value-Add Annotations */}
      {videoResources.length > 0 && (
        <div className="multi-video-section">
          <div className="multi-video-title">
            <Tv size={15} />
            <span>Masterclass Video Lectures for this Topic ({videoResources.length})</span>
          </div>

          <div className="video-playlist-grid">
            {videoResources.map((res, idx) => {
              const resYtId = extractYtId(res.url);
              const isCurrentlyPlaying = resYtId && resYtId === activeVideoId;

              return (
                <div
                  key={idx}
                  className={`playlist-card ${isCurrentlyPlaying ? "active" : ""}`}
                  onClick={() => handleSelectVideoResource(res)}
                >
                  <div className="playlist-card-top">
                    <span className={`level-badge level-${res.level || "beginner"}`}>
                      {res.level ? res.level.toUpperCase() : "MASTERCLASS"}
                    </span>
                    <span style={{ fontSize: "0.7rem" }}>
                      {isCurrentlyPlaying ? "▶ Now Playing" : "Click to Play"}
                    </span>
                  </div>

                  <div className="playlist-card-name">
                    {res.title}
                  </div>

                  {/* Special Value Add Summary */}
                  <div className="playlist-value-add">
                    <strong style={{ color: "var(--text)" }}>💎 Special Value-Add: </strong>
                    {res.description}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.2rem" }}>
                    <button
                      className="filter-btn active"
                      style={{ fontSize: "0.68rem", padding: "0.2rem 0.5rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVideoResource(res);
                      }}
                    >
                      <PlayCircle size={11} />
                      <span>{isCurrentlyPlaying ? "Currently Active" : "Play in Stage"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Viewport: Executive Reading Digest */}
      {currentView === "read" && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div className="digest-title">{digest.title || lesson.lesson}</div>
            <div className="digest-sub">⚡ 1-Minute Executive Synthesis • Skip 20,000-word walls of text</div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title">
              <Lightbulb size={14} />
              <span>Core Architectural Takeaways:</span>
            </div>
            <div className="digest-card">
              <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {digest.takeaways.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title" style={{ color: "var(--warning)" }}>
              <CheckCircle2 size={14} />
              <span>Production Rules & Invariant Safeguards:</span>
            </div>
            <div className="digest-card digest-card-rules">
              <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {digest.rules.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title" style={{ color: "var(--rose)" }}>
              <AlertTriangle size={14} />
              <span>Critical Pitfalls & Anti-Patterns:</span>
            </div>
            <div className="digest-card digest-card-pitfalls">
              <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {digest.pitfalls.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn secondary-btn" onClick={() => setViewMode("video")}>
              <PlayCircle size={14} />
              <span>Watch Cinema Video Companion</span>
            </button>

            {lesson.url && (
              <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="stage-launch-btn">
                <ExternalLink size={14} />
                <span>Read Full Documentation</span>
              </a>
            )}

            <button
              className="stage-launch-btn"
              onClick={() => onToggleComplete(lesson.order)}
            >
              {isCompleted ? "↩ Mark Incomplete" : "✓ Mark Topic Complete"}
            </button>
          </div>
        </div>
      )}

      {/* 6. Viewport: Code Architecture Lab */}
      {currentView === "build" && (
        <div className="code-viewport">
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>💻 {lesson.lesson}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
              Hands-on engineering milestone. Implement in your local repository using synthetic or public data.
            </p>
          </div>

          <div className="code-block-container">
            <div className="code-block-header">
              <span>Production Implementation Blueprint</span>
              <button
                className="filter-btn"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                onClick={() => handleCopyCode(`# Production Engineering Template\nfrom pydantic import BaseModel, Field\nimport litellm\n\nclass ExtractionAudit(BaseModel):\n    is_valid: bool = Field(..., description="Validation outcome")\n    metrics: dict = Field(default_factory=dict)\n\n# Run verification suite\n# pytest tests/ -v`)}
              >
                {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedCode ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <div className="code-block-body">{`# Production Engineering Milestone
from pydantic import BaseModel, Field
import litellm

class LogReconciliation(BaseModel):
    is_valid: bool = Field(..., description="Validation outcome")
    confidence: float = Field(ge=0.0, le=1.0)
    anomalies: list[str] = Field(default_factory=list)

# Router configuration with automatic fallback
response = litellm.completion(
    model="gpt-4o",
    fallbacks=["claude-3-5-sonnet-20241022"],
    messages=[{"role": "user", "content": "Reconcile telemetry data"}]
)`}</div>
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn" onClick={() => onToggleComplete(lesson.order)}>
              {isCompleted ? "↩ Mark Milestone Incomplete" : "✓ Mark Milestone Complete"}
            </button>
          </div>
        </div>
      )}

      {/* 7. Viewport: Verification Rubric (Prove Mode) */}
      {currentView === "prove" && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div className="digest-title">🛡️ Prove Gate: {lesson.lesson}</div>
            <div className="digest-sub">Hard milestone evidence verification before advancing.</div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title">
              <ShieldCheck size={14} color="#34d399" />
              <span>Acceptance Criteria Checklist:</span>
            </div>
            <div className="digest-card">
              <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                <li>Public GitHub repository code committed with clean git history.</li>
                <li>Automated assertion test suite passing (Faithfulness ≥ 0.85).</li>
                <li>Zero client/proprietary data committed (100% synthetic/public data).</li>
                <li>Documented latency and token cost benchmarks in the README.</li>
              </ul>
            </div>
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn" onClick={() => onToggleComplete(lesson.order)}>
              {isCompleted ? "↩ Mark Gate Incomplete" : "✓ Verify & Complete Gate"}
            </button>
          </div>
        </div>
      )}

      {/* 8. Viewport: AI Custom Rewrite */}
      {currentView === "ai" && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={18} color="#a78bfa" />
              <div className="digest-title">{lesson.lesson} (AI Tailored View)</div>
            </div>
            <div className="digest-sub">Synthesized by your configured AI model according to your selected learning lens.</div>
          </div>

          <div className="digest-card" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "0.88rem" }}>
            {regeneratedContent}
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn secondary-btn" onClick={() => setViewMode("video")}>
              ↩ Return to Video
            </button>
            <button className="stage-launch-btn" onClick={() => onToggleComplete(lesson.order)}>
              {isCompleted ? "↩ Mark Incomplete" : "✓ Mark Complete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
