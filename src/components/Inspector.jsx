import React, { useState, useMemo, useEffect } from "react";
import {
  Bot,
  FileText,
  HelpCircle,
  Map,
  Send,
  Copy,
  ExternalLink,
  ChevronDown,
  Key
} from "lucide-react";
import { generateAiResponse, AVAILABLE_MODELS, formatMentorApiError } from "../services/aiService";
import { buildMentorChatMessages, estimateMentorInputTokens } from "../services/mentorContext";
import { buildProvePlanMentorQuestion } from "../utils/proveWorkflow";
import { getLessonResources } from "../utils/lessonResources";
import {
  checkTokenBudget,
  depthConfig,
  formatUsageLine,
  readReplyDepth,
  readUsageSnapshot,
  recordTokenUsage,
  resetSessionUsage,
  saveReplyDepth,
} from "../utils/tokenGovernance";
import MarkdownProse from "./MarkdownProse";
import MentorLayoutBar from "./MentorLayoutBar";
import MentorTokenBar from "./MentorTokenBar";

function MentorChatPanel({
  lesson,
  courseRef,
  mentorGreeting,
  preferredModel,
  onSelectModel,
  onOpenSettings,
  apiKeys,
  userProfile,
  notes,
  onSaveNotes,
  onOpenNotesTab,
  learningLayout,
  onLearningLayoutChange,
  proveLab = null,
}) {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "ai", text: mentorGreeting }]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [replyDepth, setReplyDepth] = useState(() => readReplyDepth());
  const [usageSnapshot, setUsageSnapshot] = useState(() => readUsageSnapshot());
  const [lastUsageLine, setLastUsageLine] = useState("");
  const [budgetWarning, setBudgetWarning] = useState("");

  useEffect(() => {
    if (!isLoadingAi) {
      setLoadingSeconds(0);
      return undefined;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      setLoadingSeconds(Math.floor((Date.now() - started) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [isLoadingAi]);

  const currentModelObj =
    AVAILABLE_MODELS.find((m) => m.id === preferredModel) || AVAILABLE_MODELS[0];

  const handleDepthChange = (depthId) => {
    setReplyDepth(depthId);
    saveReplyDepth(depthId);
  };

  const handleResetSessionUsage = () => {
    setUsageSnapshot(resetSessionUsage());
    setLastUsageLine("");
    setBudgetWarning("");
  };

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoadingAi) return;

    const newMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    if (!customText) setInputPrompt("");
    setIsLoadingAi(true);
    setBudgetWarning("");

    const depth = depthConfig(replyDepth);
    const learnerName = userProfile?.given_name || userProfile?.name;
    const chatMessages = buildMentorChatMessages({
      lesson,
      courseRef,
      userQuestion: textToSend,
      uiMessages: messages.filter((m) => m.role === "user" || m.role === "ai"),
      learnerName,
      depthId: replyDepth,
      proveLab,
    });
    const estimatedInput = estimateMentorInputTokens(chatMessages);
    const budgetCheck = checkTokenBudget({
      estimatedInput,
      maxOutput: depth.maxOutputTokens,
    });
    setUsageSnapshot(budgetCheck.snapshot);

    if (!budgetCheck.allowed) {
      setMessages([
        ...newMessages,
        { role: "ai", text: `⚠️ **Token budget:** ${budgetCheck.message}` },
      ]);
      setIsLoadingAi(false);
      return;
    }
    if (budgetCheck.message) {
      setBudgetWarning(budgetCheck.message);
    }

    try {
      const { text: response, usage } = await generateAiResponse({
        messages: chatMessages,
        preferredModel,
        keys: apiKeys,
        maxOutputTokens: depth.maxOutputTokens,
      });

      const snapshot = recordTokenUsage(usage);
      setUsageSnapshot(snapshot);
      setLastUsageLine(formatUsageLine(usage, depth.maxOutputTokens));

      setMessages([...newMessages, { role: "ai", text: response }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          text: formatMentorApiError(err, preferredModel),
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
    onOpenNotesTab();
  };

  return (
    <div className="inspector-content inspector-content-mentor" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {learningLayout && onLearningLayoutChange && (
        <MentorLayoutBar layout={learningLayout} onLayoutChange={onLearningLayoutChange} />
      )}
      <MentorTokenBar
        snapshot={usageSnapshot}
        replyDepth={replyDepth}
        onReplyDepthChange={handleDepthChange}
        lastUsageLine={lastUsageLine}
        onResetSession={handleResetSessionUsage}
        budgetWarning={budgetWarning}
      />
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
              {m.role === "user" ? (
                <div className="chat-plain">{m.text}</div>
              ) : (
                <MarkdownProse variant="chat">{m.text}</MarkdownProse>
              )}
              {m.role === "ai" && m.text.includes("API notice") && onOpenSettings && (
                <button
                  type="button"
                  className="filter-btn"
                  style={{ fontSize: "0.72rem", padding: "0.35rem 0.6rem", marginTop: "0.5rem" }}
                  onClick={onOpenSettings}
                >
                  <Key size={11} />
                  <span>Open Settings</span>
                </button>
              )}
              {m.role === "ai" && idx > 0 && !m.text.includes("API notice") && (
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
            <div className="chat-bubble chat-bubble-ai chat-bubble-loading" aria-live="polite">
              <span className="chat-loading-dot" aria-hidden />
              <span>
                {currentModelObj.name} is thinking
                {loadingSeconds >= 3 ? ` (${loadingSeconds}s — richer answers can take a moment)` : "…"}
              </span>
            </div>
          )}
        </div>

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
          <button
            className="filter-btn"
            style={{ fontSize: "0.68rem" }}
            onClick={() =>
              handleSendMessage(buildProvePlanMentorQuestion(lesson, courseRef, proveLab || {}))
            }
            title="Structured prove plan using Lab tab checklist and links"
          >
            🎯 Plan my prove
          </button>
        </div>

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
                    onSelectModel?.(m.id);
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
  );
}

export default function Inspector({
  lesson,
  courseRef = { concepts: [], prompts: [] },
  notes = {},
  onSaveNotes,
  proveUrl = "",
  onSaveProveUrl: _onSaveProveUrl,
  isCompleted: _isCompleted,
  onToggleComplete: _onToggleComplete,
  portfolioRepoUrl = "",
  proveChecklistMap = {},
  preferredModel = "gemini-3.6-flash",
  onSelectModel,
  onOpenSettings,
  apiKeys = {},
  userProfile = null,
  learningLayout = null,
  onLearningLayoutChange = null
}) {
  const [activeTab, setActiveTab] = useState("mentor");
  const [revealedPrompts, setRevealedPrompts] = useState({});

  const mentorGreeting = useMemo(() => {
    const name = userProfile?.given_name || userProfile?.name?.split(" ")?.[0];
    const hi = name ? `Hi ${name}` : "Hi";
    return `👋 ${hi}! I am your Staff AI Systems Mentor. Ask about this topic, bottlenecks, or architecture tradeoffs.`;
  }, [userProfile]);

  const displayResources = useMemo(() => getLessonResources(lesson), [lesson]);

  const proveLab = useMemo(
    () => ({
      portfolioRepoUrl,
      proveUrl,
      proveChecklistMap,
    }),
    [portfolioRepoUrl, proveUrl, proveChecklistMap],
  );

  if (!lesson) {
    return (
      <aside className="inspector-panel">
        <div className="inspector-content" style={{ padding: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
            Select a topic from the syllabus, or use <strong>Course overview</strong> in the middle column. The Mentor,
            Notes, and Resources tabs apply to the active topic.
          </p>
        </div>
      </aside>
    );
  }

  const toggleRevealPrompt = (idx) => {
    setRevealedPrompts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <aside className="inspector-panel">
      {/* Tab Navigation Header */}
      <div className="inspector-tabs">
        <button
          className={`tab-btn ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          <ExternalLink size={13} />
          <span>Resources</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "mentor" ? "active" : ""}`}
          onClick={() => setActiveTab("mentor")}
        >
          <Bot size={13} />
          <span>Mentor</span>
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

      {activeTab === "resources" && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Level-wise stack (free resources)</div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
              Implementation repos are matched to this lesson first (🔧). Primary lecture stays under the Lecture tab.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {displayResources.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  No links for this item yet — check Build/Prove steps or the syllabus markdown.
                </p>
              )}
              {displayResources.map((r, idx) => (
                <div key={idx} className="resource-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className={`level-badge level-${r.level || "beginner"}`}>
                      {r.level ? `${r.level.toUpperCase()}` : "RESOURCE"}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--muted)", background: "var(--surface-active)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                      {r.type === "video"
                        ? "📺 Video"
                        : r.type === "paper"
                          ? "📄 Paper"
                          : r.type === "implementation"
                            ? "🔧 Implementation"
                            : r.type === "repo"
                              ? "📦 Repo"
                              : "📘 Guide"}
                    </span>
                  </div>

                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-title">
                      <span>{r.title}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <div className="resource-title">{r.title}</div>
                  )}

                  <div className="resource-desc">{r.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "mentor" && (
        <MentorChatPanel
          key={lesson.order}
          lesson={lesson}
          courseRef={courseRef}
          mentorGreeting={mentorGreeting}
          preferredModel={preferredModel}
          onSelectModel={onSelectModel}
          onOpenSettings={onOpenSettings}
          apiKeys={apiKeys}
          userProfile={userProfile}
          notes={notes}
          onSaveNotes={onSaveNotes}
          onOpenNotesTab={() => setActiveTab("notes")}
          learningLayout={learningLayout}
          onLearningLayoutChange={onLearningLayoutChange}
          proveLab={proveLab}
        />
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
