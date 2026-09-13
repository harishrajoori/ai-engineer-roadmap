import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, PlayCircle, BookOpen, AlertTriangle, Lightbulb, ExternalLink } from "lucide-react";

export default function SmartStage({ lesson, isCompleted, onToggleComplete, allLessons }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  if (!lesson) return null;

  // Fallback video ID if none provided
  const videoId = lesson.videoId || "kCc8FmEb1nY"; 
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autohide=1`;

  const resources = lesson.resources || [
    { level: "Beginner", label: "StatQuest", color: "var(--brand-green)" },
    { level: "Intermediate", label: "Andrej Karpathy", color: "var(--brand-blue)" },
    { level: "Advanced", label: "nanoGPT", color: "var(--brand-red)" }
  ];

  const videos = lesson.videos || [
    { title: "Let's Build GPT from Scratch", author: "Andrej Karpathy", id: "kCc8FmEb1nY", valueAdd: "Coding character-level nanoGPT in raw PyTorch line-by-line." }
  ];
  
  const activeVideo = videos[activeVideoIndex];
  const activeEmbedUrl = `https://www.youtube.com/embed/${activeVideo.id}?rel=0&showinfo=0&autohide=1`;

  return (
    <div className="stage coursera-stage">
      
      {/* 1. Header & Breadcrumbs */}
      <div className="stage-header mb-6">
        <div className="stage-breadcrumbs text-sm text-slate-400 mb-2 font-medium">
          {lesson.course_title} <span className="mx-2">›</span> {lesson.lesson}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-4">{lesson.lesson}</h1>
        
        <div className="quick-resources flex flex-wrap gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center">Resource Levels:</span>
          {resources.map((r, idx) => (
            <span key={idx} className="resource-pill" style={{ borderColor: r.color, color: r.color, backgroundColor: `${r.color}15` }}>
              <span className="dot" style={{ backgroundColor: r.color }}></span>
              {r.level}: {r.label}
            </span>
          ))}
        </div>
      </div>

            {/* 2. Text-First Theory / Architecture (Markdown) */}
      {lesson.content ? (
        <div className="markdown-theory mb-10 prose prose-invert max-w-none bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl shadow-xl">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="markdown-theory mb-10 p-6 bg-slate-900/20 border border-slate-800/40 rounded-xl text-slate-400 italic text-center">
          <Lightbulb className="inline-block mb-2 text-slate-500" size={24} />
          <p>Detailed architectural theory is currently being drafted for this topic.</p>
          <p className="text-sm mt-1">Please refer to the interactive lecture below in the meantime.</p>
        </div>
      )}</h2>
          <div className="playlist-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid, idx) => {
              const isActive = activeVideoIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`playlist-card p-4 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                  onClick={() => setActiveVideoIndex(idx)}
                >
                  <div className="font-bold text-slate-200 text-sm mb-1">{vid.title}</div>
                  <div className="text-xs text-slate-400 mb-3">{vid.author}</div>
                  <div className="value-add bg-slate-950/50 text-xs p-2 rounded text-slate-300 border border-slate-800/50">
                    <span className="font-bold text-blue-400">Value Add:</span> {vid.valueAdd}
                  </div>
                  {isActive && <div className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1"><PlayCircle size={12}/> Currently Playing</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Completion Action */}
      <div className="stage-actions flex justify-end items-center mt-8 pt-8 border-t border-slate-800/50">
        <button
          className={`completion-btn px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${isCompleted ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'}`}
          onClick={() => onToggleComplete(lesson.order)}
        >
          <CheckCircle2 size={18} />
          {isCompleted ? "Mark Incomplete" : "Mark Topic Complete"}
        </button>
      </div>

    </div>
  );
}
