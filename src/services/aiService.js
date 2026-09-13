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

/** OpenRouter reserves spend from max_tokens; keep low for free/low-credit accounts. */
const OPENROUTER_MAX_OUTPUT_TOKENS = 1024;
const GROQ_MAX_OUTPUT_TOKENS = 2048;

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

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

function usageFromParts(apiUsage, inputText, outputText) {
  if (apiUsage) {
    const prompt_tokens = apiUsage.prompt_tokens ?? apiUsage.promptTokenCount;
    const completion_tokens = apiUsage.completion_tokens ?? apiUsage.candidatesTokenCount;
    const total_tokens = apiUsage.total_tokens ?? apiUsage.totalTokenCount;
    if (total_tokens || prompt_tokens || completion_tokens) {
      return {
        prompt_tokens: prompt_tokens ?? 0,
        completion_tokens: completion_tokens ?? 0,
        total_tokens: total_tokens ?? (prompt_tokens || 0) + (completion_tokens || 0),
        estimated: false,
      };
    }
  }
  const prompt_tokens = Math.ceil((inputText || "").length / 4);
  const completion_tokens = Math.ceil((outputText || "").length / 4);
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens,
    estimated: true,
  };
}

function messagesToInputText(messages) {
  return (messages || [])
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
}

export async function generateAiResponse({
  prompt,
  systemInstruction,
  messages: chatMessages,
  keys = {},
  preferredModel = DEFAULT_GEMINI_MODEL,
  maxOutputTokens,
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
        messages: chatMessages,
        apiKey: openRouterKey,
        endpoint: OPENROUTER_CHAT_URL,
        model: apiModel,
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
        maxOutputTokens,
      });
    }

    if (provider === "groq") {
      if (!groqKey) {
        throw new Error("Groq API key not found. Get one at console.groq.com/keys and paste it in Settings.");
      }
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: apiModel,
        maxOutputTokens,
      });
    }

    if (geminiKey) {
      return await callGemini({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: geminiKey,
        model: apiModel,
        maxOutputTokens,
      });
    }

    if (openRouterKey) {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: openRouterKey,
        endpoint: OPENROUTER_CHAT_URL,
        model: geminiToOpenRouterModel(apiModel),
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
        maxOutputTokens,
      });
    }

    throw new Error("Google Gemini API key not found. Add a Gemini key, or use OpenRouter as a single key for all models.");
  } catch (err) {
    console.warn(`Primary provider (${model}) failed:`, err.message);

    if (groqKey && provider !== "groq") {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.3-70b-versatile",
        maxOutputTokens,
      });
    }

    if (geminiKey && provider === "groq") {
      return await callGemini({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: geminiKey,
        model: DEFAULT_GEMINI_MODEL,
        maxOutputTokens,
      });
    }

    if (openRouterKey && provider === "gemini") {
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        messages: chatMessages,
        apiKey: openRouterKey,
        endpoint: OPENROUTER_CHAT_URL,
        model: geminiToOpenRouterModel(apiModel),
        referer: typeof window !== "undefined" ? window.location.origin : undefined,
        maxOutputTokens,
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

function resolveOpenAiStyleMessages({ messages, prompt, systemInstruction }) {
  if (messages?.length) {
    return messages;
  }
  const built = [];
  if (systemInstruction) {
    built.push({ role: "system", content: systemInstruction });
  }
  built.push({ role: "user", content: prompt });
  return built;
}

function geminiPayloadFromMessages(openAiMessages, maxOutputTokens) {
  let systemInstruction = null;
  const contents = [];
  for (const msg of openAiMessages) {
    if (msg.role === "system") {
      systemInstruction = msg.content;
      continue;
    }
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: msg.content }] });
  }
  if (!contents.length) {
    contents.push({ role: "user", parts: [{ text: "" }] });
  }
  const payload = {
    contents,
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: maxOutputTokens ?? 4096,
    },
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  return payload;
}

async function callGemini({
  prompt,
  systemInstruction,
  messages,
  apiKey,
  model,
  tried = null,
  maxOutputTokens,
}) {
  const triedModels = tried || new Set();
  const apiModel = resolveGeminiApiModel(model);
  triedModels.add(apiModel);

  const openAiMessages = resolveOpenAiStyleMessages({ messages, prompt, systemInstruction });
  const inputText = messagesToInputText(openAiMessages);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
  const payload = geminiPayloadFromMessages(openAiMessages, maxOutputTokens);

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
        return callGemini({
          prompt,
          systemInstruction,
          messages,
          apiKey,
          model: fallback,
          tried: triedModels,
          maxOutputTokens,
        });
      }
    }
    throw new Error(`Google Gemini Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response returned by Gemini API.");
  }
  const meta = data?.usageMetadata;
  const usage = usageFromParts(
    meta
      ? {
          promptTokenCount: meta.promptTokenCount,
          candidatesTokenCount: meta.candidatesTokenCount,
          totalTokenCount: meta.totalTokenCount,
        }
      : null,
    inputText,
    text,
  );
  return { text, usage };
}

function isOpenRouterEndpoint(endpoint) {
  return (endpoint || "").includes("openrouter.ai");
}

function parseAffordableTokensFromErrorBody(bodyText) {
  const match = /can only afford (\d+)/i.exec(bodyText || "");
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseApiErrorMessage(bodyText) {
  try {
    const parsed = JSON.parse(bodyText);
    return parsed?.error?.message || bodyText;
  } catch {
    return bodyText;
  }
}

/** User-facing mentor error + recovery tips (markdown). */
export function formatMentorApiError(err, preferredModel) {
  const raw = err?.message || String(err);
  const provider = keyProviderForStudioModel(normalizePreferredModel(preferredModel));
  const isCredits =
    raw.includes("402") || /credits/i.test(raw) || /can only afford/i.test(raw);
  const isOpenRouter =
    provider === "openrouter" || raw.includes("openrouter") || isCredits;

  let summary = raw;
  const jsonStart = raw.indexOf("{");
  if (jsonStart !== -1) {
    const parsed = parseApiErrorMessage(raw.slice(jsonStart));
    if (parsed && parsed.length < 800) {
      summary = parsed;
    }
  }

  const lines = [`⚠️ **API notice:** ${summary}`];

  if (isOpenRouter && isCredits) {
    lines.push(
      "",
      "💡 **OpenRouter balance:** This model reserves tokens from your credit balance. Either [add credits](https://openrouter.ai/settings/credits), switch to a **direct Gemini** or **Groq** model in the chat dropdown (free tiers), or ask a shorter question so a smaller reply fits.",
    );
  } else if (provider === "gemini" || raw.includes("Gemini")) {
    lines.push(
      "",
      "💡 Add or refresh your key at [Google AI Studio](https://aistudio.google.com/apikey), then open **Settings** ⚙️.",
    );
  } else {
    lines.push(
      "",
      "💡 Check your API key in **Settings** ⚙️, or use [Google AI Studio](https://aistudio.google.com/apikey) (free Gemini) or [Groq](https://console.groq.com/keys) for direct access without OpenRouter credits.",
    );
  }

  return lines.join("\n");
}

async function callOpenAICompatible({
  prompt,
  systemInstruction,
  messages: chatMessages,
  apiKey,
  endpoint,
  model,
  referer,
  maxOutputTokens,
}) {
  const messages = resolveOpenAiStyleMessages({
    messages: chatMessages,
    prompt,
    systemInstruction,
  });
  const inputText = messagesToInputText(messages);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (referer) {
    headers["HTTP-Referer"] = referer;
    headers["X-Title"] = "AI Systems Engineer Studio";
  }

  const viaOpenRouter = isOpenRouterEndpoint(endpoint);
  const defaultMax = viaOpenRouter ? OPENROUTER_MAX_OUTPUT_TOKENS : GROQ_MAX_OUTPUT_TOKENS;
  let maxTokens = maxOutputTokens ?? defaultMax;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.45,
        max_tokens: maxTokens,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || "";
      const usage = usageFromParts(data?.usage, inputText, text);
      return { text, usage };
    }

    const errBody = await res.text();

    if (viaOpenRouter && res.status === 402) {
      const afford = parseAffordableTokensFromErrorBody(errBody);
      if (afford != null && afford > 32) {
        const nextMax = Math.max(64, Math.min(afford - 24, maxTokens - 1));
        if (nextMax < maxTokens) {
          maxTokens = nextMax;
          continue;
        }
      }
      throw new Error(
        `OpenRouter credits: ${parseApiErrorMessage(errBody)}. Add credits at openrouter.ai/settings/credits or use Gemini/Groq with a direct API key.`,
      );
    }

    throw new Error(`API Error (${res.status}): ${parseApiErrorMessage(errBody)}`);
  }

  throw new Error("API request failed after retries.");
}

/** For validate script / tests. */
export function listCatalogModelIds() {
  return AI_MODEL_CATALOG.map((m) => m.id);
}
