import React, { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import MarkdownProse from "./MarkdownProse";
import {
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Code2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { youtubeIdFromUrl, isLikelyYoutubeId } from "../utils/youtube";
import { buildDefaultLessonMarkdown } from "../utils/lessonContent";
import { getLessonResources } from "../utils/lessonResources";
import {
  loadTheoryLevelPreference,
  markdownForTheoryLevel,
  saveTheoryLevelPreference,
  THEORY_LEVELS,
} from "../utils/theoryLevelPreference";
import { stripDuplicateTheoryTitle } from "../utils/markdownDisplay";

const DEFAULT_RESOURCES = [
  {
    level: "Beginner",
    title: "StatQuest: Transformer Attention Visually",
    color: "var(--success)",
    url: "https://www.youtube.com/watch?v=zxQyTK8quyY",
    description: "Step-by-step breakdown of query, key, value matrix multiplications."
  },
  {
    level: "Intermediate",
    title: "Andrej Karpathy: Let's Build GPT from Scratch",
    color: "var(--accent)",
    url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    description: "Coding character-level nanoGPT in raw PyTorch line-by-line."
  }
];

function resourceToBlock(res, fallbackVideoId) {
  const repo = isRepoResource(res);
  const videoId = repo
    ? ""
    : res.videoId || youtubeIdFromUrl(res.url) || (res.type === "video" ? fallbackVideoId : "");
  return {
    level: res.level || "Resource",
    label: res.title || res.label || "Resource",
    color: res.color || "var(--accent)",
    videoId: isLikelyYoutubeId(videoId) ? videoId : "",
    url: res.url,
    add: res.description || res.add || ""
  };
}

function defaultTabForLesson(lesson) {
  if (!lesson) {
    return "overview";
  }
  if (lesson.type === "Prove") {
    return "overview";
  }
  return "overview";
}

function sourceTabMeta(lesson) {
  if (lesson?.type === "Read") {
    return { id: "lecture", label: "Reading", Icon: BookOpen };
  }
  if (lesson?.type === "Video") {
    return { id: "lecture", label: "Lecture", Icon: PlayCircle };
  }
  return { id: "lecture", label: "Source", Icon: ExternalLink };
}

function isRepoResource(res) {
  const url = (res?.url || "").toLowerCase();
  return res?.type === "repo" || url.includes("github.com");
}

export default function SmartStage({
  lesson,
  courseRef = {},
  courseProgressPct = 0,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson = false,
  hasNextLesson = false,
  isCompleted,
  onToggleComplete,
  videoOverrides = {},
  onSaveVideoOverride,
  onOpenRegenerateModal,
  regeneratedContent,
  regenerationMeta = null,
  proveUrl = "",
  onSaveProveUrl
}) {
  const primaryVideoId = useMemo(() => {
    if (!lesson) {
      return "";
    }
    const override = videoOverrides[lesson.order];
    if (override && isLikelyYoutubeId(override)) {
      return override;
    }
    if (lesson.youtube_id && isLikelyYoutubeId(lesson.youtube_id)) {
      return lesson.youtube_id;
    }
    if (lesson.embed_url) {
      const fromEmbed = youtubeIdFromUrl(lesson.embed_url);
      if (isLikelyYoutubeId(fromEmbed)) {
        return fromEmbed;
      }
    }
    const fromUrl = youtubeIdFromUrl(lesson.url);
    return isLikelyYoutubeId(fromUrl) ? fromUrl : "";
  }, [lesson, videoOverrides]);

  const showPrimaryEmbed = Boolean(primaryVideoId && lesson?.type === "Video");

  const [activeTab, setActiveTab] = useState(() => defaultTabForLesson(lesson));
  const [theoryLevel, setTheoryLevel] = useState(() => loadTheoryLevelPreference());

  useEffect(() => {
    setActiveTab(defaultTabForLesson(lesson));
  }, [lesson?.order]);

  const resources = useMemo(() => {
    if (!lesson) {
      return DEFAULT_RESOURCES.map((r) => resourceToBlock(r, ""));
    }
    const raw = getLessonResources(lesson);
    const stack = raw.length ? raw : DEFAULT_RESOURCES;
    return stack.map((r) => resourceToBlock(r, primaryVideoId));
  }, [lesson, primaryVideoId]);

  const supplementalResources = useMemo(() => {
    if (!lesson) {
      return resources;
    }
    return resources.filter((res) => {
      if (lesson.url && res.url === lesson.url) {
        return false;
      }
      if (primaryVideoId && res.videoId === primaryVideoId) {
        return false;
      }
      return true;
    });
  }, [resources, lesson, primaryVideoId]);

  const theoryMarkdown = useMemo(() => {
    const fromLevels = markdownForTheoryLevel(lesson, theoryLevel, regeneratedContent);
    const raw = fromLevels || buildDefaultLessonMarkdown(lesson, courseRef);
    return stripDuplicateTheoryTitle(raw, lesson?.lesson);
  }, [lesson, courseRef, regeneratedContent, theoryLevel]);

  const handleTheoryLevel = (levelId) => {
    setTheoryLevel(levelId);
    saveTheoryLevelPreference(levelId);
  };

  if (!lesson) {
    return null;
  }

  const externalPlatform =
    lesson.url &&
    (lesson.open_how?.includes("DL.AI") ||
      lesson.open_how?.includes("Browser") ||
      (!showPrimaryEmbed && lesson.type === "Video"));

  const sourceTab = sourceTabMeta(lesson);
  const supplementsLabel = lesson.type === "Read" ? "More resources" : "More resources";

  return (
    <div className="learning-stage">
      <div className="learning-stage-breadcrumb">
        <span className="learning-stage-course">Course {lesson.course}</span>
        <span className="learning-stage-sep">/</span>
        <span className="learning-stage-topic">{lesson.course_title}</span>
      </div>

      <div className="learning-stage-hero">
        <div className="learning-stage-hero-text">
          <div className="learning-stage-meta">
            <span className={`badge badge-${lesson.type || "Do"}`}>{lesson.type}</span>
            <span className="learning-stage-effort">{lesson.duration || "Flexible"}</span>
            <span className="learning-stage-month">{lesson.month}</span>
          </div>
          <h1 className="learning-stage-title">{lesson.lesson}</h1>
          <div className="learning-stage-progress-row">
            <div className="learning-stage-progress-track">
              <div className="learning-stage-progress-fill" style={{ width: `${courseProgressPct}%` }} />
            </div>
            <span className="learning-stage-progress-label">{courseProgressPct}% of this course</span>
          </div>
        </div>
        <div className="learning-stage-hero-actions">
          {onOpenRegenerateModal && (
            <button type="button" className="stage-action-btn" onClick={onOpenRegenerateModal}>
              <Sparkles size={16} />
              AI lens
            </button>
          )}
          {lesson.url && (
            <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="stage-action-btn primary">
              <ExternalLink size={16} />
              Open resource
            </a>
          )}
        </div>
      </div>

      <div className="learning-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BookOpen size={17} />
          Theory
        </button>
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "lecture" ? "active" : ""}`}
          onClick={() => setActiveTab("lecture")}
        >
          <sourceTab.Icon size={17} />
          {sourceTab.label}
        </button>
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "supplements" ? "active" : ""}`}
          onClick={() => setActiveTab("supplements")}
        >
          <BookOpen size={17} />
          {supplementsLabel}
        </button>
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "lab" ? "active" : ""}`}
          onClick={() => setActiveTab("lab")}
        >
          <Code2 size={17} />
          Lab & Prove
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="learning-tab-panel animation-fade-in">
          <div className="theory-path-banner">
            <span>
              <strong>New to AI?</strong> Use <strong>Foundations</strong> below → read this page → then{" "}
              <button type="button" className="theory-path-link" onClick={() => setActiveTab("lecture")}>
                {sourceTab.label}
              </button>
              . Open <strong>Study guide</strong> when Foundations feels easy on this topic.
            </span>
          </div>
          {!regeneratedContent && lesson.theory_levels && (
            <div className="theory-level-pills" role="group" aria-label="Theory depth">
              {THEORY_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  className={`theory-level-pill ${theoryLevel === lvl.id ? "active" : ""}`}
                  title={lvl.hint}
                  onClick={() => handleTheoryLevel(lvl.id)}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          )}
          {lesson.coverage_note && (
            <div className="learning-coverage-callout">{lesson.coverage_note}</div>
          )}
          {lesson.access_note && (
            <div className="learning-access-callout" role="note">
              {lesson.access_note}
            </div>
          )}
          <div className="theory-prose-wrap">
            {regeneratedContent && (
              <p className="learning-ai-banner">
                AI-regenerated view
                {regenerationMeta?.model ? ` · ${regenerationMeta.model}` : ""}
                {regenerationMeta?.lens ? ` · ${regenerationMeta.lens} lens` : ""}
                {" — compare with curriculum sources"}
              </p>
            )}
            <MarkdownProse math>{theoryMarkdown}</MarkdownProse>
          </div>
        </div>
      )}

      {activeTab === "lecture" && (
        <div className="learning-tab-panel animation-fade-in">
          {showPrimaryEmbed ? (
            <div className="learning-video-hero">
              <iframe
                src={`https://www.youtube.com/embed/${primaryVideoId}?rel=0`}
                title={lesson.lesson}
                className="learning-video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : externalPlatform && lesson.url ? (
            <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-external-card">
              <PlayCircle size={28} />
              <div>
                <div className="learning-external-title">Open on {lesson.open_how || "external platform"}</div>
                <div className="learning-external-sub">
                  Some external courses and docs are not embeddable here — open in a new tab, then mark complete when
                  this topic&apos;s objective is met.
                </div>
              </div>
              <ExternalLink size={18} />
            </a>
          ) : lesson.url ? (
            <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-external-card">
              {lesson.type === "Read" ? <BookOpen size={28} /> : <ExternalLink size={28} />}
              <div>
                <div className="learning-external-title">
                  {lesson.type === "Read" ? "Primary reading" : "Primary resource"}
                </div>
                <div className="learning-external-sub">
                  {lesson.type === "Read"
                    ? "Official docs or article for this topic. Repositories and extras are under More resources."
                    : "Open the syllabus link for this topic."}
                </div>
              </div>
            </a>
          ) : (
            <p className="learning-empty-tab">
              No primary URL for this item — use More resources or the inspector panel.
            </p>
          )}
        </div>
      )}

      {activeTab === "supplements" && (
        <div className="learning-tab-panel animation-fade-in learning-video-list">
          {supplementalResources.length === 0 && (
            <p className="learning-empty-tab">No supplemental links beyond the primary resource for this topic.</p>
          )}
          {supplementalResources.map((res, idx) => (
            <article key={idx} className="learning-video-card">
              <header className="learning-video-card-head">
                <span className="learning-video-level" style={{ background: res.color }}>{res.level}</span>
                <h3>{res.label}</h3>
              </header>
              {res.videoId ? (
                <div className="learning-video-hero compact">
                  <iframe
                    src={`https://www.youtube.com/embed/${res.videoId}?rel=0`}
                    title={res.label}
                    className="learning-video-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : res.url ? (
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="learning-resource-link">
                  {isRepoResource(res) ? <Code2 size={14} /> : <ExternalLink size={14} />}
                  {isRepoResource(res) ? `Open repository — ${res.label}` : `Open ${res.label}`}
                </a>
              ) : null}
              <p className="learning-video-summary">{res.add || "Supplementary material for this topic."}</p>
            </article>
          ))}
        </div>
      )}

      {activeTab === "lab" && (
        <div className="learning-tab-panel animation-fade-in">
          <div className="learning-lab-card">
            <Code2 size={28} className="learning-lab-icon" />
            <h3>Hands-on lab & prove gate</h3>
            <p>
              {lesson.prove_criteria
                ? lesson.prove_criteria
                : lesson.type === "Prove"
                  ? "Submit proof of work (repo, notebook, benchmark, or dashboard) and link it below."
                  : "Implement the milestone from the syllabus and capture artifacts for your portfolio."}
            </p>
            {lesson.url && lesson.type === "Build" && (
              <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-resource-link inline">
                <ExternalLink size={14} />
                Open build reference
              </a>
            )}
            <p className="learning-lab-hint">
              There is no auto-graded harness in this studio — you self-certify by linking evidence and marking the topic
              complete. Use your own repo tests (e.g. pytest) per the course README.
            </p>
          </div>

          {(lesson.type === "Prove" || lesson.type === "Build" || lesson.prove_criteria) && onSaveProveUrl && (
            <div className="learning-prove-form">
              <label htmlFor="prove-url-input">
                <ShieldCheck size={16} />
                Artifact URL (GitHub, Colab, Hugging Face, etc.)
              </label>
              <input
                id="prove-url-input"
                type="url"
                className="chat-input"
                placeholder="https://github.com/you/milestone-..."
                value={proveUrl}
                onChange={(e) => onSaveProveUrl(lesson.order, e.target.value.trim())}
              />
              {proveUrl && (
                <a href={proveUrl} target="_blank" rel="noopener noreferrer" className="learning-resource-link">
                  <ExternalLink size={14} />
                  Open your artifact
                </a>
              )}
            </div>
          )}

          {onSaveVideoOverride && (
            <div className="learning-prove-form">
              <label htmlFor="yt-override">Primary YouTube ID override (optional)</label>
              <input
                id="yt-override"
                type="text"
                className="chat-input"
                placeholder="11-character video id"
                value={videoOverrides[lesson.order] || ""}
                onChange={(e) => onSaveVideoOverride(lesson.order, e.target.value.trim())}
              />
            </div>
          )}
        </div>
      )}

      <footer className="learning-stage-footer">
        <div className="learning-nav-lessons">
          <button type="button" className="stage-nav-btn" disabled={!hasPrevLesson} onClick={onPrevLesson}>
            <ChevronLeft size={18} />
            Previous
          </button>
          <button type="button" className="stage-nav-btn" disabled={!hasNextLesson} onClick={onNextLesson}>
            Next
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          type="button"
          className={`completion-btn ${isCompleted ? "completed" : ""}`}
          onClick={() => onToggleComplete(lesson)}
        >
          <CheckCircle2 size={18} />
          {isCompleted ? "Completed" : "Mark complete"}
        </button>
      </footer>
    </div>
  );
}
