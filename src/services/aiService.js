// Multi-Provider AI Engine (Gemini 3.x, Groq, OpenRouter) with Auto-Failover

export async function generateAiResponse({ prompt, systemInstruction, keys = {}, preferredModel = 'gemini-3.7-flash' }) {
  const geminiKey = keys.gemini || localStorage.getItem('ai_key_gemini') || '';
  const groqKey = keys.groq || localStorage.getItem('ai_key_groq') || '';
  const openRouterKey = keys.openrouter || localStorage.getItem('ai_key_openrouter') || '';

  // Attempt 1: Preferred Provider
  try {
    if (preferredModel.startsWith('gemini') || (!groqKey && !openRouterKey)) {
      if (!geminiKey) {
        throw new Error("Google Gemini API key not found. Please add your key in Settings ⚙️.");
      }
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: preferredModel });
    } else if (preferredModel.startsWith('groq-')) {
      const groqModel = preferredModel.replace('groq-', '');
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: groqModel
      });
    } else if (preferredModel.startsWith('openrouter-')) {
      const orModel = preferredModel.replace('openrouter-', '');
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: openRouterKey,
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        model: orModel
      });
    }
  } catch (err) {
    console.warn(`Primary provider (${preferredModel}) failed:`, err.message);
    
    // Auto-Failover to secondary provider if available
    if (groqKey && !preferredModel.startsWith('groq-')) {
      console.log("Failing over to Groq Llama-3.3-70B...");
      return await callOpenAICompatible({
        prompt,
        systemInstruction,
        apiKey: groqKey,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile'
      });
    }

    if (geminiKey && preferredModel.startsWith('groq-')) {
      console.log("Failing over to Gemini 2.0 Flash...");
      return await callGemini({ prompt, systemInstruction, apiKey: geminiKey, model: 'gemini-2.0-flash' });
    }

    throw err;
  }
}

async function callGemini({ prompt, systemInstruction, apiKey, model }) {
  // Map clean names to API model endpoints
  let apiModel = model;
  if (model === 'gemini-3.7-flash') apiModel = 'gemini-2.5-flash'; // Fallback mapping if preview alias
  if (model === 'gemini-3.8-flash') apiModel = 'gemini-2.0-flash'; 
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    // If specific preview model not found, auto-retry with gemini-2.0-flash
    if (res.status === 404 && model !== 'gemini-2.0-flash') {
      console.warn(`Model ${model} returned 404, falling back to gemini-2.0-flash`);
      return callGemini({ prompt, systemInstruction, apiKey, model: 'gemini-2.0-flash' });
    }
    throw new Error(`Google Gemini Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response returned by Gemini API.");
  return text;
}

async function callOpenAICompatible({ prompt, systemInstruction, apiKey, endpoint, model }) {
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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
