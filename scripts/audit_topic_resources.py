#!/usr/bin/env python3
"""Audit topic primary URLs and resource stacks (duplicates, stale cards, shallow links)."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPTS = REPO / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from link_quality import SHALLOW_PRIMARY_URLS, validate_lesson_links  # noqa: E402

LESSONS_JSON = REPO / "data" / "lessons.json"


def _url_key(url: str) -> str:
    return (url or "").strip().lower().rstrip("/")


def format_topic_title(lesson: dict) -> str:
    raw = re.sub(r"^\*\(optional\)\*\s*", "", lesson.get("lesson") or "Topic", flags=re.I).strip()
    typ = lesson.get("type") or "Topic"
    duration = re.sub(r"^·\s*", "", (lesson.get("duration") or "").strip())
    parts = [typ, raw]
    if duration and duration != "Time-box as needed":
        parts.append(duration)
    return " · ".join(parts)


def audit_lessons(lessons: list[dict]) -> dict[str, list[tuple]]:
    issues: dict[str, list[tuple]] = defaultdict(list)

    for les in lessons:
        order = int(les["order"])
        title = (les.get("lesson") or "")[:60]
        primary = (les.get("url") or "").strip()
        resources = les.get("resources") or []

        if " · · " in format_topic_title(les):
            issues["double_middot_title"].append((order, format_topic_title(les)))

        by_url: dict[str, list[str]] = defaultdict(list)
        for r in resources:
            u = (r.get("url") or "").strip()
            if u.startswith("http"):
                by_url[_url_key(u)].append(r.get("title") or "?")
        for u, titles in by_url.items():
            if len(titles) > 1:
                issues["duplicate_resource_url"].append((order, title, u, titles))

        for r in resources:
            if (r.get("description") or "").startswith("Same source — syllabus angle:"):
                issues["stale_same_source_card"].append((order, title, r.get("title")))

        if _url_key(primary) in (_url_key("https://applied-llms.org"),):
            issues["bare_applied_llms_primary"].append((order, title))

        if primary in SHALLOW_PRIMARY_URLS or primary.rstrip("/") + "/" in SHALLOW_PRIMARY_URLS:
            issues["shallow_primary_after_canonicalize"].append((order, title, primary))

        for rel in les.get("related_topics") or []:
            if int(rel.get("course", -1)) != int(les.get("course", -2)):
                issues["cross_course_related_topic"].append((order, rel))

        for msg in validate_lesson_links(les):
            issues["link_quality"].append((order, msg))

        if primary.startswith("http") and not resources:
            issues["no_resource_cards"].append((order, title))

    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON report")
    args = parser.parse_args()

    if not LESSONS_JSON.exists():
        print(f"Missing {LESSONS_JSON}", file=sys.stderr)
        return 2

    lessons = json.loads(LESSONS_JSON.read_text(encoding="utf-8")).get("lessons", [])
    issues = audit_lessons(lessons)

    fail_cats = (
        "duplicate_resource_url",
        "stale_same_source_card",
        "bare_applied_llms_primary",
        "shallow_primary_after_canonicalize",
        "cross_course_related_topic",
        "double_middot_title",
    )

    if args.json:
        out = {k: [list(x) if isinstance(x, tuple) else x for x in v] for k, v in issues.items()}
        out["lesson_count"] = len(lessons)
        print(json.dumps(out, indent=2))
    else:
        print(f"Topic/resource audit — {len(lessons)} lessons\n")
        for cat in sorted(issues.keys()):
            rows = issues[cat]
            print(f"{cat}: {len(rows)}")
            for row in rows[:20]:
                print(f"  {row}")
            if len(rows) > 20:
                print(f"  ... +{len(rows) - 20} more")
            print()

    errors = sum(len(issues.get(c, [])) for c in fail_cats)
    if errors:
        print(f"FAIL: {errors} blocking issue(s) in {', '.join(c for c in fail_cats if issues.get(c))}")
        return 1
    print("PASS: no blocking topic/resource issues")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
