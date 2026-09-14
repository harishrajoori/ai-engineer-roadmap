#!/usr/bin/env python3
"""QA gate for generated curriculum: tone, mermaid, labs, shallow URLs."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LESSONS = REPO / "data" / "lessons.json"

BANNED_PHRASES: tuple[str, ...] = (
    "delve into",
    "let's explore",
    "in this exciting",
    "unlock the power",
    "dive deep",
    "comprehensive guide",
    "journey",
    "as a data engineer, you",
)

SHALLOW_URL_EXACT: tuple[str, ...] = (
    "https://docs.pydantic.dev/latest/",
    "https://docs.pydantic.dev/latest",
    "https://github.com/vllm-project/vllm",
    "https://docs.litellm.ai/",
    "https://python.useinstructor.com/",
)

VAGUE_LAB_MARKERS: tuple[str, ...] = (
    "sketch.py",
    "implement me and add pytest",
    "Write a script to call the API",
)

MERMAID_BLOCK = re.compile(r"```mermaid\n(.*?)```", re.DOTALL)


def _check_mermaid_syntax(body: str, ctx: str) -> list[str]:
    issues: list[str] = []
    for i, match in enumerate(MERMAID_BLOCK.finditer(body)):
        chart = match.group(1).strip()
        if not chart:
            issues.append(f"{ctx} mermaid block {i} empty")
            continue
        if chart.count("```"):
            issues.append(f"{ctx} mermaid block {i} nested fences")
        # unbalanced brackets common failure
        if chart.count("[") != chart.count("]"):
            issues.append(f"{ctx} mermaid block {i} unbalanced []")
        if "flowchart" in chart or "graph " in chart:
            if "-->" not in chart and "---" not in chart:
                issues.append(f"{ctx} mermaid block {i} flowchart without edges")
    return issues


def main() -> int:
    if not LESSONS.exists():
        print("MISSING lessons.json — run npm run curriculum", file=sys.stderr)
        return 1

    data = json.loads(LESSONS.read_text(encoding="utf-8"))
    lessons = data.get("lessons") or []
    failures: list[str] = []
    fixes_log: list[str] = []

    for les in lessons:
        order = les.get("order")
        title = (les.get("lesson") or "")[:50]
        ctx = f"order={order} {title}"

        blob = json.dumps(les, ensure_ascii=False).lower()
        for phrase in BANNED_PHRASES:
            if phrase in blob:
                failures.append(f"{ctx}: banned phrase '{phrase}'")

        url = (les.get("url") or "").strip().rstrip("/")
        if url in {u.rstrip("/") for u in SHALLOW_URL_EXACT}:
            failures.append(f"{ctx}: shallow primary URL {url}")

        levels = les.get("theory_levels") or {}
        for level_name, text in levels.items():
            if not text:
                continue
            failures.extend(_check_mermaid_syntax(text, f"{ctx} theory.{level_name}"))

        lab_md = (les.get("lab_plan") or {}).get("lab_practice", {}).get("markdown") or ""
        if lab_md:
            failures.extend(_check_mermaid_syntax(lab_md, f"{ctx} lab_practice"))
            low = lab_md.lower()
            for marker in VAGUE_LAB_MARKERS:
                if marker.lower() in low:
                    failures.append(f"{ctx}: vague lab marker '{marker}'")

    if failures:
        print("CURRICULUM QA FAILED", file=sys.stderr)
        for line in failures[:80]:
            print(f"  - {line}", file=sys.stderr)
        if len(failures) > 80:
            print(f"  … and {len(failures) - 80} more", file=sys.stderr)
        return 1

    print(f"CURRICULUM QA OK ({len(lessons)} lessons)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
