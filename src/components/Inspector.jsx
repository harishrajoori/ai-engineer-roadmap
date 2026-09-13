import React, { useState } from "react";
import {
  BookOpen,
  Bot,
  FileText,
  HelpCircle,
  Map,
  Send,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Cpu,
  Key,
  ShieldAlert
} from "lucide-react";
import { generateAiResponse, AVAILABLE_MODELS } from "../services/aiService";

export default function Inspector({
  lesson,
  courseRef = { concepts: [], prompts: [] },
  notes = {},
  onSaveNotes,
  proveUrl = "",
  onSaveProveUrl,
  isCompleted,
  onToggleComplete,
  preferredModel = "gemini-2.5-flash",
  onSelectModel,
  onOpenSettings
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "mentor" | "notes" | "prompts" | "blueprint"
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // AI Mentor Chat State
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hi Harish! I am your Staff AI Systems Mentor. Ask me any doubt about this topic, system bottlenecks, or architecture tradeoffs!"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [revealedPrompts, setRevealedPrompts] = useState({});

  if (!lesson) return null;

  const currentModelObj =
    AVAILABLE_MODELS.find((m) => m.id === preferredModel) || AVAILABLE_MODELS[0];

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoadingAi) return;

    const newMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    if (!customText) setInputPrompt("");
    setIsLoadingAi(true);

    try {
      const systemInstruction = `You are a Principal AI System Engineer mentoring Harish to transition into a Staff AI Platform Engineer.
The user is currently studying Course ${lesson.course}: "${lesson.course_title}", Topic: "${lesson.lesson}" (${lesson.type}).
Keep your explanations precise, highly technical, systems-focused, and pragmatic. Frame with constraints (QPS, SLA, P99 latency, cost/token, failure modes) and minimal code examples where helpful.`;

      const response = await generateAiResponse({
        prompt: textToSend,
        systemInstruction,
        preferredModel
      });

      setMessages([...newMessages, { role: "ai", text: response }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          text: `⚠️ **API Notice:** ${err.message}\n\n💡 *Tip: If you have a Google account, click [aistudio.google.com/apikey](https://aistudio.google.com/apikey) to generate a free Gemini key in 10 seconds, then click Settings ⚙️ to paste it!*`
        }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyToNotes = (text) => {
    const currentNote = notes[lesson.order] || "";
    const updated = currentNote ? `${currentNote}\n\n---\n**AI Synthesis:**\n${text}` : text;
    onSaveNotes(lesson.order, updated);
    setActiveTab("notes");
  };

  const toggleRevealPrompt = (idx) => {
    setRevealedPrompts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <aside className="inspector-panel">
      {/* Tab Navigation Header */}
      <div className="inspector-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BookOpen size={13} />
          <span>Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "mentor" ? "active" : ""}`}
          onClick={() => setActiveTab("mentor")}
        >
          <Bot size={13} />
          <span>AI Mentor</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          <FileText size={13} />
          <span>Notes</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "prompts" ? "active" : ""}`}
          onClick={() => setActiveTab("prompts")}
        >
          <HelpCircle size={13} />
          <span>Interview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "blueprint" ? "active" : ""}`}
          onClick={() => setActiveTab("blueprint")}
        >
          <Map size={13} />
          <span>Blueprint</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Active Topic</div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
              {lesson.lesson}
            </h2>
            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.35rem" }}>
              <span className={`badge badge-${lesson.type || "Do"}`}>{lesson.type}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                {lesson.required === "Yes" ? "⭐ Required" : "Optional"}
              </span>
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-title">Timeline & Metadata</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.78rem" }}>
              <div style={{ background: "var(--bg-alt)", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Module:</span>
                <div style={{ fontWeight: 600, marginTop: "0.15rem", color: "var(--text)" }}>Course {lesson.course}</div>
              </div>
              <div style={{ background: "var(--bg-alt)", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Target:</span>
                <div style={{ fontWeight: 600, marginTop: "0.15rem", color: "var(--text)" }}>{lesson.month}</div>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-title">Granular Learning Stack (All Levels)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(lesson.resources || []).map((r, idx) => (
                <div key={idx} className="resource-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className={`level-badge level-${r.level || "beginner"}`}>
                      {r.level ? `${r.level.toUpperCase()}` : "RESOURCE"}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted)", background: "var(--surface-active)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                      {r.type === "video" ? "📺 Video" : r.type === "paper" ? "📄 Paper" : "📘 Guide"}
                    </span>
                  </div>

                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-title"
                  >
                    <span>{r.title}</span>
                    <ExternalLink size={12} />
                  </a>

                  <div className="resource-desc">{r.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Mentor Chat with IDE Model Dropdown */}
      {activeTab === "mentor" && (
        <div className="inspector-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  {m.role === "ai" && idx > 0 && (
                    <button
                      className="filter-btn"
                      style={{ fontSize: "0.68rem", padding: "0.2rem 0.45rem", marginTop: "0.5rem" }}
                      onClick={() => handleCopyToNotes(m.text)}
                    >
                      <Copy size={10} />
                      <span>Save to Notes</span>
                    </button>
                  )}
                </div>
              ))}
              {isLoadingAi && (
                <div className="chat-bubble chat-bubble-ai" style={{ color: "var(--muted)" }}>
                  <span>Synthesizing response from {currentModelObj.name}...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
              <button
                className="filter-btn"
                style={{ fontSize: "0.68rem" }}
                onClick={() => handleSendMessage(`Break down the failure modes and P99 latency bottlenecks of ${lesson.lesson}.`)}
              >
                ⚡ Latency & Bottlenecks
              </button>
              <button
                className="filter-btn"
                style={{ fontSize: "0.68rem" }}
                onClick={() => handleSendMessage(`Explain ${lesson.lesson} like I am 5 with an intuitive real-world metaphor.`)}
              >
                🐣 ELI5 Metaphor
              </button>
            </div>

            {/* IDE-Style Inline Model Switcher Dropdown */}
            <div className="ide-model-bar">
              <div
                className="ide-model-trigger"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                title="Switch active model on the fly"
              >
                <span>{currentModelObj.icon}</span>
                <span>{currentModelObj.name}</span>
                <span className="level-badge level-beginner" style={{ fontSize: "0.62rem" }}>
                  {currentModelObj.badge}
                </span>
                <ChevronDown size={12} />
              </div>

              {isModelDropdownOpen && (
                <div className="ide-model-dropdown">
                  <div style={{ padding: "0.3rem 0.5rem", fontSize: "0.68rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    Select Active AI Model:
                  </div>
                  {AVAILABLE_MODELS.map((m) => (
                    <div
                      key={m.id}
                      className={`ide-model-option ${m.id === preferredModel ? "active" : ""}`}
                      onClick={() => {
                        onSelectModel && onSelectModel(m.id);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span>{m.icon}</span>
                        <span>{m.name}</span>
                      </div>
                      <span className="level-badge level-intermediate" style={{ fontSize: "0.62rem" }}>
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="filter-btn"
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                onClick={onOpenSettings}
                title="Configure API Keys"
              >
                <Key size={11} />
                <span>Keys</span>
              </button>
            </div>

            {/* Chat Input Row */}
            <div className="chat-input-row">
              <input
                type="text"
                className="chat-input"
                placeholder={`Ask ${currentModelObj.name} about ${lesson.lesson}...`}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className="stage-launch-btn"
                style={{ padding: "0.5rem 0.85rem" }}
                onClick={() => handleSendMessage()}
                disabled={isLoadingAi}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notes Scratchpad */}
      {activeTab === "notes" && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Topic Scratchpad</div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Auto-saving personal study notes persisted locally for this topic.
            </p>
            <textarea
              className="chat-input"
              style={{ minHeight: "280px", fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem", lineHeight: 1.6 }}
              placeholder="Write architectural summaries, invariants, or code snippets here..."
              value={notes[lesson.order] || ""}
              onChange={(e) => onSaveNotes(lesson.order, e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Interview Active Recall */}
      {activeTab === "prompts" && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Staff System Design Interview Prompts</div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Active recall defense questions asked in Staff AI Platform Engineer interview loops.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              {(courseRef.prompts || []).filter(Boolean).map((p, idx) => (
                <div key={idx} className="digest-card" style={{ borderLeft: "3px solid var(--accent)" }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>
                    ❓ {p}
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      className="filter-btn"
                      style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                      onClick={() => toggleRevealPrompt(idx)}
                    >
                      {revealedPrompts[idx] ? "Hide Staff Defense" : "Reveal Staff Blueprint"}
                    </button>
                  </div>
                  {revealedPrompts[idx] && (
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.5rem", background: "var(--surface)", padding: "0.6rem", borderRadius: "6px", lineHeight: 1.5 }}>
                      <strong>Staff Defense Architecture:</strong> Frame with bounded SLAs, p99 token generation targets, fallback circuits during 429 quota exhaustion, and state machine invariant validation using Pydantic + deterministic evaluation gates.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Blueprint */}
      {activeTab === "blueprint" && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Course Blueprint Architecture</div>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Core architectural patterns and design invariants for this course.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              {(courseRef.concepts || []).map((c, idx) => (
                <div key={idx} className="digest-card" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--cyan)" }}>🔹</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
