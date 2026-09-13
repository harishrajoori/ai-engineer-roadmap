/**
 * Curated models with real provider API ids (no placeholder entries).
 * Live probe: npm run validate:models (requires keys in env).
 */

export const PROVIDER_KEY_LINKS = {
  gemini: {
    label: "Google AI Studio",
    hint: "Free tier for Gemini models (direct API)",
    url: "https://aistudio.google.com/apikey",
  },
  groq: {
    label: "GroqCloud",
    hint: "Fast open-weight models (Llama, etc.)",
    url: "https://console.groq.com/keys",
  },
  openrouter: {
    label: "OpenRouter",
    hint: "One key for Gemini, Claude, DeepSeek, and more",
    url: "https://openrouter.ai/keys",
  },
};

/** @typedef {'gemini' | 'groq' | 'openrouter'} KeyProvider */

/**
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   provider: string,
 *   badge: string,
 *   icon: string,
 *   keyProvider: KeyProvider,
 *   apiModel: string,
 * }>}
 */
export const AI_MODEL_CATALOG = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    provider: "Google",
    badge: "Latest",
    icon: "⚡",
    keyProvider: "gemini",
    apiModel: "gemini-3.6-flash",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    badge: "Stable",
    icon: "✨",
    keyProvider: "gemini",
    apiModel: "gemini-2.5-flash",
  },
  {
    id: "groq-llama-3.3-70b-versatile",
    name: "Groq Llama 3.3 70B",
    provider: "Groq",
    badge: "Low latency",
    icon: "🚀",
    keyProvider: "groq",
    apiModel: "llama-3.3-70b-versatile",
  },
  {
    id: "groq-llama-3.1-8b-instant",
    name: "Groq Llama 3.1 8B Instant",
    provider: "Groq",
    badge: "Fastest",
    icon: "⚡",
    keyProvider: "groq",
    apiModel: "llama-3.1-8b-instant",
  },
  {
    id: "openrouter-google/gemini-3.6-flash",
    name: "Gemini 3.6 Flash (via OpenRouter)",
    provider: "OpenRouter",
    badge: "Unified key",
    icon: "🔀",
    keyProvider: "openrouter",
    apiModel: "google/gemini-3.6-flash",
  },
  {
    id: "openrouter-anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6 (OpenRouter)",
    provider: "OpenRouter",
    badge: "Reasoning",
    icon: "💎",
    keyProvider: "openrouter",
    apiModel: "anthropic/claude-sonnet-4.6",
  },
  {
    id: "openrouter-deepseek/deepseek-r1",
    name: "DeepSeek R1 (OpenRouter)",
    provider: "OpenRouter",
    badge: "Math / logic",
    icon: "🔬",
    keyProvider: "openrouter",
    apiModel: "deepseek/deepseek-r1",
  },
];

export const GEMINI_FALLBACK_CHAIN = ["gemini-3.6-flash", "gemini-2.5-flash"];

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

/** UI dropdown shape (legacy export name). */
export const AVAILABLE_MODELS = AI_MODEL_CATALOG.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
  badge: m.badge,
  icon: m.icon,
}));

export function catalogEntryForModelId(modelId) {
  const id = (modelId || "").trim();
  return AI_MODEL_CATALOG.find((m) => m.id === id) || null;
}

export function apiModelIdForStudioModel(modelId) {
  const entry = catalogEntryForModelId(modelId);
  if (entry) {
    return entry.apiModel;
  }
  if (modelId?.startsWith("groq-")) {
    return modelId.replace("groq-", "");
  }
  if (modelId?.startsWith("openrouter-")) {
    return modelId.replace("openrouter-", "");
  }
  return modelId;
}

export function keyProviderForStudioModel(modelId) {
  const entry = catalogEntryForModelId(modelId);
  if (entry) {
    return entry.keyProvider;
  }
  if (modelId?.startsWith("groq-")) {
    return "groq";
  }
  if (modelId?.startsWith("openrouter-")) {
    return "openrouter";
  }
  if (modelId?.startsWith("gemini")) {
    return "gemini";
  }
  return "gemini";
}
