import React, { useState } from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Edit3, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Check 
} from 'lucide-react';

export default function SmartStage({
  lesson,
  isCompleted,
  onToggleComplete,
  videoOverrides,
  onSaveVideoOverride,
  onOpenRegenerateModal,
  regeneratedContent
}) {
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'video' | 'digest' | 'code' | 'ai'
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!lesson) {
    return (
      <div className="smart-stage-card">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          Select a lesson from the curriculum to begin studying.
        </div>
      </div>
    );
  }

  const ltype = lesson.type || 'Read';
  const customYtId = videoOverrides[lesson.order];
  const activeYtId = customYtId || lesson.youtube_id || 'zjkBMFhNj_g';
  const digest = lesson.digest || {
    title: lesson.lesson,
    takeaways: ["Understand the core data contracts and architectural tradeoffs."],
    rules: ["Rule 1: Always enforce strict Pydantic schemas for LLM outputs."],
    pitfalls: ["Avoid testing with subjective vibes instead of assertions."]
  };

  // Determine active view mode
  let currentView = viewMode;
  if (currentView === 'auto') {
    currentView = ltype.toLowerCase();
  }

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveVideoUrl = () => {
    if (!customVideoUrl) return;
    let vid = customVideoUrl;
    if (customVideoUrl.includes('v=')) {
      vid = customVideoUrl.split('v=')[1].split('&')[0];
    } else if (customVideoUrl.includes('youtu.be/')) {
      vid = customVideoUrl.split('youtu.be/')[1].split('?')[0];
    }
    onSaveVideoOverride(lesson.order, vid);
    setIsEditingVideo(false);
    setCustomVideoUrl('');
  };

  return (
    <div className="smart-stage-card">
      {/* Top Navigation Mode Bar */}
      <div className="stage-top-bar">
        <div className="stage-mode-badge">
          {currentView === 'video' && <><PlayCircle size={15} color="#fb7185" /> <span>Cinema Lecture</span></>}
          {currentView === 'read' && <><BookOpen size={15} color="#60a5fa" /> <span>Executive Digest</span></>}
          {currentView === 'build' && <><Terminal size={15} color="#fbbf24" /> <span>Code Architecture Lab</span></>}
          {currentView === 'prove' && <><ShieldCheck size={15} color="#34d399" /> <span>Verification Gate</span></>}
          {currentView === 'ai' && <><Sparkles size={15} color="#a78bfa" /> <span>AI Custom Rewrite</span></>}
        </div>

        <div className="stage-switcher">
          <button
            className={`stage-switcher-btn ${currentView === 'read' ? 'active' : ''}`}
            onClick={() => setViewMode('read')}
          >
            <BookOpen size={12} />
            <span>Digest</span>
          </button>

          <button
            className={`stage-switcher-btn ${currentView === 'video' ? 'active' : ''}`}
            onClick={() => setViewMode('video')}
          >
            <PlayCircle size={12} />
            <span>Video</span>
          </button>

          {regeneratedContent && (
            <button
              className={`stage-switcher-btn ${currentView === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
            >
              <Sparkles size={12} />
              <span>AI View</span>
            </button>
          )}

          {lesson.url && (
            <a
              href={lesson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="stage-switcher-btn"
              title="Open full external source article"
            >
              <ExternalLink size={12} />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>

      {/* Viewport 1: Video Cinema Player */}
      {currentView === 'video' && (
        <div>
          <div className="video-viewport">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1`}
              title={lesson.lesson}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="video-control-subbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'var(--muted)' }}>Lecture Video:</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{lesson.lesson}</span>
              {customYtId && (
                <span className="level-badge level-intermediate">Custom Override Active</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="filter-btn"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setIsEditingVideo(!isEditingVideo)}
              >
                <Edit3 size={11} />
                <span>Override URL</span>
              </button>
            </div>
          </div>

          {isEditingVideo && (
            <div style={{ background: 'var(--bg-alt)', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="chat-input"
                placeholder="Paste replacement YouTube link (https://www.youtube.com/watch?v=...)"
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
              />
              <button className="stage-launch-btn" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }} onClick={handleSaveVideoUrl}>
                Save Video
              </button>
              <button className="stage-launch-btn secondary-btn" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }} onClick={() => setIsEditingVideo(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Viewport 2: AI Regenerated View */}
      {currentView === 'ai' && regeneratedContent && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#a78bfa" />
              <div className="digest-title">{lesson.lesson} (AI Tailored View)</div>
            </div>
            <div className="digest-sub">Synthesized by your configured AI model according to your selected learning lens.</div>
          </div>

          <div className="digest-card" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.88rem' }}>
            {regeneratedContent}
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn secondary-btn" onClick={() => setViewMode('read')}>
              ↩ Return to Canonical View
            </button>
            <button className="stage-launch-btn" onClick={() => onToggleComplete(lesson.order)}>
              {isCompleted ? '↩ Mark Incomplete' : '✓ Mark Complete'}
            </button>
          </div>
        </div>
      )}

      {/* Viewport 3: Executive Reading Digest */}
      {currentView === 'read' && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div className="digest-title">{digest.title || lesson.lesson}</div>
                <div className="digest-sub">⚡ 1-Minute Executive Synthesis • Skip 20,000-word walls of text</div>
              </div>

              <button
                className="stage-launch-btn"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                onClick={onOpenRegenerateModal}
              >
                <Sparkles size={13} />
                <span>Regenerate with AI</span>
              </button>
            </div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title">
              <Lightbulb size={14} />
              <span>Core Architectural Takeaways:</span>
            </div>
            <div className="digest-card">
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {digest.takeaways.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title" style={{ color: 'var(--warning)' }}>
              <CheckCircle2 size={14} />
              <span>Production Rules & Best Practices:</span>
            </div>
            <div className="digest-card digest-card-rules">
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {digest.rules.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title" style={{ color: 'var(--rose)' }}>
              <AlertTriangle size={14} />
              <span>Critical Pitfalls & Anti-Patterns:</span>
            </div>
            <div className="digest-card digest-card-pitfalls">
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {digest.pitfalls.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn secondary-btn" onClick={() => setViewMode('video')}>
              <PlayCircle size={14} />
              <span>Watch Video Companion</span>
            </button>

            {lesson.url && (
              <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="stage-launch-btn">
                <ExternalLink size={14} />
                <span>Read Full Source (Optional)</span>
              </a>
            )}

            <button
              className="stage-launch-btn"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onClick={() => onToggleComplete(lesson.order)}
            >
              {isCompleted ? '↩ Mark Incomplete' : '✓ Mark Complete'}
            </button>
          </div>
        </div>
      )}

      {/* Viewport 4: Code Architecture Lab (Build Mode) */}
      {currentView === 'build' && (
        <div className="code-viewport">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>💻 {lesson.lesson}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              Hands-on engineering milestone. Implement in your local repository using synthetic or public data.
            </p>
          </div>

          <div className="code-block-container">
            <div className="code-block-header">
              <span>Production Template (`reconciler.py`)</span>
              <button
                className="filter-btn"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                onClick={() => handleCopyCode(`# Production Template\nfrom pydantic import BaseModel, Field\n\nclass AuditEvent(BaseModel):\n    event_id: str = Field(..., description="Unique event identifier")\n    status: str = Field("ok", description="Processing state")\n\n# Run tests: pytest tests/ -v`)}
              >
                {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
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
              {isCompleted ? '↩ Mark Milestone Incomplete' : '✓ Mark Milestone Complete'}
            </button>
          </div>
        </div>
      )}

      {/* Viewport 5: Verification Rubric (Prove Mode) */}
      {currentView === 'prove' && (
        <div className="digest-viewport">
          <div className="digest-header">
            <div className="digest-title">🛡️ Prove Gate: {lesson.lesson}</div>
            <div className="digest-sub">Hard milestone evidence verification before advancing to the next tier.</div>
          </div>

          <div className="digest-section">
            <div className="digest-section-title">
              <ShieldCheck size={14} color="#34d399" />
              <span>Acceptance Criteria Checklist:</span>
            </div>
            <div className="digest-card">
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <li>Public GitHub repository code committed with clean git history.</li>
                <li>Automated assertion test suite passing (Faithfulness ≥ 0.85).</li>
                <li>Zero client/proprietary data committed (100% synthetic/public data).</li>
                <li>Documented latency and token cost benchmarks in the README.</li>
              </ul>
            </div>
          </div>

          <div className="digest-actions">
            <button className="stage-launch-btn" onClick={() => onToggleComplete(lesson.order)}>
              {isCompleted ? '↩ Mark Gate Incomplete' : '✓ Verify & Complete Gate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
