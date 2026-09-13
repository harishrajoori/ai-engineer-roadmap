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

Optional: copy `.env.example` → `.env` and set `VITE_GOOGLE_CLIENT_ID`, or paste the same Web Client ID in **Settings** for Google sign-in.

### 2. Refresh curriculum from markdown
Edit `docs/AI_System_Engineer_Learning_Track_2027.md`, then:
```bash
npm run curriculum
```
This updates `data/lessons.json` and `public/data/lessons.json` (served at runtime; preserves enriched fields like `resources`, `digest`, and `content` when lesson `order` ids match).

### 3. Validate (docs links + app data)
```bash
npm run validate
```
Checks HTTP links in `docs/` and lesson resources, relative doc paths, and React curriculum wiring (`validate:app` + `validate:links`).

### 4. Build for Production
```bash
npm run build
```
Generates universal production assets in `dist/` which are automatically deployed to GitHub Pages on each push to `main`. CI runs lint + validate before build.

---

## 📁 Repository Structure

```
├── src/
│   ├── components/       # SmartStage, LessonFeed, Inspector, Sidebar, Header, Modals
│   ├── services/         # Multi-provider AI service (Gemini 3.x/2.0/1.5, Groq, OpenRouter)
│   ├── data/             # Bundled lesson data (145 curriculum items + blueprints)
│   ├── App.jsx           # Root reactive state manager with local storage & confetti
│   └── index.css         # Dark cyberpunk / obsidian glassmorphism design tokens
├── scripts/              # `generate_lessons.py` (run via `npm run curriculum`)
├── docs/                 # Learning track (curriculum) + Master Plan (strategy & §17 depth)
├── data/                 # Generated `lessons.json` (curriculum snapshot)
├── public/               # Static assets and production build preview
└── .github/workflows/    # Automated GitHub Actions Pages deployment
```

---

## 🛡️ IP & Data Privacy Protocol
- All code exercises and capstone platforms run on **100% synthetic telemetry or public datasets**.
- Zero dependency on proprietary employer data or client PII.
- Client-side Bring-Your-Own-Key (BYOK) architecture: AI keys and progress stay 100% in browser `localStorage`.
