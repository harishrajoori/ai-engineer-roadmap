/**
 * Validate curated model catalog (static) and optionally probe live APIs.
 *
 *   npm run validate:models          # static only
 *   GEMINI_API_KEY=... npm run validate:models -- --live
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, "../src/config/aiModels.js");
const live = process.argv.includes("--live");

const src = readFileSync(catalogPath, "utf8");
const idMatches = [...src.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
const apiMatches = [...src.matchAll(/apiModel:\s*"([^"]+)"/g)].map((m) => m[1]);

const errors = [];
if (idMatches.length !== apiMatches.length) {
  errors.push("id/apiModel count mismatch in aiModels.js");
}
const idSet = new Set();
for (const id of idMatches) {
  if (idSet.has(id)) {
    errors.push(`Duplicate catalog id: ${id}`);
  }
  idSet.add(id);
}

if (errors.length) {
  console.error("STATIC VALIDATION FAILED");
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}

console.log(`STATIC OK — ${idMatches.length} curated models`);

if (!live) {
  console.log("Skipping live probe (pass --live and provider env keys to test APIs).");
  process.exit(0);
}

const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

const probes = [
  {
    name: "gemini-3.6-flash",
    run: async () => {
      if (!geminiKey) return "skip (no GEMINI_API_KEY)";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Reply with exactly: ok" }] }] }),
      });
      if (!res.ok) return `fail ${res.status}: ${(await res.text()).slice(0, 200)}`;
      return "ok";
    },
  },
  {
    name: "groq-llama-3.3-70b-versatile",
    run: async () => {
      if (!groqKey) return "skip (no GROQ_API_KEY)";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Reply with exactly: ok" }],
          max_tokens: 8,
        }),
      });
      if (!res.ok) return `fail ${res.status}: ${(await res.text()).slice(0, 200)}`;
      return "ok";
    },
  },
  {
    name: "openrouter-google/gemini-3.6-flash",
    run: async () => {
      if (!openRouterKey) return "skip (no OPENROUTER_API_KEY)";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [{ role: "user", content: "Reply with exactly: ok" }],
          max_tokens: 8,
        }),
      });
      if (!res.ok) return `fail ${res.status}: ${(await res.text()).slice(0, 200)}`;
      return "ok";
    },
  },
];

let liveFailed = false;
for (const p of probes) {
  const result = await p.run();
  console.log(`  ${p.name}: ${result}`);
  if (result.startsWith("fail")) {
    liveFailed = true;
  }
}

if (liveFailed) {
  process.exit(1);
}
