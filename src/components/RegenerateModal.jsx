import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import { generateAiResponse } from '../services/aiService';

export default function RegenerateModal({
  isOpen,
  onClose,
  lesson,
  onSaveRegeneration,
  preferredModel
}) {
  const [lens, setLens] = useState('staff'); // 'staff' | 'eli5' | 'interview' | 'code'
  const [selectedModel, setSelectedModel] = useState(preferredModel || 'gemini-3.7-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !lesson) return null;

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');

    const lensPrompts = {
      staff: "Rewrite this lesson from a Staff/Principal AI Systems Engineer perspective. Focus on latency budgets (TTFT, P99), cost per token, production reliability, SLAs, and failure mode mitigation.",
      eli5: "Rewrite this lesson using intuitive visual analogies, simplified explanations, and mental models (Feynman technique). Eliminate academic jargon while keeping the conceptual truth intact.",
      interview: "Transform this entire lesson into 5 rapid-fire Tier-1 AI System Engineer interview questions with detailed model answers and follow-up gotchas.",
      code: "Convert this lesson into a concrete, runnable, heavily commented Python/PyTorch/LangGraph code template with unit tests demonstrating the architecture."
    };

    const prompt = `Lesson: "${lesson.lesson}" (Course ${lesson.course}: ${lesson.course_title}).
Existing Digest & Concepts: ${JSON.stringify(lesson.digest || {})}

Task: ${lensPrompts[lens]}

Format output in clean, beautiful Markdown with clear section headers, bullet lists, and code blocks where applicable.`;

    try {
      const response = await generateAiResponse({
        prompt,
        systemInstruction: "You are a world-class AI engineering educator and Staff AI Systems Architect.",
        preferredModel: selectedModel
      });

      onSaveRegeneration(lesson.order, response);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate page rewrite. Please check API keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <Sparkles size={16} color="#a78bfa" />
            <span>Regenerate Lesson with AI</span>
          </div>
          <button className="filter-btn" style={{ border: 'none', background: 'transparent' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Choose an AI model and learning lens to rewrite <strong>{lesson.lesson}</strong> into your custom visual learning view.
          </p>

          {/* Model Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Generator Model</label>
            <select
              className="chat-input"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (Ultra-Fast)</option>
              <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Latest Preview)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning)</option>
              <option value="groq-llama-3.3-70b-versatile">Groq: Llama 3.3 70B (Fast & Free)</option>
            </select>
          </div>

          {/* Lens Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Select Learning Lens</label>
            
            <div
              className={`digest-card ${lens === 'staff' ? 'digest-card-rules' : ''}`}
              style={{ cursor: 'pointer', borderColor: lens === 'staff' ? 'var(--accent)' : 'var(--border)' }}
              onClick={() => setLens('staff')}
            >
              <div style={{ fontWeight: 600, color: '#fff' }}>👔 Staff System Design Lens</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Reframes lesson around latency budgets, QPS trade-offs, SLAs, and production failure modes.
              </div>
            </div>

            <div
              className={`digest-card ${lens === 'eli5' ? 'digest-card-rules' : ''}`}
              style={{ cursor: 'pointer', borderColor: lens === 'eli5' ? 'var(--accent)' : 'var(--border)' }}
              onClick={() => setLens('eli5')}
            >
              <div style={{ fontWeight: 600, color: '#fff' }}>👶 Visual Mental Models / ELI5</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Simplifies dense math and terminology into clear visual analogies and intuitive explanations.
              </div>
            </div>

            <div
              className={`digest-card ${lens === 'interview' ? 'digest-card-rules' : ''}`}
              style={{ cursor: 'pointer', borderColor: lens === 'interview' ? 'var(--accent)' : 'var(--border)' }}
              onClick={() => setLens('interview')}
            >
              <div style={{ fontWeight: 600, color: '#fff' }}>🎯 Interview Rapid-Fire Sheet</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Transforms the topic into 5 high-probability Tier-1 AI engineer interview questions & answers.
              </div>
            </div>

            <div
              className={`digest-card ${lens === 'code' ? 'digest-card-rules' : ''}`}
              style={{ cursor: 'pointer', borderColor: lens === 'code' ? 'var(--accent)' : 'var(--border)' }}
              onClick={() => setLens('code')}
            >
              <div style={{ fontWeight: 600, color: '#fff' }}>💻 Code-First Teardown</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Extracts the theory into a clean, annotated, runnable Python/PyTorch code template with assertions.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--rose)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.78rem', color: '#fb7185' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="stage-launch-btn secondary-btn" onClick={onClose} disabled={isGenerating}>
              Cancel
            </button>
            <button className="stage-launch-btn" onClick={handleRegenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Regenerate Page Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
