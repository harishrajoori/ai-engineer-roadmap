export const GEMINI_FALLBACK_CHAIN = ["gemini-3.6-flash", "gemini-3.6-flash", "gemini-1.5-pro"];

export const AVAILABLE_MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google", badge: "Latest", icon: "⚡" },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google", badge: "Stable", icon: "✨" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", badge: "Deep Reasoning", icon: "🧠" },
  { id: "groq-llama-3.3-70b-versatile", name: "Groq Llama 3.3 70B", provider: "Groq", badge: "Ultra Low Latency", icon: "🚀" },
  { id: "groq-mixtral-8x7b-32768", name: "Groq Mixtral 8x7B", provider: "Groq", badge: "32k Context", icon: "⚡" },
  { id: "openrouter-anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "OpenRouter", badge: "Top Tier", icon: "💎" },
  { id: "openrouter-deepseek/deepseek-r1", name: "DeepSeek R1", provider: "OpenRouter", badge: "Math / Logic", icon: "🔬" }
];

const KEYS_STORAGE = "ai_hub_react_api_keys";

const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

/** Remap retired or unknown Gemini ids saved in localStorage. */
export function normalizePreferredModel(modelId) {
  const id = (modelId || "").trim();
  const retired = new Set([
    "gemini-3.6-pro",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ]);
  if (!id || retired.has(id)) {
    return DEFAULT_GEMINI_MODEL;
  }
  if (id.startsWith("gemini") && !AVAILABLE_MODELS.some((m) => m.id === id)) {
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
        openrouter: (parsed.openrouter || "").trim()
      };
    }
  } catch {
    /* ignore */
  }
  return {
    gemini: (localStorage.getItem("ai_key_gemini") || "").trim(),
    groq: (localStorage.getItem("ai_key_groq") || "").trim(),
    openrouter: (localStorage.getItem("ai_key_openrouter") || "").trim()
  };
}

// Multi-Provider AI Engine (Gemini, Groq, OpenRouter) with Auto-Failover

export async function generateAiResponse({ prompt, systemInstruction, keys = {}, preferredModel = DEFAULT_GEMINI_MODEL }) {
  const model = normalizePreferredModel(preferredModel);
  const stored = readStoredApiKeys();
  const geminiKey = keys.gemini || stored.gemini;
  const groqKey = keys.groq || stored.groq;
  const openRouterKey = keys.openrouter || stored.openrouter;

  try {
    if (model.startsWith("gemini") || (!groqKey && !openRouterKey)) {
      if (!geminiKey) {
        throw new Error("Google Gemini API key not found. Please add your key in Settings ⚙️.");
      }
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model });
    }
    if (model.startsWith("groq-")) {
      const groqModel = model.replace("groq-", "");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: groqModel
      });
    }
    if (model.startsWith("openrouter-")) {
      const orModel = model.replace("openrouter-", "");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: orModel
      });
    }
    throw new Error(`Unknown model id: ${model}`);
  } catch (err) {
    console.warn(`Primary provider (${model}) failed:`, err.message);

    if (groqKey && !model.startsWith("groq-")) {
      console.log("Failing over to Groq Llama-3.3-70B...");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.3-70b-versatile"
      });
    }

    if (geminiKey && model.startsWith("groq-")) {
      console.log(`Failing over to ${DEFAULT_GEMINI_MODEL}...`);
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: DEFAULT_GEMINI_MODEL });
    }

    throw err;
  }
}

function resolveGeminiApiModel(model) {
  return normalizePreferredModel(model);
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
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
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

async function callOpenAICompatible({ prompt, systemInstruction, apiKey, endpoint, model }) {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
