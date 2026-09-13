import React, { useState } from 'react';
import { X, Key, Shield, Download, Upload, Bot, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  keys,
  onSaveKeys,
  preferredModel,
  onSaveModel,
  onExportBackup,
  onImportBackup
}) {
  const [geminiKey, setGeminiKey] = useState(keys.gemini || '');
  const [groqKey, setGroqKey] = useState(keys.groq || '');
  const [openRouterKey, setOpenRouterKey] = useState(keys.openrouter || '');
  const [model, setModel] = useState(preferredModel || 'gemini-3.7-flash');
  const [customModel, setCustomModel] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalModel = model === 'custom' ? customModel : model;
    onSaveKeys({
      gemini: geminiKey.trim(),
      groq: groqKey.trim(),
      openrouter: openRouterKey.trim()
    });
    onSaveModel(finalModel);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImportBackup(data);
        alert("Backup imported successfully!");
      } catch (err) {
        alert("Invalid backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <Key size={16} color="#6366f1" />
            <span>AI Model & Key Configuration</span>
          </div>
          <button className="filter-btn" style={{ border: 'none', background: 'transparent' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78rem', display: 'flex', gap: '0.5rem' }}>
            <Shield size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
            <div>
              <strong>100% Client-Side Privacy:</strong> Your keys are stored locally in your browser sandbox. They are never committed to git, never sent to middleman servers, and only called directly to official endpoints.
            </div>
          </div>

          {/* Model Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)' }}>Active AI Model</label>
            <select
              className="chat-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <optgroup label="Google Gemini (Recommended)">
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (High Speed & Deep Reasoning)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest Preview)</option>
                <option value="gemini-3-pro">Gemini 3 Pro (Premier Frontier Reasoning)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Stable Default)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (2 Million Token Context)</option>
              </optgroup>
              <optgroup label="Groq (Ultra-Fast Free)">
                <option value="groq-llama-3.3-70b-versatile">Groq: Llama 3.3 70B (500 tok/sec)</option>
                <option value="groq-llama-3.1-8b-instant">Groq: Llama 3.1 8B Instant</option>
              </optgroup>
              <optgroup label="OpenRouter Free Tier">
                <option value="openrouter-deepseek/deepseek-r1:free">OpenRouter: DeepSeek-R1 (Free)</option>
                <option value="openrouter-meta-llama/llama-3.3-70b-instruct:free">OpenRouter: Llama 3.3 70B (Free)</option>
              </optgroup>
              <option value="custom">Custom Model ID...</option>
            </select>
          </div>

          {model === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)' }}>Custom Model ID</label>
              <input
                type="text"
                className="chat-input"
                placeholder="e.g. gemini-3.0-ultra-preview"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </div>
          )}

          {/* Key Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Google AI Studio API Key (Free)</label>
              <input
                type="password"
                className="chat-input"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                Get free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>aistudio.google.com</a> (1,500 req/day free).
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Groq API Key (Optional Backup)</label>
              <input
                type="password"
                className="chat-input"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="filter-btn" onClick={onExportBackup}>
              <Download size={13} />
              <span>Export Backup JSON</span>
            </button>

            <label className="filter-btn" style={{ cursor: 'pointer' }}>
              <Upload size={13} />
              <span>Restore Backup</span>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="stage-launch-btn secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="stage-launch-btn" onClick={handleSave}>
              {savedSuccess ? <><Check size={14} /> <span>Saved!</span></> : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
