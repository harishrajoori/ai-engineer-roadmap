#!/usr/bin/env python3
"""Merge handbook batch modules into data/topic_handbook.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from handbook_auto_enrich import enrich_all
from handbook_batches.batch_01_30 import entries as e1
from handbook_batches.batch_31_70 import entries as e2
from handbook_batches.batch_71_141 import entries as e3

REPO = _SCRIPTS.parent
OUT = REPO / "data" / "topic_handbook.json"
TRACK = REPO / "docs" / "AI_System_Engineer_Learning_Track_2027.md"


def main() -> None:
    merged: dict[int, dict] = {}
    for fn in (e1, e2, e3):
        merged.update(fn())
    if TRACK.exists():
        from generate_lessons import parse_track

        lessons = parse_track(TRACK.read_text(encoding="utf-8"))
        by_order = {int(row["order"]): row for row in lessons if row.get("order") is not None}
        merged = enrich_all(merged, by_order)
    missing = [i for i in range(1, 143) if i not in merged]
    if missing:
        raise SystemExit(f"Handbook missing orders: {missing[:20]}{'…' if len(missing) > 20 else ''}")
    OUT.write_text(json.dumps({str(k): v for k, v in sorted(merged.items())}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(merged)} handbook entries → {OUT}")


if __name__ == "__main__":
    main()
