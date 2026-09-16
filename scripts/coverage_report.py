#!/usr/bin/env python3
"""Print curriculum coverage: theory, lab, handbook key, studio guide, impl links."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LESSONS = REPO / "data" / "lessons.json"
BY_KEY = REPO / "data" / "topic_handbook_by_key.json"


def main() -> int:
    if not LESSONS.exists():
        print("Missing data/lessons.json — run npm run curriculum", file=sys.stderr)
        return 1

    lessons = json.loads(LESSONS.read_text(encoding="utf-8")).get("lessons") or []
    by_key = {}
    if BY_KEY.exists():
        by_key = json.loads(BY_KEY.read_text(encoding="utf-8"))

    n = len(lessons)
    studio = sum(1 for l in lessons if l.get("theory_studio_guide"))
    de_lab = sum(1 for l in lessons if (l.get("lab_plan") or {}).get("de_lab"))
    impl = sum(
        1
        for l in lessons
        if any((r.get("type") == "implementation" for r in (l.get("resources") or [])))
    )
    shallow_adv = 0
    for l in lessons:
        adv = ((l.get("theory_levels") or {}).get("advanced") or "")
        beg = ((l.get("theory_levels") or {}).get("beginner") or "")
        if beg and len(adv) < len(beg):
            shallow_adv += 1

    print(f"Lessons: {n}")
    print(f"  studio .studio.md guides: {studio}")
    print(f"  handbook stable-key hits: {len(by_key)}")
    print(f"  de_lab scenarios: {de_lab}")
    print(f"  lessons with implementation resources: {impl}")
    print(f"  advanced shorter than beginner: {shallow_adv}")

    gaps = []
    for l in lessons:
        order = l.get("order")
        title = (l.get("lesson") or "")[:40]
        if not l.get("theory_summary"):
            gaps.append(f"order={order} missing theory_summary")
        if l.get("type") in ("Build", "Prove") and not (l.get("lab_plan") or {}).get("de_lab"):
            gaps.append(f"order={order} {l.get('type')} missing de_lab — {title}")

    if gaps:
        print("\nGaps (first 20):")
        for g in gaps[:20]:
            print(f"  - {g}")
        if len(gaps) > 20:
            print(f"  … and {len(gaps) - 20} more")
    else:
        print("\nNo structural gaps in sample checks.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
