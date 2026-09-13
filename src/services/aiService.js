import {
  AI_MODEL_CATALOG,
  AVAILABLE_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_FALLBACK_CHAIN,
  apiModelIdForStudioModel,
  catalogEntryForModelId,
  keyProviderForStudioModel,
} from "../config/aiModels";

export { AVAILABLE_MODELS, GEMINI_FALLBACK_CHAIN, DEFAULT_GEMINI_MODEL };

const KEYS_STORAGE = "ai_hub_react_api_keys";

const RETIRED_MODEL_MAP = {
  "gemini-2.0-flash": DEFAULT_GEMINI_MODEL,
  "gemini-1.5-pro": "gemini-2.5-flash",
  "gemini-3.6-pro": DEFAULT_GEMINI_MODEL,
  "gemini-3.7-flash": DEFAULT_GEMINI_MODEL,
  "gemini-3.8-flash": DEFAULT_GEMINI_MODEL,
  "groq-mixtral-8x7b-32768": "groq-llama-3.1-8b-instant",
  "openrouter-anthropic/claude-3.7-sonnet": "openrouter-anthropic/claude-sonnet-4.6",
};

/** Remap retired or unknown ids saved in localStorage. */
export function normalizePreferredModel(modelId) {
  const id = (modelId || "").trim();
  if (!id) {
    return DEFAULT_GEMINI_MODEL;
  }
  if (RETIRED_MODEL_MAP[id]) {
    return RETIRED_MODEL_MAP[id];
  }
  if (catalogEntryForModelId(id)) {
    return id;
  }
  if (id.startsWith("gemini")) {
    return DEFAULT_GEMINI_MODEL;
  }
  return id;
}

/** Read API keys from Settings (ai_hub_react_api_keys) with legacy fallbacks. */
export function readStoredApiKeys() {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        gemini: (parsed.gemini || "").trim(),
        groq: (parsed.groq || "").trim(),
        openrouter: (parsed.openrouter || "").trim(),
      };
    }
  } catch {
    /* ignore */
  }
  return {
    gemini: (localStorage.getItem("ai_key_gemini") || "").trim(),
    groq: (localStorage.getItem("ai_key_groq") || "").trim(),
    openrouter: (localStorage.getItem("ai_key_openrouter") || "").trim(),
  };
}

function geminiToOpenRouterModel(geminiApiModel) {
  const bare = geminiApiModel.replace(/^models\//, "");
  return `google/${bare}`;
}

export async function generateAiResponse({
  prompt,
  systemInstruction,
  keys = {},
  preferredModel = DEFAULT_GEMINI_MODEL,
}) {
  const model = normalizePreferredModel(preferredModel);
  const stored = readStoredApiKeys();
  const geminiKey = keys.gemini || stored.gemini;
  const groqKey = keys.groq || stored.groq;
  const openRouterKey = keys.openrouter || stored.openrouter;
  const provider = keyProviderForStudioModel(model);
  const apiModel = apiModelIdForStudioModel(model);

  try {
    if (provider === "openrouter") {
      if (!openRouterKey) {
        throw new Error("OpenRouter API key not found. Get one at openrouter.ai/keys and paste it in Settings.");
      }
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: apiModel,
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
      });
    }

    if (provider === "groq") {
      if (!groqKey) {
        throw new Error("Groq API key not found. Get one at console.groq.com/keys and paste it in Settings.");
      }
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: apiModel,
      });
    }

    if (geminiKey) {
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: apiModel });
    }

    if (openRouterKey) {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: geminiToOpenRouterModel(apiModel),
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
      });
    }

    throw new Error("Google Gemini API key not found. Add a Gemini key, or use OpenRouter as a single key for all models.");
  } catch (err) {
    console.warn(`Primary provider (${model}) failed:`, err.message);

    if (groqKey && provider !== "groq") {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.3-70b-versatile",
      });
    }

    if (geminiKey && provider === "groq") {
      return await callGemini({
        prompt,
        systemInstruction,
        apiKey: geminiKey,
        model: DEFAULT_GEMINI_MODEL,
      });
    }

    if (openRouterKey && provider === "gemini") {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: geminiToOpenRouterModel(apiModel),
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
      });
    }

    throw err;
  }
}

function resolveGeminiApiModel(model) {
  const api = apiModelIdForStudioModel(normalizePreferredModel(model));
  return api.startsWith("gemini") ? api : DEFAULT_GEMINI_MODEL;
}

function nextGeminiFallback(currentModel, tried) {
  const current = resolveGeminiApiModel(currentModel);
  for (const candidate of GEMINI_FALLBACK_CHAIN) {
    if (candidate !== current && !tried.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function callGemini({ prompt, systemInstruction, apiKey, model, tried = null }) {
  const triedModels = tried || new Set();
  const apiModel = resolveGeminiApiModel(model);
  triedModels.add(apiModel);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 4096,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 404) {
      const fallback = nextGeminiFallback(apiModel, triedModels);
      if (fallback) {
        console.warn(`Model ${apiModel} returned 404, falling back to ${fallback}`);
        return callGemini({ prompt, systemInstruction, apiKey, model: fallback, tried: triedModels });
      }
    }
    throw new Error(`Google Gemini Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response returned by Gemini API.");
  }
  return text;
}

async function callOpenAICompatible({ prompt, systemInstruction, apiKey, endpoint, model, referer }) {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (referer) {
    headers["HTTP-Referer"] = referer;
    headers["X-Title"] = "AI Systems Engineer Studio";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.45,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

/** For validate script / tests. */
export function listCatalogModelIds() {
  return AI_MODEL_CATALOG.map((m) => m.id);
}
