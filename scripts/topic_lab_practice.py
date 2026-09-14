"""Lab & Practice sections — DE scenarios, code to write, expected outcomes."""

from __future__ import annotations

from typing import Any

from topic_hints import get_topic_hint
from topic_lab_specs import specific_code_fence, specific_implementation


def _de_analogy_line(course: str, ltype: str) -> str:
    analogies = {
        "0": "Treat each log line like a **dirty CSV row** landing in S3: parse, validate, quarantine failures.",
        "1": "Treat each completion like a **Snowflake query**: log warehouse, bytes processed, and credits (tokens).",
        "2": "Treat the graph like **Airflow with a human approval task** when validation fails.",
        "3": "Treat MCP tools like **read-only stored procedures** with an audit table.",
        "4": "Treat retrieval like **tuning sort keys and indexes** — measure recall@k, not vibes.",
    }
    return analogies.get(course, "Ship a measurable artifact in your portfolio repo; prove with tests or benchmarks.")


def lab_practice_markdown(lesson: dict) -> str:
    hint = get_topic_hint(lesson)
    course = str(lesson.get("course", ""))
    ltype = lesson.get("type") or "Read"
    title = lesson.get("lesson") or "This topic"
    url = (lesson.get("url") or "").strip()

    lines: list[str] = [
        "## Lab & Practice",
        "",
        f"**DE lens:** {_de_analogy_line(course, ltype)}",
        "",
        "### Real-world placement",
        "",
    ]

    if hint.get("why_now"):
        lines.append(hint["why_now"])
    else:
        lines.append(
            "You are hardening the same capstone repo each month—this checkbox adds one production habit "
            "(contract, gateway, tool audit, benchmark, or CI gate)."
        )
    lines.append("")

    lines.append("### What you implement")
    lines.append("")
    spec = specific_implementation(lesson, hint)
    if spec:
        lines.append(spec)
    elif hint.get("capstone_action"):
        lines.append(hint["capstone_action"])
    elif ltype == "Build":
        lines.append(f"**Build milestone:** {title}")
    elif ltype == "Prove":
        lines.append(f"**Prove:** {lesson.get('prove_criteria') or title}")
    elif ltype == "Video":
        lines.append(
            "After **Theory → Lecture**, capture three bullets: what to **log**, what to **test**, "
            "what to **block in code review**. If code applies, add a minimal module under your portfolio repo."
        )
    else:
        lines.append(
            "Read with a PR open in your repo: add or update one module, config, or test that reflects the doc section."
        )
    lines.append("")

    lines.append("### Expected outcome")
    lines.append("")
    lines.append(hint.get("done_when") or "A reviewer can verify the behavior from README commands without guessing.")
    lines.append("")

    if hint.get("failure_modes"):
        lines.append("### Failure modes to test explicitly")
        lines.append("")
        for fm in hint["failure_modes"][:5]:
            lines.append(f"- {fm}")
        lines.append("")

    lines.append("### Starter code (adapt paths)")
    lines.append("")
    fence = specific_code_fence(lesson, ltype) or _starter_fence(lesson, ltype)
    lines.append(fence)
    lines.append("")

    if url.startswith("http"):
        lines.append(f"**Primary source:** [{title}]({url})")
        lines.append("")

    return "\n".join(lines)


def _starter_fence(lesson: dict, ltype: str) -> str:
    b = f"{lesson.get('lesson') or ''} {(lesson.get('url') or '')}".lower()
    if "instructor" in b or "pydantic" in b:
        return """```python
# extract_one.py — wire to your golden set
from pydantic import BaseModel
import instructor
from openai import OpenAI

class LogEvent(BaseModel):
    event_id: str
    severity: str
    message: str

client = instructor.from_openai(OpenAI())

def extract(raw: str) -> LogEvent:
    return client.chat.completions.create(
        model="gpt-4o-mini",
        response_model=LogEvent,
        messages=[{"role": "user", "content": raw}],
        max_retries=3,
    )
```"""
    if "litellm" in b:
        return """```python
# log_usage.py
import json, time
from litellm import completion

def call(job_id: str, prompt: str) -> dict:
    t0 = time.perf_counter()
    r = completion(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
    row = {
        "job_id": job_id,
        "model": r.model,
        "prompt_tokens": r.usage.prompt_tokens,
        "completion_tokens": r.usage.completion_tokens,
        "latency_ms": int((time.perf_counter() - t0) * 1000),
    }
    print(json.dumps(row))
    return row
```"""
    if "langgraph" in b:
        return """```python
# graph.py — add checkpoint + interrupt on validation error
from langgraph.types import interrupt

def validate(state):
    if state.get("errors"):
        interrupt({"errors": state["errors"]})
    return state
```"""
    if ltype == "Prove":
        return """```bash
# Evidence checklist
pytest -q
python scripts/score.py   # or your eval entrypoint
# Paste release URL or PR in Lab & Prove
```"""
    if ltype == "Build":
        return """```bash
git checkout -b feat/month-N-milestone
# implement + test
pytest -q
git commit -am "feat: milestone N"
git tag v0.N   # when syllabus asks
```"""
    course = str(lesson.get("course", "0"))
    return f"""```python
# course_{course}/topic_{lesson.get("order", "?")}.py — wire to prove artifact for this row
def run() -> None:
    \"\"\"TODO: implement acceptance criteria from Theory → Lab & Prove.\"\"\"
    raise NotImplementedError("add behavior + pytest before marking topic complete")

if __name__ == "__main__":
    run()
```"""


def lab_practice_for_plan(lesson: dict) -> dict[str, Any]:
    return {
        "title": "Lab & Practice",
        "markdown": lab_practice_markdown(lesson),
    }
