export const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", badge: "Fastest", icon: "⚡" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", badge: "Balanced", icon: "✨" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", badge: "Deep Reasoning", icon: "🧠" },
  { id: "groq-llama-3.3-70b-versatile", name: "Groq Llama 3.3 70B", provider: "Groq", badge: "Ultra Low Latency", icon: "🚀" },
  { id: "groq-mixtral-8x7b-32768", name: "Groq Mixtral 8x7B", provider: "Groq", badge: "32k Context", icon: "⚡" },
  { id: "openrouter-anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "OpenRouter", badge: "Top Tier", icon: "💎" },
  { id: "openrouter-deepseek/deepseek-r1", name: "DeepSeek R1", provider: "OpenRouter", badge: "Math / Logic", icon: "🔬" }
];

const KEYS_STORAGE = "ai_hub_react_api_keys";

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

export async function generateAiResponse({ prompt, systemInstruction, keys = {}, preferredModel = "gemini-2.5-flash" }) {
  const stored = readStoredApiKeys();
  const geminiKey = keys.gemini || stored.gemini;
  const groqKey = keys.groq || stored.groq;
  const openRouterKey = keys.openrouter || stored.openrouter;

  try {
    if (preferredModel.startsWith("gemini") || (!groqKey && !openRouterKey)) {
      if (!geminiKey) {
        throw new Error("Google Gemini API key not found. Please add your key in Settings ⚙️.");
      }
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: preferredModel });
    }
    if (preferredModel.startsWith("groq-")) {
      const groqModel = preferredModel.replace("groq-", "");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: groqModel
      });
    }
    if (preferredModel.startsWith("openrouter-")) {
      const orModel = preferredModel.replace("openrouter-", "");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        model: orModel
      });
    }
    throw new Error(`Unknown model id: ${preferredModel}`);
  } catch (err) {
    console.warn(`Primary provider (${preferredModel}) failed:`, err.message);

    if (groqKey && !preferredModel.startsWith("groq-")) {
      console.log("Failing over to Groq Llama-3.3-70B...");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.3-70b-versatile"
      });
    }

    if (geminiKey && preferredModel.startsWith("groq-")) {
      console.log("Failing over to Gemini 2.0 Flash...");
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: "gemini-2.0-flash" });
    }

    throw err;
  }
}

function resolveGeminiApiModel(model) {
  if (model === "gemini-3.7-flash" || model === "gemini-3.8-flash") {
    return "gemini-2.5-flash";
  }
  return model;
}

async function callGemini({ prompt, systemInstruction, apiKey, model }) {
  const apiModel = resolveGeminiApiModel(model);
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
    if (res.status === 404 && apiModel !== "gemini-2.0-flash") {
      console.warn(`Model ${apiModel} returned 404, falling back to gemini-2.0-flash`);
      return callGemini({ prompt, systemInstruction, apiKey, model: "gemini-2.0-flash" });
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
