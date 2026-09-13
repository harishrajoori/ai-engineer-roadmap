import React, { useState } from 'react';
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
  ExternalLink 
} from 'lucide-react';
import { generateAiResponse } from '../services/aiService';

export default function Inspector({
  lesson,
  courseRef,
  notes,
  onSaveNotes,
  proveUrl,
  onSaveProveUrl,
  isCompleted,
  onToggleComplete,
  preferredModel = 'gemini-3.7-flash'
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mentor' | 'notes' | 'prompts' | 'blueprint'
  
  // AI Mentor Chat State
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 Hi Harish! I am your Staff AI Mentor. Ask me any doubt about this lesson, or use the quick buttons below to break down the concept!"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [revealedPrompts, setRevealedPrompts] = useState({});

  if (!lesson) return null;

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoadingAi) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    if (!customText) setInputPrompt('');
    setIsLoadingAi(true);

    try {
      const systemInstruction = `You are a Principal / Staff AI Systems Engineer mentoring an engineer preparing for tier-1 AI system engineering roles.
Current active lesson: "${lesson.lesson}" (Course ${lesson.course}: ${lesson.course_title}).
Active concepts: ${JSON.stringify(courseRef?.concepts || [])}.
Keep your explanations precise, highly technical, systems-focused, and pragmatic. Frame with constraints (QPS, SLA, P99 latency, cost/token, failure modes) and minimal code examples where helpful.`;

      const response = await generateAiResponse({
        prompt: textToSend,
        systemInstruction,
        preferredModel
      });

      setMessages([...newMessages, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'ai', text: `⚠️ Error: ${err.message}. Please check your API key in Settings ⚙️.` }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyToNotes = (text) => {
    const currentNote = notes[lesson.order] || '';
    const updated = currentNote ? `${currentNote}\n\n---\n**AI Synthesis:**\n${text}` : text;
    onSaveNotes(lesson.order, updated);
    setActiveTab('notes');
  };

  const toggleRevealPrompt = (idx) => {
    setRevealedPrompts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <aside className="inspector-panel">
      {/* Tab Navigation Header */}
      <div className="inspector-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={13} />
          <span>Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          <Bot size={13} />
          <span>AI Mentor</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FileText size={13} />
          <span>Notes</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompts')}
        >
          <HelpCircle size={13} />
          <span>Interview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'blueprint' ? 'active' : ''}`}
          onClick={() => setActiveTab('blueprint')}
        >
          <Map size={13} />
          <span>Blueprint</span>
        </button>
      </div>

      {/* Tab 1: Overview & Granular Learning Stack */}
      {activeTab === 'overview' && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Active Lesson</div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>{lesson.lesson}</h2>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.35rem' }}>
              <span className={`badge badge-${lesson.type || 'Do'}`}>{lesson.type}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                {lesson.required === 'Yes' ? '⭐ Required' : 'Optional'}
              </span>
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-title">Timeline & Metadata</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ background: 'var(--bg-alt)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>Module:</span>
                <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>Course {lesson.course}</div>
              </div>
              <div style={{ background: 'var(--bg-alt)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>Target:</span>
                <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{lesson.month || 'Flexible'}</div>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-title">Granular Learning Stack</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(lesson.resources || []).map((r, idx) => {
                let lvlClass = 'level-beginner';
                let lvlLabel = '🟢 Beginner';
                if (r.level === 'intermediate') { lvlClass = 'level-intermediate'; lvlLabel = '🟣 Intermediate'; }
                else if (r.level === 'advanced') { lvlClass = 'level-advanced'; lvlLabel = '🔴 Advanced'; }

                let typeLabel = '📘 Guide';
                if (r.type === 'video') typeLabel = '📺 Video';
                else if (r.type === 'paper') typeLabel = '📄 Paper';
                else if (r.type === 'repo') typeLabel = '💻 Repo';

                return (
                  <div key={idx} className="resource-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`level-badge ${lvlClass}`}>{lvlLabel}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'var(--surface-active)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {typeLabel}
                      </span>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-title">
                      <span>{r.title}</span>
                      <ExternalLink size={12} />
                    </a>
                    {r.description && <div className="resource-desc">{r.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Context-Aware AI Staff Mentor */}
      {activeTab === 'mentor' && (
        <div className="inspector-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)' }}>
              <Bot size={15} />
              <span>Staff AI Mentor ({preferredModel})</span>
            </div>
          </div>

          {/* Quick Study Prompts */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            <button className="filter-btn" style={{ fontSize: '0.68rem' }} onClick={() => handleSendMessage("Explain this concept like I'm 10 with an intuitive visual analogy.")}>
              👶 ELI5
            </button>
            <button className="filter-btn" style={{ fontSize: '0.68rem' }} onClick={() => handleSendMessage("How is this tested in a Staff AI Engineer system design interview? Give latency and cost constraints.")}>
              👔 Staff Interview
            </button>
            <button className="filter-btn" style={{ fontSize: '0.68rem' }} onClick={() => handleSendMessage("What are the top 3 production failure modes and traps for this architecture?")}>
              ⚠️ Failure Modes
            </button>
            <button className="filter-btn" style={{ fontSize: '0.68rem' }} onClick={() => handleSendMessage("Provide a minimal, production-ready Python / PyTorch code snippet demonstrating this.")}>
              💻 Code Snippet
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.text}</div>
                {m.role === 'ai' && idx > 0 && (
                  <button
                    className="filter-btn"
                    style={{ marginTop: '0.5rem', fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}
                    onClick={() => handleCopyToNotes(m.text)}
                  >
                    <Copy size={11} />
                    <span>Save to Notes</span>
                  </button>
                )}
              </div>
            ))}
            {isLoadingAi && (
              <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)' }}>
                <Sparkles size={14} className="animate-spin" />
                <span>AI Mentor is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="chat-input-row" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask any doubt about this lesson..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="stage-launch-btn" style={{ padding: '0.5rem 0.85rem' }} onClick={() => handleSendMessage()}>
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Persistent Markdown Scratchpad */}
      {activeTab === 'notes' && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Study Scratchpad & Code Notes</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Auto-saves to browser memory per lesson. Copy insights from lectures or AI mentor directly here.
            </p>
            <textarea
              className="notes-textarea"
              placeholder="Write markdown notes, code architecture, or synthesis thoughts..."
              value={notes[lesson.order] || ''}
              onChange={(e) => onSaveNotes(lesson.order, e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Active Recall Interview Flashcards */}
      {activeTab === 'prompts' && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Interview Question Bank (Active Recall)</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Test your mental model first before revealing how a Staff AI Engineer frames the answer.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(courseRef?.prompts || []).map((p, idx) => (
                <div key={idx} className="digest-card" style={{ borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>❓ {p}</div>
                  
                  <button
                    className="filter-btn"
                    style={{ marginTop: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => toggleRevealPrompt(idx)}
                  >
                    {revealedPrompts[idx] ? 'Hide Answer' : '👁️ Reveal Staff Answer'}
                  </button>

                  {revealedPrompts[idx] && (
                    <div style={{ marginTop: '0.5rem', background: 'var(--surface)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      <strong>Staff Architectural Answer:</strong> Frame using SLA constraints, throughput, and memory footprint.
                      Decompose into: 1) System trade-offs (e.g. latency vs consistency), 2) Failure modes (e.g. cascading timeout failovers), and 3) Production telemetry metrics (P99 latency, cost/token).
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Course Concept Blueprint */}
      {activeTab === 'blueprint' && (
        <div className="inspector-content">
          <div className="inspector-section">
            <div className="section-title">Course Concept Blueprint</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(courseRef?.concepts || []).map((c, idx) => (
                <div key={idx} className="digest-card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--cyan)' }}>🔹</span>
                  <span style={{ fontSize: '0.82rem' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
