#!/usr/bin/env python3
"""Fail CI if personal or non-public strings appear in shipped curriculum or UI."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
LESSONS = REPO_ROOT / "data" / "lessons.json"
PUBLIC_LESSONS = REPO_ROOT / "public" / "data" / "lessons.json"

BANNED_IN_CURRICULUM = [
    re.compile(r"harish\s*rajoori", re.I),
    re.compile(r"mindera", re.I),
    re.compile(r"\b2k\b", re.I),
    re.compile(r"\bwbd\b", re.I),
    re.compile(r"warner\s*bros", re.I),
    re.compile(r"trainline", re.I),
    re.compile(r"carl-snowflake|carl-infra|\bcarl cube\b", re.I),
    re.compile(r"jntu\s*hyderabad", re.I),
    re.compile(r"5\s+oct\s+2026", re.I),
    re.compile(r"before\s+5\s+oct", re.I),
    re.compile(r"harishrajoori\.github", re.I),
]

# UI source scan (not node_modules)
UI_PATHS = [
    REPO_ROOT / "src",
    REPO_ROOT / "index.html",
    REPO_ROOT / "README.md",
]

BANNED_IN_UI = BANNED_IN_CURRICULUM + [
    re.compile(r"your custom visual", re.I),
    re.compile(r"migration\s*&\s*learning platform", re.I),
]


def scan_text(label: str, text: str, patterns: list[re.Pattern]) -> list[str]:
    hits: list[str] = []
    for pat in patterns:
        for m in pat.finditer(text):
            snippet = text[max(0, m.start() - 20) : m.end() + 20].replace("\n", " ")
            hits.append(f"{label}: {pat.pattern} → …{snippet}…")
    return hits


def main() -> int:
    failures: list[str] = []

    for path in (LESSONS, PUBLIC_LESSONS):
        if not path.exists():
            failures.append(f"Missing {path}")
            continue
        blob = path.read_text(encoding="utf-8")
        failures.extend(scan_text(str(path), blob, BANNED_IN_CURRICULUM))

    for base in UI_PATHS:
        if base.is_file():
            failures.extend(scan_text(str(base), base.read_text(encoding="utf-8"), BANNED_IN_UI))
        else:
            for f in base.rglob("*"):
                if f.suffix not in {".jsx", ".js", ".html", ".css", ".md"}:
                    continue
                failures.extend(scan_text(str(f.relative_to(REPO_ROOT)), f.read_text(encoding="utf-8"), BANNED_IN_UI))

    primer_path = LESSONS
    if primer_path.exists():
        data = json.loads(primer_path.read_text(encoding="utf-8"))
        primer = data.get("program_primer_markdown") or ""
        failures.extend(scan_text("program_primer_markdown", primer, BANNED_IN_CURRICULUM))

    if failures:
        print("PUBLIC CONTENT AUDIT FAILED:")
        for f in failures[:40]:
            print(" ", f)
        if len(failures) > 40:
            print(f"  … and {len(failures) - 40} more")
        return 1

    print("PUBLIC CONTENT AUDIT OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
