# AI Systems Engineer: 15-Month Migration & Learning Platform (2027 Target)

> **Live Command Hub (GitHub Pages):** `https://<YOUR_USERNAME>.github.io/ai-engineer-roadmap/`  
> **Notion Syllabi & Lesson Database:** Automated via `python3 src/sync_notion.py sync`

An enterprise-grade curriculum and interactive tracking platform designed for transitioning from **Staff Data Platform Engineering** to **Senior/Staff AI Systems & AI Platform Engineering** (2027 target).

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

### 1. Launch the Local Learning Hub
```bash
./serve.sh
```
Open **[http://127.0.0.1:8765](http://127.0.0.1:8765)** in your browser for the full cinema-mode lecture player, progress tracker, and interactive notes scratchpad.

### 2. Sync Curriculum to Notion
```bash
cp .env.example .env
# Edit NOTION_TOKEN and NOTION_PARENT_PAGE_ID in .env
python3 src/sync_notion.py setup --parent-page-id "$NOTION_PARENT_PAGE_ID"
python3 src/sync_notion.py sync
python3 src/sync_notion.py import-md --replace
```

---

## 📁 Repository Structure

```
├── docs/
│   ├── AI_System_Engineer_plan_2027.md              # Strategy, market deconstruction, capstone spec
│   ├── AI_System_Engineer_Learning_Track_2027.md    # Canonical Courses 0–15 syllabus
│   ├── AI_System_Engineer_Learning_Track_2027_REFERENCE.md # Granular topics & interview prep
│   └── NOTION_SETUP.md                              # Notion sync setup guide
├── src/
│   ├── generate_lessons.py                          # Parses curriculum markdown to CSV/JSON/HTML
│   ├── sync_notion.py                               # Notion API sync pipeline
│   └── md_to_notion_blocks.py                       # Markdown to Notion rich callout converter
├── data/
│   ├── lessons.json                                 # 145 structured lesson items
│   ├── notion_lessons.csv                           # Notion database CSV
│   └── notion_course_progress.csv                   # Course progress board CSV
├── public/
│   └── index.html                                   # Cyber-luxe single-page learning dashboard
└── .github/workflows/pages.yml                      # Automated GitHub Pages CI/CD
```

---

## 🛡️ IP & Data Privacy Protocol
- All code exercises and capstone platforms run on **100% synthetic telemetry or public datasets**.
- Zero dependency on proprietary employer data or client PII.
- Private developer API keys only.
