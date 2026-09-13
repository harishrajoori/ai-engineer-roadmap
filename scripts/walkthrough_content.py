"""Plain-language program and per-course walkthrough (new to AI, data-engineering background)."""

from __future__ import annotations

from typing import Any

PROGRAM_WALKTHROUGH: dict[str, Any] = {
    "audience": "You know data engineering (pipelines, warehouses, tests). You are new to AI—we explain every idea in order.",
    "default_theory_level": "beginner",
    "what_is_llm": (
        "An LLM (Large Language Model) is a program that reads text and writes text. "
        "It is not a database and it does not run your SQL. Think of it as a fast assistant that "
        "can draft or classify text—but it can be wrong, so you validate outputs the same way you "
        "catch bad rows in a pipeline."
    ),
    "what_you_build_overall": (
        "One practice GitHub project grows each month: turn messy log-like text into typed JSON, "
        "then add gateway logging, agents, search, tests in CI, and deploy docs. All on synthetic or public data."
    ),
    "first_three_clicks": [
        "Click **Start step 1** on the home page (or Course 0 → first Watch topic).",
        "Open the **Theory** tab, stay on **Beginner**, read the short guide.",
        "Open the **Lecture** tab and watch only this topic's video—not the whole channel.",
    ],
    "every_topic_same_order": [
        "Theory (Beginner) — plain English and data-pipeline analogies.",
        "Lecture — video or article for this checkbox only.",
        "More resources — only if you are stuck.",
        "Lab & Prove — when the topic asks for code or a link.",
    ],
    "every_course_same_order": [
        "Open **Course overview** once to see the map and end-of-course goal.",
        "Do topics **top to bottom** in the middle panel (Watch → Read → Build → Prove).",
        "Start at the topic marked **START HERE**.",
        "Finish the month with the **Prove** line and paste your link in Lab & Prove.",
    ],
    "phases": [
        {
            "id": "foundation",
            "label": "Phase 1 — Understand AI & typed output",
            "courses": [0, 1],
            "plain": "Learn what an LLM is, then force model output into JSON schemas you can test.",
        },
        {
            "id": "platform",
            "label": "Phase 2 — Agents, tools, and search",
            "courses": list(range(2, 7)),
            "plain": "Orchestrate steps like a workflow, expose safe tools, add document search.",
        },
        {
            "id": "quality",
            "label": "Phase 3 — Tests, policy, and shipping",
            "courses": list(range(7, 13)),
            "plain": "Golden tests in CI, permissions, traces, then integrate and deploy.",
        },
        {
            "id": "career",
            "label": "Phase 4 — Depth & portfolio",
            "courses": [13, 14, 15],
            "plain": "Optional frontier slice, public write-ups, interview stories.",
        },
    ],
    "studio_panels_plain": {
        "left": "Course list — work in order 0, 1, 2…",
        "middle": "Topic checklist for the selected course — do them in order.",
        "center": "Theory, lecture, and lab for the topic you clicked.",
        "right": "Notes and optional AI mentor (needs your API key in Settings).",
    },
}

COURSE_WALKTHROUGH: dict[str, dict[str, Any]] = {
    "0": {
        "plain_title": "Foundation week — your first LLM vocabulary",
        "in_plain_english": "You will learn what an LLM is, why it hallucinates, and how to turn messy text into validated JSON using Python tools you already use in data work.",
        "learning_objectives": [
            "Explain LLM inference in plain language (tokens, context, hallucination).",
            "Extract one log-like record into a Pydantic model with Instructor retries.",
            "Run a golden-set scorer and publish a public repo with a README metric.",
        ],
        "start_here_label": "Karpathy — Intro to LLMs",
        "topic_order": "Watch (both videos) → Read (docs) → Build (your repo) → Prove (GitHub link).",
        "end_of_course": "A public repo that scores how often your extractor returns valid JSON on a small golden set.",
        "do_not_worry_about": "Training models, GPUs, or math proofs—only using models through an API.",
    },
    "1": {
        "plain_title": "Month 1 — LLM basics and a gateway",
        "in_plain_english": "Deeper mental models (tokens, cost, latency) and a single front door (LiteLLM) so every model call is logged like a billed query.",
        "learning_objectives": [
            "Relate token volume to latency and cost on real CLI calls.",
            "Ship LiteLLM routing with per-request logging (v0.2).",
            "Document adopt/defer decisions from Applied LLMs and Instructor reads.",
        ],
        "start_here_label": "DL.AI / Karpathy foundations (first required Watch in the list)",
        "topic_order": "Watch → Read → Build (tag v0.2) → Prove.",
        "end_of_course": "Release v0.2 with a README table: model, tokens, latency, cost per request.",
        "do_not_worry_about": "Optional 16-hour playlists—only the modules named on each line.",
    },
    "2": {
        "plain_title": "Month 2 — Workflows with LangGraph",
        "in_plain_english": "Chain steps with saved state—like Airflow with pause/resume when a human must fix bad data.",
        "learning_objectives": [
            "Model extraction as a LangGraph with checkpoints and clear state schema.",
            "Implement human-in-the-loop on validation failure (interrupt/resume).",
            "Demo fail → fix → resume with README evidence.",
        ],
        "start_here_label": "First Watch topic in this course",
        "topic_order": "Watch → Read → Build → Prove (HITL demo).",
        "end_of_course": "README shows fail → human fix → resume.",
        "do_not_worry_about": "Every LangChain tutorial on the internet—follow this syllabus only.",
    },
    "3": {
        "plain_title": "Month 3 — Tools via MCP",
        "in_plain_english": "Let the model call allow-listed tools (read metadata, fetch a row) with an audit log—never raw warehouse admin.",
        "learning_objectives": [
            "Ship an MCP server with JSON Schema tool definitions.",
            "Enforce read-only, allow-listed tools with audit fields on every call.",
            "Show client + server integration in prove artifacts.",
        ],
        "start_here_label": "First Watch or Read on MCP",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "MCP server demo + sample audit log line.",
        "do_not_worry_about": "Building dozens of tools—one safe tool is enough for the prove gate.",
    },
    "4": {
        "plain_title": "Month 4 — Search before you generate",
        "in_plain_english": "Fetch relevant docs, then answer—like joining to a reference table before computing a metric.",
        "learning_objectives": [
            "Index a public corpus in Qdrant or pgvector with metadata filters.",
            "Run dense vs hybrid retrieval benchmark on labeled questions.",
            "Commit reproducible benchmark table + script.",
        ],
        "start_here_label": "First Watch on retrieval",
        "topic_order": "Watch → Read → Build → Prove (benchmark table).",
        "end_of_course": "Hybrid vs dense recall table on labeled questions.",
        "do_not_worry_about": "Perfect search—measurable improvement is enough.",
    },
    "5": {
        "plain_title": "Month 5 — Parsing documents into chunks",
        "in_plain_english": "Turn PDFs/HTML into chunk files with a stable schema—same care as defining bronze table columns.",
        "learning_objectives": [
            "Parse documents with Docling or LlamaParse into structured blocks.",
            "Emit chunks.jsonl with doc_id, chunk_id, source_page, and parser version.",
            "Validate chunk quality with automated checks in CI.",
        ],
        "start_here_label": "First Watch on parsing",
        "topic_order": "Watch → Build → Prove.",
        "end_of_course": "chunks.jsonl + schema in README.",
        "do_not_worry_about": "Parsing every file format—one pipeline path is enough.",
    },
    "6": {
        "plain_title": "Month 6 — Graph check (small slice)",
        "in_plain_english": "One graph rule to catch bad relationships—not building a full knowledge graph product.",
        "learning_objectives": [
            "Model a tiny graph from your corpus for relationship checks.",
            "Write Cypher (or equivalent) rules that fail on invalid edges.",
            "Prove with a negative test in CI.",
        ],
        "start_here_label": "First Watch or Read",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "One validator test in CI.",
        "do_not_worry_about": "Neo4j production ops—course scope is one validator.",
    },
    "7": {
        "plain_title": "Month 7 — Evaluation harness",
        "in_plain_english": "A folder of labeled examples and a script that scores changes—pytest for AI outputs.",
        "learning_objectives": [
            "Maintain ≥30 labeled golden rows with labeling guidelines.",
            "Run DeepEval/Ragas metrics via python -m evals.run.",
            "Bucket errors (retrieval, schema, semantics) and prioritize labels.",
        ],
        "start_here_label": "First Read on evals",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "≥30 golden cases in git.",
        "do_not_worry_about": "Every metric in the literature—tier 1/2 documented is enough.",
    },
    "8": {
        "plain_title": "Month 8 — CI blocks bad changes",
        "in_plain_english": "If quality drops on the golden set, the PR fails—same culture as dbt tests.",
        "learning_objectives": [
            "Add GitHub Actions workflow running evals on PRs.",
            "Store evals/baseline.json and fail on regression.",
            "Demonstrate CI catching an intentional bad prompt change.",
        ],
        "start_here_label": "First Read on CI",
        "topic_order": "Read → Build → Prove.",
        "end_of_course": "Screenshot or link of CI failing on a bad prompt.",
        "do_not_worry_about": "Flaky cloud GPUs in CI—use small local or mocked runs if needed.",
    },
    "9": {
        "plain_title": "Month 9 — Policy and traces",
        "in_plain_english": "Rules for which tools are allowed plus logs that show what the system did.",
        "learning_objectives": [
            "Enforce OPA policy before tool execution (e.g., block write_* for analysts).",
            "Wire Langfuse (or OTel) across LiteLLM + LangGraph with shared run_id.",
            "Prove with trace screenshot and policy test output.",
        ],
        "start_here_label": "First Watch on tracing or policy",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "Policy test + trace screenshot with run id.",
        "do_not_worry_about": "Enterprise-wide rollout—prove on your repo.",
    },
    "10": {
        "plain_title": "Month 10 — Wire everything together",
        "in_plain_english": "Capstone checklist: ingestion, extract, graph, search, eval, policy in one runnable alpha.",
        "learning_objectives": [
            "Run ingest → gateway (caching) → extract → validate → graph/policy → respond in one command.",
            "Complete capstone checklist rows with trace + eval evidence.",
            "Tag alpha with 5-minute demo script and caching metrics table.",
        ],
        "start_here_label": "First Capstone checklist row",
        "topic_order": "Work the checklist top to bottom, then Prove.",
        "end_of_course": "Git tag alpha + caching evidence.",
        "do_not_worry_about": "Finishing every optional row—required capstone lines first.",
    },
    "11": {
        "plain_title": "Month 11 — Deploy for others",
        "in_plain_english": "Health checks, docs for adding a tool—how another engineer would use your platform.",
        "learning_objectives": [
            "Package stack as Helm chart or docker-compose with health probes.",
            "Deploy LiteLLM gateway as a shared service.",
            "Document how to add a new MCP tool safely.",
        ],
        "start_here_label": "First Read on deploy",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "Deploy screenshot + adding-a-tool doc.",
        "do_not_worry_about": "Multi-region HA—one environment documented is enough.",
    },
    "12": {
        "plain_title": "Month 12 — Lineage and hardening",
        "in_plain_english": "Record which model/chunk influenced an output; document retrieval injection risks.",
        "learning_objectives": [
            "Emit OpenLineage-style lineage JSON from a pipeline run.",
            "Harden using Applied LLMs pitfalls checklist.",
            "Tag v1.0 with lineage artifact and release notes.",
        ],
        "start_here_label": "First Read on lineage",
        "topic_order": "Watch → Read → Build → Prove.",
        "end_of_course": "Tag v1.0 + sample lineage event.",
        "do_not_worry_about": "Full OpenLineage everywhere—one emitted sample is the gate.",
    },
    "13": {
        "plain_title": "Month 13 — Pick one frontier topic",
        "in_plain_english": "Caching, vLLM, or DSPy—one measured before/after story.",
        "learning_objectives": [
            "Choose one frontier track (vLLM, DSPy, caching, semantic cache).",
            "Measure bottleneck before/after with a published table.",
            "Document adopt/defer decision with numbers.",
        ],
        "start_here_label": "Pick one Frontier row",
        "topic_order": "Frontier tracks → Prove.",
        "end_of_course": "README explains why you added X with a metric.",
        "do_not_worry_about": "Doing every frontier track.",
    },
    "14": {
        "plain_title": "Month 14 — Portfolio",
        "in_plain_english": "Turn repo artifacts into posts and resume bullets with numbers.",
        "learning_objectives": [
            "Publish a technical post with traces, evals, or metrics from your repo.",
            "Refresh resume bullets tied to v1.0/alpha tags.",
            "Position story for AI platform vs data engineering roles.",
        ],
        "start_here_label": "First Read on portfolio",
        "topic_order": "Read → Prove.",
        "end_of_course": "Public post link + updated resume bullet.",
        "do_not_worry_about": "Perfect branding—one honest technical post counts.",
    },
    "15": {
        "plain_title": "Month 15 — Interviews",
        "in_plain_english": "Practice telling your capstone story with traces, evals, and safety—not framework trivia.",
        "learning_objectives": [
            "Deliver capstone story with demo trace and eval numbers.",
            "Complete system design mocks using your repo as reference.",
            "Run weekly applications with tailored narratives.",
        ],
        "start_here_label": "First Read or Do item",
        "topic_order": "Watch → Read → Do → Prove.",
        "end_of_course": "Interview notes or offer feedback (private OK).",
        "do_not_worry_about": "Memorizing every algorithm—evidence from your repo is the story.",
    },
}


def walkthrough_for_course(course: int | str) -> dict[str, Any]:
    return dict(COURSE_WALKTHROUGH.get(str(course)) or {})
