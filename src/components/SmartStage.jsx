import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
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
  const videoId =
    res.videoId || youtubeIdFromUrl(res.url) || (res.type === "video" ? fallbackVideoId : "");
  return {
    level: res.level || "Resource",
    label: res.title || res.label || "Resource",
    color: res.color || "var(--accent)",
    videoId: isLikelyYoutubeId(videoId) ? videoId : "",
    url: res.url,
    add: res.description || res.add || ""
  };
}

function defaultTabForLesson(lesson, hasPrimaryEmbed) {
  if (!lesson) {
    return "theory";
  }
  if (lesson.type === "Video" && hasPrimaryEmbed) {
    return "videos";
  }
  if (lesson.type === "Prove" || lesson.type === "Build") {
    return "lab";
  }
  return "theory";
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

  const [activeTab, setActiveTab] = useState(() => defaultTabForLesson(lesson, showPrimaryEmbed));

  const resources = useMemo(() => {
    if (!lesson) {
      return DEFAULT_RESOURCES.map((r) => resourceToBlock(r, ""));
    }
    const raw = lesson.resources?.length ? lesson.resources : DEFAULT_RESOURCES;
    return raw.map((r) => resourceToBlock(r, primaryVideoId));
  }, [lesson, primaryVideoId]);

  const theoryMarkdown = useMemo(() => {
    if (regeneratedContent) {
      return regeneratedContent;
    }
    if (lesson?.content) {
      return lesson.content;
    }
    return buildDefaultLessonMarkdown(lesson, courseRef);
  }, [lesson, courseRef, regeneratedContent]);

  if (!lesson) {
    return null;
  }

  const externalPlatform =
    lesson.url &&
    (lesson.open_how?.includes("DL.AI") ||
      lesson.open_how?.includes("Coursera") ||
      lesson.open_how?.includes("Browser") ||
      (!showPrimaryEmbed && lesson.type === "Video"));

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

      {showPrimaryEmbed && (
        <div className="learning-video-hero">
          <iframe
            src={`https://www.youtube.com/embed/${primaryVideoId}?rel=0`}
            title={lesson.lesson}
            className="learning-video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {externalPlatform && !showPrimaryEmbed && lesson.url && (
        <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-external-card">
          <PlayCircle size={28} />
          <div>
            <div className="learning-external-title">Continue on {lesson.open_how || "external platform"}</div>
            <div className="learning-external-sub">This lecture runs in your browser (Coursera, DeepLearning.AI, etc.)</div>
          </div>
          <ExternalLink size={18} />
        </a>
      )}

      <div className="learning-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "theory" ? "active" : ""}`}
          onClick={() => setActiveTab("theory")}
        >
          <BookOpen size={17} />
          Overview
        </button>
        <button
          type="button"
          role="tab"
          className={`learning-tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          <PlayCircle size={17} />
          Lectures
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

      {activeTab === "theory" && (
        <div className="learning-tab-panel animation-fade-in">
          <div className="markdown-theory prose-learning">
            {regeneratedContent && (
              <p className="learning-ai-banner">AI-regenerated view — compare with curriculum sources</p>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {theoryMarkdown}
            </ReactMarkdown>
          </div>
          {lesson.digest?.takeaways?.length > 0 && !regeneratedContent && (
            <div className="learning-digest-card">
              <h4>{lesson.digest.title || "Quick digest"}</h4>
              <ul>
                {lesson.digest.takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="learning-tab-panel animation-fade-in learning-video-list">
          {resources.map((res, idx) => (
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
                  <ExternalLink size={14} />
                  Open {res.label}
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
              {lesson.type === "Prove"
                ? "Submit proof of work (repo, notebook, benchmark, or dashboard) and link it below."
                : "Implement the milestone, run local tests, and capture artifacts for your portfolio."}
            </p>
            {lesson.url && (lesson.type === "Build" || lesson.type === "Prove") && (
              <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="learning-resource-link inline">
                <ExternalLink size={14} />
                Open assignment reference
              </a>
            )}
            <pre className="learning-lab-snippet">
              <code># Suggested prove harness{"\n"}pytest tests/test_milestone_{lesson.order}.py</code>
            </pre>
          </div>

          {(lesson.type === "Prove" || lesson.type === "Build") && onSaveProveUrl && (
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
          onClick={() => onToggleComplete(lesson.order)}
        >
          <CheckCircle2 size={18} />
          {isCompleted ? "Completed" : "Mark complete"}
        </button>
      </footer>
    </div>
  );
}
