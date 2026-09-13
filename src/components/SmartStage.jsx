import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, PlayCircle, BookOpen, Lightbulb, Code2, Sparkles, ExternalLink } from "lucide-react";
import { youtubeIdFromUrl } from "../utils/youtube";

const DEFAULT_RESOURCES = [
  {
    level: "Beginner",
    label: "StatQuest: Transformer Attention Visually",
    color: "var(--brand-green)",
    videoId: "zxQyTK8quyY",
    add: "Step-by-step breakdown of query, key, value matrix multiplications."
  },
  {
    level: "Intermediate",
    label: "Andrej Karpathy: Let's Build GPT from Scratch",
    color: "var(--brand-blue)",
    videoId: "kCc8FmEb1nY",
    add: "Coding character-level nanoGPT in raw PyTorch line-by-line."
  }
];

function resourceToBlock(res, fallbackVideoId) {
  const videoId =
    res.videoId || youtubeIdFromUrl(res.url) || (res.type === "video" ? fallbackVideoId : "");
  return {
    level: res.level || "Resource",
    label: res.title || res.label || "Resource",
    color: res.color || "var(--brand-blue)",
    videoId,
    url: res.url,
    add: res.description || res.add || ""
  };
}

export default function SmartStage({
  lesson,
  isCompleted,
  onToggleComplete,
  videoOverrides = {},
  onSaveVideoOverride,
  onOpenRegenerateModal,
  regeneratedContent
}) {
  const [activeTab, setActiveTab] = useState("theory");

  const primaryVideoId = useMemo(() => {
    if (!lesson) {
      return "";
    }
    const override = videoOverrides[lesson.order];
    if (override) {
      return override;
    }
    if (lesson.youtube_id) {
      return lesson.youtube_id;
    }
    if (lesson.embed_url) {
      return youtubeIdFromUrl(lesson.embed_url);
    }
    return youtubeIdFromUrl(lesson.url);
  }, [lesson, videoOverrides]);

  const resources = useMemo(() => {
    if (!lesson) {
      return DEFAULT_RESOURCES;
    }
    const raw = lesson.resources?.length ? lesson.resources : DEFAULT_RESOURCES;
    return raw.map((r) => resourceToBlock(r, primaryVideoId || "kCc8FmEb1nY"));
  }, [lesson, primaryVideoId]);

  const theoryMarkdown = regeneratedContent || lesson?.content || "";

  if (!lesson) {
    return null;
  }

  const isExternalOnly =
    lesson.type === "Video" && primaryVideoId && lesson.open_how !== "Embed" && !lesson.embed_url;

  return (
    <div className="stage coursera-stage pb-20">
      <div className="stage-header mb-8 pb-4 border-b border-slate-800 flex justify-between items-end gap-4">
        <div>
          <div className="text-sm font-semibold tracking-wider text-blue-400 mb-1">
            {lesson.section?.toUpperCase() || "CORE TOPIC"}
          </div>
          <h2 className="text-3xl font-bold text-slate-100">{lesson.lesson}</h2>
        </div>
        {onOpenRegenerateModal && (
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 shrink-0"
            onClick={onOpenRegenerateModal}
          >
            <Sparkles size={16} />
            Regenerate lens
          </button>
        )}
      </div>

      {primaryVideoId && lesson.type === "Video" && (
        <div className="mb-8 aspect-video w-full bg-black relative rounded-xl overflow-hidden border border-slate-800">
          <iframe
            src={`https://www.youtube.com/embed/${primaryVideoId}?rel=0`}
            title={lesson.lesson}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {lesson.url && isExternalOnly && (
        <a
          href={lesson.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mb-6 text-sm text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={14} />
          Open lesson in browser ({lesson.open_how || "link"})
        </a>
      )}

      <div className="flex gap-6 mb-8 border-b border-slate-800">
        <button
          type="button"
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === "theory" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => setActiveTab("theory")}
        >
          <BookOpen size={18} />
          Theory & Architecture
        </button>
        <button
          type="button"
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === "videos" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => setActiveTab("videos")}
        >
          <PlayCircle size={18} />
          Video Lectures
        </button>
        <button
          type="button"
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === "deep-dive" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200"}`}
          onClick={() => setActiveTab("deep-dive")}
        >
          <Code2 size={18} />
          Deep Dive / Lab
        </button>
      </div>

      {activeTab === "theory" && (
        <div className="tab-pane-theory animation-fade-in">
          {theoryMarkdown ? (
            <div className="markdown-theory prose prose-invert max-w-none bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl shadow-xl">
              {regeneratedContent && (
                <p className="text-xs text-amber-400/90 mb-4 uppercase tracking-wide font-semibold">AI-regenerated view</p>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {theoryMarkdown}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="markdown-theory p-10 bg-slate-900/20 border border-slate-800/40 rounded-xl text-slate-400 italic text-center">
              <Lightbulb className="inline-block mb-3 text-slate-500" size={32} />
              <h3 className="text-xl font-semibold mb-2 not-italic text-slate-200">Architectural theory</h3>
              <p>Use the AI mentor or regenerate lens to add markdown for this topic.</p>
              {primaryVideoId && (
                <button
                  type="button"
                  className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors not-italic"
                  onClick={() => setActiveTab("videos")}
                >
                  View video lectures
                </button>
              )}
            </div>
          )}
          {lesson.digest && !regeneratedContent && (
            <div className="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-xl text-sm text-slate-300">
              <h4 className="font-bold text-slate-100 mb-2">{lesson.digest.title || "Key digest"}</h4>
              {lesson.digest.takeaways?.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  {lesson.digest.takeaways.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="tab-pane-videos animation-fade-in flex flex-col gap-12">
          {resources.map((res, idx) => (
            <div key={idx} className="video-block bg-slate-900/30 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-slate-900"
                    style={{ backgroundColor: res.color }}
                  >
                    {res.level}
                  </span>
                  <span className="font-semibold text-slate-200">{res.label}</span>
                </div>
              </div>

              {res.videoId ? (
                <div className="aspect-video w-full bg-black relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${res.videoId}?rel=0`}
                    title={res.label}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : res.url ? (
                <div className="p-6">
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                    <ExternalLink size={14} />
                    Open resource
                  </a>
                </div>
              ) : null}

              <div className="p-6 bg-slate-900/50">
                <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Summary</h4>
                <p className="text-slate-300 leading-relaxed text-sm">{res.add || "Supplementary lecture for this topic."}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "deep-dive" && (
        <div className="tab-pane-deep-dive animation-fade-in">
          <div className="p-10 bg-slate-900/20 border border-slate-800/40 rounded-xl text-slate-400 text-center">
            <Code2 className="inline-block mb-3 text-slate-500" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-slate-200">Code lab & prove gate</h3>
            <p>Clone the assignment repo and pass the automated test suites for this milestone.</p>
            {lesson.url && lesson.type === "Build" && (
              <a
                href={lesson.url}
                className="mt-4 inline-block text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open build reference
              </a>
            )}
            <div className="mt-8 bg-slate-950 p-6 rounded-lg text-left border border-slate-800 font-mono text-sm">
              <div className="text-green-400 mb-2"># Run prove harness</div>
              <div className="text-slate-300">pytest tests/test_milestone_{lesson.order}.py</div>
            </div>
          </div>

          {onSaveVideoOverride && (
            <div className="mt-6 p-4 border border-slate-800 rounded-lg">
              <label className="text-xs text-slate-500 block mb-2">Override primary YouTube ID (saved locally)</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                placeholder="11-character video id"
                value={videoOverrides[lesson.order] || ""}
                onChange={(e) => onSaveVideoOverride(lesson.order, e.target.value.trim())}
              />
            </div>
          )}
        </div>
      )}

      <div className="stage-actions flex justify-end items-center mt-12 pt-8 border-t border-slate-800/50">
        <button
          type="button"
          className={`completion-btn px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${isCompleted ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25"}`}
          onClick={() => onToggleComplete(lesson.order)}
        >
          <CheckCircle2 size={18} />
          {isCompleted ? "Mark Incomplete" : "Mark Topic Complete"}
        </button>
      </div>
    </div>
  );
}
