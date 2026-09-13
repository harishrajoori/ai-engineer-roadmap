"""Handbook entries orders 1–30 (Course 0–2 start)."""

from __future__ import annotations

from typing import Any


def entries() -> dict[int, dict[str, Any]]:
    return {
        1: {
            "one_liner": "Karpathy explains LLMs as next-token predictors: training vs inference, why they sound confident when wrong, and what a context window really means.",
            "why_now": "Every later topic assumes you know the model is not a database—you validate outputs like bad rows in a pipeline.",
            "mental_model": "LLM = stateless text function with a max input size; your platform owns schemas, retries, and tests around it.",
            "beginner_extra": (
                "When Karpathy talks about tokens, think **columns in a wide string**: the model only sees a limited window at once. "
                "When he talks about hallucination, think **synthetic rows** that pass a vibe check but fail a join to ground truth."
            ),
            "intermediate_deep_dive": (
                "Use this video to draw a one-page diagram: **training** (offline, expensive, not your job in this track) vs **inference** "
                "(online API calls you pay per token). Note three production knobs you will reuse in Course 1: max tokens, temperature, and timeout. "
                "After watching, write a README section ‘What we trust the model for’ vs ‘What we always validate’—that becomes your team policy seed."
            ),
            "advanced_extra": (
                "Platform framing: treat inference as a **multi-tenant, rate-limited dependency** with fat-tailed latency. "
                "Capacity planning starts with tokens-per-record distributions on your golden set, not GPU specs. "
                "Security: prompt injection is input validation; never concatenate untrusted log lines into system prompts without sanitization boundaries. "
                "For interviews, articulate pretrain/finetune/prompt/RAG as a **cost ladder**—you default to prompt+schema until evals prove you need the next rung."
            ),
            "watch_for": [
                "Training vs inference—what runs in your AWS bill monthly",
                "Context window as a hard limit (truncation policy)",
                "Why scale changes capability but not the need for verification",
                "Sampling / temperature as a stability lever for extraction",
            ],
            "failure_modes": [
                "Treating model prose as ground truth without schema validation",
                "Unbounded prompts on large logs → cost spikes and timeouts",
                "No logging of prompt hash + model version for incident replay",
            ],
            "interview_prompts": [
                "Explain LLMs to a data engineer without saying ‘AI magic.’",
                "Where would you enforce max context for log extraction?",
                "How do you detect and respond to a provider outage?",
            ],
            "capstone_action": "README: 3 bullets—failure mode, log field, test you will add.",
            "done_when": "You can sketch input → model → validated JSON on one diagram.",
        },
        2: {
            "one_liner": "Hands-on Pydantic patterns so LLM outputs become typed records you can unit test like warehouse rows.",
            "why_now": "Immediately after the mental model video—you need a concrete contract between messy text and your reconciler code.",
            "mental_model": "Pydantic model = table DDL for one API response; validation errors are rejected rows.",
            "beginner_extra": (
                "The course shows models, validators, and retries. You do not need every Pydantic feature—copy the **smallest** model "
                "that matches your log event schema and grow fields only when the golden set proves you need them."
            ),
            "intermediate_deep_dive": (
                "Map each lesson exercise to your `LogEvent` (or similar): required fields, optional metadata, enums for severity. "
                "Decide **fail closed** on unknown keys vs strip unknowns—default fail closed for finance-adjacent logs. "
                "Pair the course with Instructor (next reads): Pydantic defines shape; Instructor enforces shape against live model output."
            ),
            "advanced_extra": (
                "Schema evolution: version models (`LogEventV1`) and migrate with shadow validation before flipping prod. "
                "Custom validators belong at the boundary; do not sprinkle business rules inside prompt text only. "
                "Measure **validation error taxonomy** (missing field vs wrong enum vs semantic wrong amount) separately in metrics—retries help syntax, not semantics. "
                "Interview: compare Pydantic validation to Great Expectations / JSON Schema in a CDC stream."
            ),
            "watch_for": [
                "Defining nested models for real log shapes",
                "When the course retries vs when you fix the prompt",
                "Optional vs required fields tradeoffs",
            ],
            "failure_modes": [
                "Coercing invalid types silently (`.model_construct` abuse)",
                "Huge nested models that explode token usage in tool schemas",
                "No version field on extracted records",
            ],
            "interview_prompts": [
                "How do you migrate a Pydantic model without breaking consumers?",
                "When is a repair prompt better than a third retry?",
            ],
            "capstone_action": "Mirror one course pattern in `extract()` with explicit `ValidationError` handling.",
            "done_when": "Golden set shows valid JSON % and you can explain each field’s business meaning.",
        },
        3: {
            "one_liner": "Instructor wraps chat completions so responses must parse into your Pydantic models, with retries on validation failure.",
            "why_now": "This is the adapter between probabilistic text and deterministic Python objects in your boot-week repo.",
            "mental_model": "Instructor = typed client SDK over an untrusted HTTP API.",
            "beginner_extra": (
                "Start with the quick start: one model, one function, one golden example. "
                "Retries are not free—each retry is another billed call."
            ),
            "intermediate_deep_dive": (
                "Read retries and partial validation sections with your golden set open. "
                "Define `max_retries`, backoff, and a **repair** system message template. "
                "Log every attempt with `attempt`, `model`, and validation error class."
            ),
            "advanced_extra": (
                "Wrap Instructor calls in a **budgeted** function: max dollars per record, circuit breaker on error rate. "
                "For multi-record batches, prefer row-level extraction over giant array JSON—easier to retry partial failures. "
                "Compare Instructor to Outlines/constrained decoding: Instructor is faster to ship; constrained decoding when latency and guarantee matter at scale."
            ),
            "read_sections": ["Quick start", "Retries", "Validators", "Partial validation"],
            "failure_modes": [
                "Infinite retries on semantic errors",
                "Logging raw prompts containing PII",
                "Same temperature on repair as on first pass (often too creative)",
            ],
            "interview_prompts": [
                "Design an extraction API with idempotency keys.",
                "How do you test Instructor integrations without flaky CI?",
            ],
            "capstone_action": "Implement `extract(record) -> LogEvent` with capped retries and structured logs.",
            "done_when": "`scripts/score.py` reports valid % you trust on labeled data.",
        },
        4: {
            "one_liner": "Pydantic V2 is the reference for validators, model validators, and settings—your schema source of truth.",
            "why_now": "Instructor inherits Pydantic semantics; misunderstandings here become silent data bugs downstream.",
            "mental_model": "Docs = DDL + CHECK constraints for Python objects.",
            "beginner_extra": "Focus on Models, Field(), and `@model_validator`—skip exotic serialization until you need it.",
            "intermediate_deep_dive": (
                "Implement cross-field rules (e.g., end_time after start_time) in validators, not prompts. "
                "Document error messages—they become operator runbooks when extraction fails in prod."
            ),
            "advanced_extra": (
                "Use discriminated unions when log types differ materially. "
                "Performance: validate at boundary once; avoid re-parsing dicts in inner loops. "
                "For compliance, keep audit trail of schema hash in each extracted record."
            ),
            "read_sections": ["Models", "Validators", "Model validators", "Serialization"],
            "failure_modes": ["Validator logic only in prompts", "Breaking changes without version bump"],
            "interview_prompts": ["Field validator vs model validator—when to use which?"],
            "capstone_action": "Add one `@model_validator` for a business invariant on your event model.",
            "done_when": "Invalid golden rows fail with readable errors in CI.",
        },
        5: {
            "one_liner": "LiteLLM reliable completions: fallbacks, timeouts, and routing when a provider throttles or errors.",
            "why_now": "Boot week preview of Course 1 gateway—your extractor should not fail closed on a single 429.",
            "mental_model": "Fallback chain = multi-source ingestion with priority list.",
            "beginner_extra": "Read fallbacks as ‘if primary warehouse is down, read replica’—same idea for models.",
            "intermediate_deep_dive": (
                "Configure primary + fallback models; log `model_used` per request. "
                "Set aggressive timeouts for batch jobs vs interactive CLI."
            ),
            "advanced_extra": (
                "Alert when fallback rate > baseline—often quality regression. "
                "Keep fallback models on comparable schema contracts; do not fork prompts per model without eval diff."
            ),
            "read_sections": ["Reliable completions", "Fallbacks", "Timeouts", "Router"],
            "failure_modes": ["Silent model switch without audit", "Unbounded fallback spend"],
            "interview_prompts": ["How do you test failover without production incidents?"],
            "capstone_action": "Wire fallback in dev; document in README with a forced failure test.",
            "done_when": "You can demo primary failure → fallback success with logs.",
        },
        6: {
            "one_liner": "Hamel’s evals essay: golden sets, metric tiers, and why launch without regression tests fails.",
            "why_now": "Sets the quality culture before you scale features in later courses.",
            "mental_model": "Golden set = labeled fixture table for a non-deterministic UDF.",
            "beginner_extra": "You are building pytest for prompts—not chasing a single accuracy number on day one.",
            "intermediate_deep_dive": (
                "Create `data/golden/` with diverse failure types: malformed logs, ambiguous amounts, injection-ish strings. "
                "Label both **schema** and **semantic** correctness where possible."
            ),
            "advanced_extra": (
                "Tier metrics: L0 schema pass, L1 field accuracy, L2 business KPI. "
                "Block releases on L0/L1; investigate L2 with humans. "
                "Store golden set in git; review label changes like code."
            ),
            "read_sections": ["Why evals", "Golden sets", "Error analysis", "What not to do"],
            "failure_modes": ["10-example toy set", "Labels without reviewer agreement"],
            "interview_prompts": ["How big should a golden set be before v1 launch?"],
            "capstone_action": "Commit ≥10 labeled examples and a scorer script output.",
            "done_when": "You can explain what would block a release on your project.",
        },
        7: {
            "one_liner": "Applied LLMs handbook—production patterns for gateways, RAG, agents, and evals (read as a map, not a novel).",
            "why_now": "Gives vocabulary for architecture reviews you will repeat monthly; first pass in boot week, deeper passes later.",
            "mental_model": "Handbook = internal RFC index for LLM platforms.",
            "beginner_extra": "Skim the table of contents; read only sections named on your syllabus line for this course.",
            "intermediate_deep_dive": (
                "For Course 0, focus on extraction + validation + observability chapters. "
                "Write one ADR: pattern adopted (e.g., schema-first extraction), pattern deferred (e.g., fine-tuning)."
            ),
            "advanced_extra": (
                "Cross-reference handbook patterns with your repo: where is gateway, where is eval harness, where is human review. "
                "Use handbook language in design docs so staff engineers recognize tradeoffs quickly."
            ),
            "read_sections": ["Structured outputs", "Evaluation", "Observability", "Failure modes"],
            "failure_modes": ["Reading cover-to-cover without shipping", "Quoting patterns without metrics"],
            "interview_prompts": ["Name one handbook pattern you adopted and one you rejected—why?"],
            "capstone_action": "README ADR snippet: adopted vs deferred pattern with rationale.",
            "done_when": "You can cite one concrete idea from the handbook in a design sentence.",
        },
        8: {
            "one_liner": "Create the capstone repo: production-log-reconciler (or telemetry-log-reconciler) with README, golden folder, and extract stub.",
            "why_now": "All later courses attach to this repo—treat it like a platform monorepo, not homework.",
            "mental_model": "Repo = mini data product: ingest → extract → validate → score.",
            "beginner_extra": "Public GitHub is fine; use synthetic or public sample logs only—no employer data.",
            "intermediate_deep_dive": (
                "Scaffold: `src/`, `data/golden/`, `scripts/score.py`, Makefile or `uv run`, CI placeholder. "
                "README must explain how to run score locally in <5 commands."
            ),
            "advanced_extra": (
                "Add CODEOWNERS-style clarity: what is in scope for boot week vs later tags. "
                "Pre-commit for ruff/format; pin dependencies; document Python version."
            ),
            "failure_modes": ["Secrets in repo", "No reproducible install story"],
            "interview_prompts": ["Walk through repo layout like a system design whiteboard."],
            "capstone_action": "Initialize repo; first commit with README + golden folder + stub extract.",
            "done_when": "Clone → install → score runs (even if 0% valid).",
        },
        9: {
            "one_liner": "Prove boot week: public GitHub URL plus README metric from golden-set scoring.",
            "why_now": "Teaches evidence-based completion—same bar as production change tickets.",
            "mental_model": "Prove = link + metric a stranger can verify in 10 minutes.",
            "beginner_extra": "Paste the repo URL in Lab & Prove; ensure README shows the valid JSON percentage.",
            "intermediate_deep_dive": (
                "README table: command, sample output, valid %, date. "
                "Optional: badge or screenshot of scorer output."
            ),
            "advanced_extra": (
                "Add CONTRIBUTING with how to add golden rows—signals platform maturity in interviews."
            ),
            "failure_modes": ["Private repo without access", "Metric without reproducible command"],
            "interview_prompts": ["How would an interviewer verify your boot week claim live?"],
            "capstone_action": "Publish URL; ensure README golden-set metric is current.",
            "done_when": "Course 0 acceptance table satisfied; link saved in studio.",
        },
        10: {
            "one_liner": "DL.AI Generative AI with LLMs course hub—modular videos on transformers, training, and deployment (time-boxed).",
            "why_now": "Month 1 deepens foundations before you wire LiteLLM; do not attempt the entire specialization.",
            "mental_model": "Course hub = playlist you curate against syllabus headings only.",
            "beginner_extra": "Pick modules on tokens, fine-tuning vs prompting, and deployment—skip research-heavy units unless optional.",
            "intermediate_deep_dive": (
                "Align each module you watch to a README note: new term defined, new risk for your extractor. "
                "Pair with Karpathy deep dive (next topic) for inference-centric view."
            ),
            "advanced_extra": (
                "Document which modules you skipped and why—interviewers prefer honest scope to fake completion. "
                "Relate transformer intuition to cost: longer contexts in prompts directly map to gateway bills."
            ),
            "watch_for": ["Tokenization", "Fine-tuning vs prompting", "Deployment constraints"],
            "failure_modes": ["Trying to finish all modules", "Notes without connection to repo"],
            "interview_prompts": ["When would you fine-tune vs RAG vs prompt-only?"],
            "capstone_action": "README ‘Month 1 notes’ with 5 terms tied to your gateway design.",
            "done_when": "You can explain one module’s idea without reading slides.",
        },
        11: {
            "one_liner": "Karpathy deep dive: transformers, KV cache, and inference mechanics that explain latency and cost.",
            "why_now": "Connects Course 1 gateway metrics (TTFT, tokens) to what the stack is actually doing.",
            "mental_model": "Attention = pairwise context mixing; KV cache = amortizing work across generated tokens.",
            "beginner_extra": "You do not need to derive math—capture what grows with sequence length and batch size.",
            "intermediate_deep_dive": (
                "While watching, build a table: knob → effect on latency/cost (context length, batch, model size). "
                "Apply to your logging use case: prefer short JSON outputs."
            ),
            "advanced_extra": (
                "Discuss speculative decoding / caching only as future optimizations—document baseline first. "
                "For self-hosted path (Month 13), this video is the prerequisite to reading vLLM docs."
            ),
            "watch_for": ["Transformer block", "KV cache intuition", "Sampling parameters"],
            "failure_modes": ["Optimizing GPUs before golden-set quality plateaus"],
            "interview_prompts": ["Why does TTFT spike with long prompts?"],
            "capstone_action": "Log prompt/completion tokens for one CLI call with interpretation.",
            "done_when": "One paragraph relates P99 latency to token volume.",
        },
        12: {
            "one_liner": "3Blue1Brown visual intuition for neural nets and attention—optional math depth for embeddings later.",
            "why_now": "Helps when Month 4–5 discuss vectors and attention-based retrieval.",
            "mental_model": "Neural net = composed functions; attention = soft lookup over positions.",
            "beginner_extra": "Watch the attention episode if linear algebra is rusty; otherwise skim and return before RAG month.",
            "intermediate_deep_dive": (
                "Pause on attention visuals—relate to ‘which chunk of document mattered’ in RAG explanations."
            ),
            "advanced_extra": (
                "Use this to explain embedding models to stakeholders without claiming embeddings equal meaning."
            ),
            "watch_for": ["Layer stacking", "Attention as weighted sum", "Training vs inference split"],
            "failure_modes": ["Confusing intuition with implementation details in interviews"],
            "interview_prompts": ["Explain attention to a PM in one minute."],
            "capstone_action": "Note one diagram you will reuse in a future RAG README.",
            "done_when": "You can point to what an embedding model approximates.",
        },
        13: {
            "one_liner": "StatQuest index—search for attention/embeddings when you want gentler statistics framing (optional).",
            "why_now": "Optional supplement; use only if 3Blue1Brown or DL.AI modules felt too fast.",
            "mental_model": "StatQuest = glossary in video form.",
            "beginner_extra": "Search the site for ‘attention’ or ‘embeddings’; watch one video, not the whole index.",
            "intermediate_deep_dive": "Pick one video aligned with your weakest concept from Month 1 notes.",
            "advanced_extra": "Skip if time-boxed—optional means optional unless evals show knowledge gaps.",
            "watch_for": ["Clear definitions", "Visual intuition"],
            "failure_modes": ["Substituting optional videos for prove gates"],
            "interview_prompts": ["Which optional resource actually changed a design decision?"],
            "capstone_action": "If used: one README bullet citing the StatQuest concept.",
            "done_when": "You can skip guilt-free if Month 1 prove passed.",
        },
        14: {
            "one_liner": "DeepLearning.AI YouTube channel hub—browse only topics referenced elsewhere in Month 1.",
            "why_now": "Optional discovery; avoid rabbit holes.",
            "mental_model": "Channel = library, syllabus = reading list.",
            "beginner_extra": "Subscribe if helpful; do not binge—return when a specific technique is named in build tasks.",
            "intermediate_deep_dive": "If you watch anything, log title + 3 bullets tied to capstone.",
            "advanced_extra": "Treat as conference talks backlog for Month 15 interview prep.",
            "watch_for": ["Production-focused titles", "Short courses overlapping syllabus"],
            "failure_modes": ["40 hours of video zero repo commits"],
            "interview_prompts": ["How do you time-box learning resources?"],
            "capstone_action": "Only if watched: link one video in README notes.",
            "done_when": "Optional topic may be marked done without viewing if required topics complete.",
        },
        15: {
            "one_liner": "Karpathy YouTube channel—long-form essays on software 2.0 and LLM engineering (optional).",
            "why_now": "Optional culture/context; primary required Karpathy items are the intro and deep dive topics.",
            "mental_model": "Essays = senior engineer perspective pieces.",
            "beginner_extra": "Read/watch one essay if curious about career direction—not required for prove.",
            "intermediate_deep_dive": "If engaged, compare essay themes to your capstone architecture choices.",
            "advanced_extra": "Use for narrative in portfolio posts—how you think about systems, not trivia.",
            "watch_for": ["Engineering mindset", "Data flywheels"],
            "failure_modes": ["Consuming content instead of shipping v0.2"],
            "interview_prompts": ["What Karpathy idea influenced your repo design?"],
            "capstone_action": "Optional README reflection (3 sentences max).",
            "done_when": "Skip allowed when v0.2 prove is on track.",
        },
        16: {
            "one_liner": "Applied LLMs second pass—read 3+ sections focused on gateways, extraction, and monitoring for Month 1.",
            "why_now": "Revisit with gateway context; first pass was boot-week breadth.",
            "mental_model": "Second read = highlight what changes now that LiteLLM exists in repo.",
            "beginner_extra": "Pick three section titles from the handbook TOC that mention cost, logging, or validation.",
            "intermediate_deep_dive": (
                "Annotate margins: each section → one change in your v0.2 PR (config, log field, test)."
            ),
            "advanced_extra": (
                "Write a short comparison table: handbook recommendation vs your current implementation vs gap."
            ),
            "read_sections": ["Gateway patterns", "Structured outputs", "Monitoring"],
            "failure_modes": ["Duplicate notes from Course 0 without new insights"],
            "interview_prompts": ["What changed in your architecture after the second Applied LLMs pass?"],
            "capstone_action": "Three ADR bullets in README for Month 1.",
            "done_when": "Each bullet links to a merged PR or config file.",
        },
        17: {
            "one_liner": "Instructor patterns and retries—Month 1 angle: production extraction functions and error taxonomy.",
            "why_now": "You already read quick start; now standardize patterns across services behind LiteLLM.",
            "mental_model": "Shared library module `extraction.py` used by CLI and later agents.",
            "beginner_extra": "Focus on retries, partial parsing, and consistent exception types.",
            "intermediate_deep_dive": (
                "Refactor boot-week extract into a module with injectable client (LiteLLM). "
                "Unit-test validation paths without calling the network."
            ),
            "advanced_extra": (
                "Expose metrics: `validation_error_type` counter, `retry_count` histogram. "
                "Document idempotency for batch replays."
            ),
            "read_sections": ["Retries", "Validators", "Hooks"],
            "failure_modes": ["Copy-paste extract logic per script"],
            "interview_prompts": ["How do you structure LLM client code in a monorepo?"],
            "capstone_action": "Refactor extract behind one module; tests for validation failures.",
            "done_when": "CI runs unit tests without API keys.",
        },
        18: {
            "one_liner": "LiteLLM docs hub—proxy, routing, logging integrations for your Month 1 gateway.",
            "why_now": "Central place to configure models, keys, and observability hooks used all year.",
            "mental_model": "LiteLLM = ODBC for LLMs: one connection string, many backends.",
            "beginner_extra": "Start with completion API + proxy overview; defer exotic providers until needed.",
            "intermediate_deep_dive": (
                "Stand up proxy or embedded router; standardize env vars; per-request metadata (`job_id`)."
            ),
            "advanced_extra": (
                "Plan HA: multiple proxy replicas, secret rotation, budget caps per team. "
                "Integrate Langfuse in Course 9—leave hooks now."
            ),
            "read_sections": ["Proxy server", "Routing", "Logging", "Fallbacks"],
            "failure_modes": ["API keys in each script", "No request id in logs"],
            "interview_prompts": ["Design a multi-tenant LLM gateway."],
            "capstone_action": "Tag v0.2 with router config + cost log sample in README.",
            "done_when": "README table shows model, tokens, latency, cost for sample requests.",
        },
        19: {
            "one_liner": "Chip Huyen’s blog—production ML/LLM systems essays bridging data and serving.",
            "why_now": "Frames how data quality and serving interact—natural for data engineers.",
            "mental_model": "Blog = case studies in operationalizing models.",
            "beginner_extra": "Read 2–3 posts on data loops, monitoring, or deployment—not the entire archive.",
            "intermediate_deep_dive": "Pick one post; extract a checklist you add to repo OPERATIONS.md.",
            "advanced_extra": "Connect post themes to OpenLineage/evals later—data flywheel narrative for interviews.",
            "read_sections": ["Posts on LLM apps", "Data distribution shift", "Monitoring"],
            "failure_modes": ["Reading without operationalizing any checklist item"],
            "interview_prompts": ["How does data drift show up in LLM apps?"],
            "capstone_action": "One checklist item implemented or ticketed in README.",
            "done_when": "You can summarize one post’s thesis in two sentences.",
        },
        20: {
            "one_liner": "AI Engineering book repo—companion code and references for Chip Huyen’s textbook themes.",
            "why_now": "Optional depth alongside blog; skim code examples matching gateway/eval topics.",
            "mental_model": "Repo = worked examples to steal patterns from.",
            "beginner_extra": "Clone optional; browse folders on serving and monitoring only if time.",
            "intermediate_deep_dive": "If used, port one small pattern (config, logging) into capstone with attribution.",
            "advanced_extra": "Compare book architecture diagrams to your repo—gap analysis for portfolio.",
            "read_sections": ["Serving", "Monitoring", "Data pipelines"],
            "failure_modes": ["Forking entire book repo into capstone"],
            "interview_prompts": ["Which book pattern did you adopt vs ignore?"],
            "capstone_action": "Optional: link to upstream pattern you mirrored.",
            "done_when": "Optional—skip if blog + v0.2 suffice.",
        },
        21: {
            "one_liner": "Outlines library—constrained decoding for guaranteed JSON/schema adherence (optional advanced).",
            "why_now": "Alternative to retry-heavy Instructor when you need stricter guarantees or lower latency.",
            "mental_model": "Outlines = compile schema into generation constraints.",
            "beginner_extra": "Only explore after Instructor baseline works; compare valid % and latency.",
            "intermediate_deep_dive": "Spike: one golden subset with Outlines vs Instructor; document tradeoff table.",
            "advanced_extra": (
                "When to adopt: high-volume extraction with strict JSON grammar. "
                "When to defer: rapid schema churn or small volumes where retries are cheaper than engineering."
            ),
            "read_sections": ["Getting started", "JSON schema", "Models supported"],
            "failure_modes": ["Adopting constrained decoding before basic evals exist"],
            "interview_prompts": ["Compare retry-based validation vs constrained decoding."],
            "capstone_action": "Optional spike branch with benchmark notes in README.",
            "done_when": "Decision documented: adopt / defer with metric.",
        },
        22: {
            "one_liner": "Build v0.2: LiteLLM router plus per-request cost and latency logging.",
            "why_now": "Month 1 core deliverable—every later observability story hangs off this.",
            "mental_model": "Gateway log row = fact table for FinOps and debugging.",
            "beginner_extra": "Tag `v0.2` on GitHub when README metrics table is truthful.",
            "intermediate_deep_dive": (
                "Fields: timestamp, model, prompt_tokens, completion_tokens, latency_ms, estimated_cost, request_id. "
                "CLI and library paths both emit the same schema."
            ),
            "advanced_extra": (
                "Add redaction middleware for prompts/responses in logs. "
                "SLO: P95 latency budget per record on golden set."
            ),
            "failure_modes": ["Logging costs without token counts", "Different log schemas per entrypoint"],
            "interview_prompts": ["How do you attribute LLM spend to a team or job?"],
            "capstone_action": "Merge v0.2; README metrics from real runs.",
            "done_when": "Release link + table in README.",
        },
        23: {
            "one_liner": "Prove Month 1: published v0.2 release with README cost/latency metrics.",
            "why_now": "Demonstrates operable gateway—not just code on a branch.",
            "mental_model": "Release tag = deployable artifact for reviewers.",
            "beginner_extra": "Paste release URL in Lab & Prove.",
            "intermediate_deep_dive": "Verify a friend can run one command and see a log row.",
            "advanced_extra": "Attach sample log JSON (redacted) as artifact in repo docs.",
            "failure_modes": ["Metrics from hand-waved numbers"],
            "interview_prompts": ["Walk through your v0.2 demo in 5 minutes."],
            "capstone_action": "Publish release; update studio prove link.",
            "done_when": "Course 1 acceptance satisfied.",
        },
        24: {
            "one_liner": "DL.AI short course: AI Agents in LangGraph—graphs, state, and tool loops for your reconciler agent.",
            "why_now": "Month 2 shifts from single-shot extraction to multi-step workflows with pause/resume.",
            "mental_model": "LangGraph = Airflow with LLM nodes and human approval tasks.",
            "beginner_extra": "Complete course labs; map each lab node type to a step in your reconciler.",
            "intermediate_deep_dive": (
                "Design graph: ingest → extract → validate → branch pass/fail → optional HITL. "
                "Keep state payload small and versioned."
            ),
            "advanced_extra": (
                "Define checkpoint retention and PII policy in state store. "
                "Load-test interrupt/resume paths—common demo breakages under concurrency."
            ),
            "watch_for": ["State schema", "Tool nodes", "Conditional edges"],
            "failure_modes": ["Giant state blobs", "No timeout on tool calls"],
            "interview_prompts": ["LangGraph vs plain scripts—when to adopt?"],
            "capstone_action": "Sketch graph diagram in README before coding.",
            "done_when": "You can name each node and its input/output types.",
        },
        25: {
            "one_liner": "LangChain Academy—LangGraph modules for hands-on graph patterns beyond the short course.",
            "why_now": "Deepens persistence, subgraphs, and testing patterns for production graphs.",
            "mental_model": "Academy = interactive labs; syllabus names which modules matter.",
            "beginner_extra": "Time-box to modules on persistence and human-in-the-loop if listed on your line.",
            "intermediate_deep_dive": "Complete exercises; copy patterns into `reconciler-agent` package structure.",
            "advanced_extra": "Compare Academy patterns to Anthropic agents essay—converge on your house style.",
            "watch_for": ["Checkpointers", "Breakpoints", "Testing graphs"],
            "failure_modes": ["Starting new tutorial repos instead of capstone package"],
            "interview_prompts": ["How do you test a LangGraph workflow?"],
            "capstone_action": "Port one academy pattern into capstone with test.",
            "done_when": "Graph unit test runs in CI (mocked LLM).",
        },
        26: {
            "one_liner": "LangChain talk on context engineering for agents—what goes in the window besides the user question.",
            "why_now": "Agents fail more from bad context assembly than from weak models.",
            "mental_model": "Context = curated join of tools, memory, docs, and policies—not raw dump.",
            "beginner_extra": "Watch for sections on tool results formatting and trimming long histories.",
            "intermediate_deep_dive": (
                "Define context budget per node: max tokens for tool outputs, summarization policy, stale tool result eviction."
            ),
            "advanced_extra": (
                "Measure context bloat: log tokens per node; alert when tool outputs dominate prompt. "
                "Relate to Month 10 prompt caching—stable prefixes for schemas/tools."
            ),
            "watch_for": ["Tool message shaping", "Memory vs retrieval", "Failure recovery"],
            "failure_modes": ["Stuffing entire tool JSON into every turn"],
            "interview_prompts": ["How do you prevent context window overflow in agents?"],
            "capstone_action": "Implement trimming/summarization on one hot path.",
            "done_when": "Logged token count drops on a fixed scenario.",
        },
        27: {
            "one_liner": "Dave Ebbelaar LangGraph production videos—practical deployment and debugging agent graphs.",
            "why_now": "Bridges tutorial graphs to how teams run them daily.",
            "mental_model": "YouTube = war stories; steal checklists, not code verbatim.",
            "beginner_extra": "Watch one production-focused episode; note debugging tactics.",
            "intermediate_deep_dive": "Add a TROUBLESHOOTING.md section mirroring video advice.",
            "advanced_extra": "Instrument graph with step timings; compare to video recommendations.",
            "watch_for": ["Local vs prod checkpointers", "Error handling", "Logging"],
            "failure_modes": ["Copying demo SQLite checkpointer to prod without plan"],
            "interview_prompts": ["How do you debug a stuck agent run?"],
            "capstone_action": "Document debug steps with run id and checkpoint id.",
            "done_when": "You can replay a failed run from checkpoint.",
        },
        28: {
            "one_liner": "Berkeley RDI compound AI systems—multiple models/tools orchestrated for reliability.",
            "why_now": "Frames why monolithic ‘one big prompt’ loses to specialized steps—matches your pipeline architecture.",
            "mental_model": "Compound AI = microservices for cognition.",
            "beginner_extra": "Focus on talks mentioning routing, verification, and retrieval—not research benchmarks.",
            "intermediate_deep_dive": "Map compound AI diagram labels to your reconciler components.",
            "advanced_extra": "Argue which steps deserve separate models vs one generalist with tools.",
            "watch_for": ["Verifier models", "Retrieval stages", "System diagrams"],
            "failure_modes": ["Adding models without eval per stage"],
            "interview_prompts": ["Design a compound system for log reconciliation."],
            "capstone_action": "README diagram with labeled components and data flows.",
            "done_when": "Each component has an owner test or metric.",
        },
        29: {
            "one_liner": "LangChain YouTube channel—optional updates on LangGraph features and recipes.",
            "why_now": "Optional; use when stuck on a specific API change.",
            "mental_model": "Release notes in video form.",
            "beginner_extra": "Search channel for your error message or feature name only.",
            "intermediate_deep_dive": "If watched, link issue + video that unblocked you in DEVLOG.",
            "advanced_extra": "Prefer primary docs for contracts; videos for intuition.",
            "watch_for": ["Migration guides", "Breaking changes"],
            "failure_modes": ["Tutorial hell across multiple agent frameworks"],
            "interview_prompts": ["How do you choose learning sources under time pressure?"],
            "capstone_action": "Optional note in DEVLOG.",
            "done_when": "May skip if graph prove is progressing.",
        },
        30: {
            "one_liner": "Anthropic — Building Effective Agents: patterns for reliable agentic workflows without over-autonomy.",
            "why_now": "Canonical essay before you wire tools and MCP—defines when graphs beat agents.",
            "mental_model": "Agents = loops; often you want workflows with explicit gates.",
            "beginner_extra": "Read for ‘build the simplest thing’ and tool-use discipline.",
            "intermediate_deep_dive": (
                "List which syllabus steps are workflows vs agent loops in your design doc. "
                "Add human approval on high-risk branches."
            ),
            "advanced_extra": (
                "Map essay anti-patterns to lint rules: e.g., ban unbounded tool loops, require eval on tool outputs. "
                "Interview story: how you prevented runaway autonomy."
            ),
            "read_sections": ["Workflows vs agents", "Tool use", "Evaluations"],
            "failure_modes": ["Autonomous agent with write tools and no policy"],
            "interview_prompts": ["When would you refuse to ship an ‘agent’?"],
            "capstone_action": "ADR: workflow vs agent for reconciler; cite essay.",
            "done_when": "Design doc references at least two essay principles.",
        },
    }
