import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, PlayCircle, BookOpen, AlertTriangle, Lightbulb, Code2 } from "lucide-react";

export default function SmartStage({ lesson, isCompleted, onToggleComplete }) {
  const [activeTab, setActiveTab] = useState("theory");

  if (!lesson) return null;

  // Fallback video ID if none provided
  const videoId = lesson.videoId || "kCc8FmEb1nY"; 

  const resources = lesson.resources || [
    { level: "Beginner", label: "StatQuest: Transformer Attention Visually", color: "var(--brand-green)", videoId: "zxQyTK8quyY", add: "Step-by-step breakdown of query, key, value matrix multiplications." },
    { level: "Intermediate", label: "Andrej Karpathy: Let's Build GPT from Scratch", color: "var(--brand-blue)", videoId: "kCc8FmEb1nY", add: "Coding character-level nanoGPT in raw PyTorch line-by-line." },
  ];

  return (
    <div className="stage coursera-stage pb-20">
      
      {/* 1. Top Bar / Tabs */}
      <div className="stage-header mb-8 pb-4 border-b border-slate-800 flex justify-between items-end">
        <div>
          <div className="text-sm font-semibold tracking-wider text-blue-400 mb-1">
            {lesson.section?.toUpperCase() || "CORE TOPIC"}
          </div>
          <h2 className="text-3xl font-bold text-slate-100">{lesson.lesson}</h2>
        </div>
      </div>

      <div className="flex gap-6 mb-8 border-b border-slate-800">
        <button 
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'theory' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('theory')}
        >
          <BookOpen size={18} />
          Theory & Architecture
        </button>
        <button 
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'videos' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('videos')}
        >
          <PlayCircle size={18} />
          Video Lectures
        </button>
        <button 
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'deep-dive' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('deep-dive')}
        >
          <Code2 size={18} />
          Deep Dive / Lab
        </button>
      </div>

      {/* TAB CONTENT: THEORY */}
      {activeTab === "theory" && (
        <div className="tab-pane-theory animation-fade-in">
          {lesson.content ? (
            <div className="markdown-theory prose prose-invert max-w-none bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl shadow-xl">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              >
                {lesson.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="markdown-theory p-10 bg-slate-900/20 border border-slate-800/40 rounded-xl text-slate-400 italic text-center">
              <Lightbulb className="inline-block mb-3 text-slate-500" size={32} />
              <h3 className="text-xl font-semibold mb-2">Architectural Theory Draft</h3>
              <p>Detailed architectural theory, invariants, and code teardowns are currently being generated for this topic.</p>
              <p className="text-sm mt-2 text-slate-500">You can use the local generate_theory.py script to populate this instantly using Gemini API.</p>
              <button className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors" onClick={() => setActiveTab('videos')}>
                View Video Lectures
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VIDEOS */}
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
              
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  src={`https://www.youtube.com/embed/${res.videoId || videoId}?rel=0&showinfo=0&autohide=1`}
                  title={res.label}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="p-6 bg-slate-900/50">
                <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Video Summary & Value Add</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {res.add || "This masterclass lecture provides foundational context and step-by-step intuition for the topic."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: DEEP DIVE */}
      {activeTab === "deep-dive" && (
        <div className="tab-pane-deep-dive animation-fade-in">
          <div className="p-10 bg-slate-900/20 border border-slate-800/40 rounded-xl text-slate-400 text-center">
            <Code2 className="inline-block mb-3 text-slate-500" size={32} />
            <h3 className="text-xl font-semibold mb-2">Code Lab & Prove Gate</h3>
            <p>Ready to implement? Clone the target repository and pass the automated test suites.</p>
            <div className="mt-8 bg-slate-950 p-6 rounded-lg text-left border border-slate-800 font-mono text-sm">
              <div className="text-green-400 mb-2"># 1. Clone the assignment</div>
              <div className="text-slate-300 mb-4">git clone https://github.com/your-org/ai-labs.git</div>
              
              <div className="text-green-400 mb-2"># 2. Run the test harness</div>
              <div className="text-slate-300">pytest tests/test_milestone_{lesson.order}.py</div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Action */}
      <div className="stage-actions flex justify-end items-center mt-12 pt-8 border-t border-slate-800/50">
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
