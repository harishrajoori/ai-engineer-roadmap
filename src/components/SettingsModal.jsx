import React, { useState } from "react";
import { X, Key, Shield, Download, Upload, Check, ExternalLink } from "lucide-react";
import { AVAILABLE_MODELS, normalizePreferredModel } from "../services/aiService";
import { PROVIDER_KEY_LINKS } from "../config/aiModels";
import GoogleSignInButton from "./GoogleSignInButton";
import { resolveGoogleClientId } from "../utils/googleAuth";

export default function SettingsModal({
  isOpen,
  onClose,
  keys = {},
  onSaveKeys,
  preferredModel,
  onSaveModel,
  userProfile,
  onGoogleLogin,
  onGoogleLogout,
  runtimeStudioConfig = {},
  onGoogleAuthError,
  googleAuthError = "",
  onExportBackup,
  onImportBackup
}) {
  const [geminiKey, setGeminiKey] = useState(keys.gemini || "");
  const [groqKey, setGroqKey] = useState(keys.groq || "");
  const [openRouterKey, setOpenRouterKey] = useState(keys.openrouter || "");
  const [googleClientId, setGoogleClientId] = useState(keys.googleClientId || "");
  const [model, setModel] = useState(() => normalizePreferredModel(preferredModel));
  const [customModel, setCustomModel] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const oauthReadyForSignIn = Boolean(
    resolveGoogleClientId({ ...keys, googleClientId: googleClientId.trim() }, runtimeStudioConfig)
  );

  const handleApplyGoogleClientId = () => {
    const id = googleClientId.trim();
    if (!id) {
      return;
    }
    onSaveKeys({ ...keys, googleClientId: id });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1200);
  };

  const handleSave = () => {
    const finalModel = model === "custom" ? customModel : model;
    onSaveKeys({
      gemini: geminiKey.trim(),
      groq: groqKey.trim(),
      openrouter: openRouterKey.trim(),
      googleClientId: googleClientId.trim()
    });
    onSaveModel(finalModel);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImportBackup(data);
        alert("Study progress & notes backup imported successfully!");
      } catch {
        alert("Invalid backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1rem" }}>
            <Key size={16} color="#6366f1" />
            <span>AI Studio & Account Settings</span>
          </div>
          <button className="filter-btn" style={{ border: "none", background: "transparent" }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Privacy Guarantee */}
          <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.78rem", display: "flex", gap: "0.5rem" }}>
            <Shield size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
            <div>
              <strong>100% Client-Side Privacy:</strong> Your keys stay in your browser localStorage. No middleman backend, no telemetry tracking, and direct calls to official model endpoints.
            </div>
          </div>

          {/* Google Account & Authentication Section */}
          <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.37 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>Google Account Status</span>
              </div>

              {userProfile ? (
                <button
                  className="filter-btn"
                  style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                  onClick={onGoogleLogout}
                >
                  Sign Out ({userProfile.name?.split(" ")[0]})
                </button>
              ) : (
                <GoogleSignInButton
                  enabled={oauthReadyForSignIn}
                  onSuccess={onGoogleLogin}
                  onAuthError={onGoogleAuthError}
                  hint="Save or Apply the Web Client ID below, then sign in."
                />
              )}
              {googleAuthError && (
                <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.5rem", border: "1px solid #ef4444", padding: "0.5rem", borderRadius: "4px", backgroundColor: "rgba(239,68,68,0.1)" }}>
                  {googleAuthError}
                </p>
              )}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0, lineHeight: 1.45 }}>
              After sign-in, progress and settings can sync to the cloud when{" "}
              <code style={{ fontSize: "0.7rem" }}>VITE_STUDIO_SYNC_URL</code> is set at build time (see{" "}
              <code style={{ fontSize: "0.7rem" }}>sync-worker/</code>).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.5rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>
                Google OAuth Web Client ID (sign-in — not the Gemini key)
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  autoComplete="off"
                  style={{ flex: "1 1 12rem" }}
                />
                <button type="button" className="filter-btn" onClick={handleApplyGoogleClientId}>
                  Apply client ID
                </button>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
                Create an OAuth 2.0 <strong>Web application</strong> client in Google Cloud Console. Under{" "}
                <em>Authorized JavaScript origins</em>, add your exact site origin (e.g.{" "}
                <code style={{ fontSize: "0.7rem" }}>http://localhost:5173</code> and your GitHub Pages URL — no path,
                no trailing slash). Then click Apply or Save Settings before Sign in with Google.
              </p>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="stage-launch-btn secondary-btn"
                style={{ fontSize: "0.72rem", padding: "0.35rem 0.65rem", width: "fit-content", textDecoration: "none" }}
              >
                Open Google Cloud credentials
                <ExternalLink size={11} />
              </a>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>
              Site owners can also copy <code style={{ fontSize: "0.7rem" }}>public/studio-config.json.example</code> to{" "}
              <code style={{ fontSize: "0.7rem" }}>studio-config.json</code> so visitors do not each paste a client ID.
            </p>

          </div>

          {/* Model Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>Default AI Model</label>
            <select
              className="chat-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ padding: "0.5rem" }}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider} - {m.badge})
                </option>
              ))}
              <option value="custom">Custom Model ID...</option>
            </select>
          </div>

          {model === "custom" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)" }}>Custom Model ID</label>
              <input
                type="text"
                className="chat-input"
                placeholder="e.g. gemini-2.5-flash or openrouter-anthropic/claude-sonnet-4.6"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </div>
          )}

          <div
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "8px",
              padding: "0.75rem",
              fontSize: "0.78rem",
              lineHeight: 1.45,
            }}
          >
            <strong>One key for many models?</strong> Use{" "}
            <a href={PROVIDER_KEY_LINKS.openrouter.url} target="_blank" rel="noopener noreferrer">
              OpenRouter
            </a>{" "}
            only — pick models labeled <em>(via OpenRouter)</em> or any <code>openrouter-*</code> entry. Direct
            Google/Groq keys are optional for lower latency on those providers.
          </div>

          {/* Key Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {[
              { field: "gemini", label: "Google AI Studio (Gemini direct)", placeholder: "AIzaSy...", value: geminiKey, set: setGeminiKey },
              { field: "groq", label: "Groq (Llama direct)", placeholder: "gsk_...", value: groqKey, set: setGroqKey },
              {
                field: "openrouter",
                label: "OpenRouter (Gemini, Claude, DeepSeek — single key)",
                placeholder: "sk-or-v1-...",
                value: openRouterKey,
                set: setOpenRouterKey,
              },
            ].map(({ field, label, placeholder, value, set }) => {
              const link = PROVIDER_KEY_LINKS[field];
              return (
                <div key={field} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{label}</label>
                  <input
                    type="password"
                    className="chat-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    autoComplete="off"
                  />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stage-launch-btn secondary-btn"
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.35rem 0.65rem",
                      width: "fit-content",
                      textDecoration: "none",
                    }}
                  >
                    <Key size={11} />
                    Get API key — {link.label}
                    <ExternalLink size={11} />
                  </a>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>{link.hint}</p>
                </div>
              );
            })}
          </div>

          {/* Backup & Restore */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <button className="filter-btn" onClick={onExportBackup} title="Download complete JSON snapshot">
              <Download size={13} />
              <span>Export Backup JSON</span>
            </button>

            <label className="filter-btn" style={{ cursor: "pointer" }} title="Restore study notes & progress">
              <Upload size={13} />
              <span>Import Backup JSON</span>
              <input type="file" accept=".json" style={{ display: "none" }} onChange={handleFileImport} />
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button className="stage-launch-btn secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="stage-launch-btn" onClick={handleSave}>
              {savedSuccess ? <><Check size={14} /> <span>Saved!</span></> : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
