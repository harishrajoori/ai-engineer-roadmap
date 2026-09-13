# AI Systems Engineer: 15-Month Migration & Learning Platform (2027 Target)

> **Live Command Hub (GitHub Pages):** [https://harishrajoori.github.io/ai-engineer-roadmap/](https://harishrajoori.github.io/ai-engineer-roadmap/)  
> **Target Level:** Staff / Principal AI System Engineer (2026–2027)

An enterprise-grade curriculum and interactive tracking platform designed for transitioning from **Staff Data Platform Engineering** to **Senior/Staff AI Systems & AI Platform Engineering** (2026–2027 target).

---

## 🏗️ Architecture & Mental Model

```
[Unstructured Logs / Docs / Telemetry]
                  │
                  ▼
  [Deterministic Gateway & Router (LiteLLM)] ──► [Prompt & Semantic Caching]
                  │
                  ▼
  [Structured Extraction & Invariant Checks] ──► (Instructor + Pydantic)
                  │
                  ▼
  [Cyclic State Orchestration (LangGraph)]   ──► [HITL interrupt() on validation failure]
                  │
                  ▼
  [Governed Tool Plane (FastMCP / OPA Gate)] ──► [Scoped Read-only / Rego Policy Check]
                  │
                  ▼
  [Storage & Lineage (Postgres / OpenLineage)]
```

---

## ⚡ Quickstart

### 1. Launch the Local Studio (React + Vite)
```bash
npm install
npm run dev
# or ./serve.sh
```
Open **[http://localhost:8765](http://localhost:8765)** in your browser for the cinema-mode lecture player, multi-agent AI mentor (Gemini 3.x / Groq / OpenRouter), interactive notes scratchpad, and live code architecture lab.

### 2. Build for Production
```bash
npm run build
```
Generates universal production assets in `dist/` which are automatically deployed to GitHub Pages on each push to `main`.

---

## 📁 Repository Structure

```
├── src/
│   ├── components/       # SmartStage, LessonFeed, Inspector, Sidebar, Header, Modals
│   ├── services/         # Multi-provider AI service (Gemini 3.x/2.0/1.5, Groq, OpenRouter)
│   ├── data/             # Bundled lesson data (142 verified curriculum items + blueprints)
│   ├── App.jsx           # Root reactive state manager with local storage & confetti
│   └── index.css         # Dark cyberpunk / obsidian glassmorphism design tokens
├── scripts/              # Data enrichment and curriculum generation utilities
├── docs/                 # Strategy plans, curriculum specifications, and reference blueprints
├── public/               # Static assets and production build preview
└── .github/workflows/    # Automated GitHub Actions Pages deployment
```

---

## 🛡️ IP & Data Privacy Protocol
- All code exercises and capstone platforms run on **100% synthetic telemetry or public datasets**.
- Zero dependency on proprietary employer data or client PII.
- Client-side Bring-Your-Own-Key (BYOK) architecture: AI keys and progress stay 100% in browser `localStorage`.
