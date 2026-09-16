"""Load glossary, concept maps, and prove packs bundled with the curriculum."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
ENRICHMENT_PATH = REPO_ROOT / "data" / "curriculum_enrichment.json"
PRIMER_PATH = REPO_ROOT / "docs" / "AI_for_Data_Engineers_Primer.md"
BRIEF_PATH = REPO_ROOT / "docs" / "AI_Platform_System_Engineer_Program_Brief.md"

_cache: dict[str, Any] | None = None


def load_curriculum_enrichment() -> dict[str, Any]:
    global _cache
    if _cache is not None:
        return _cache
    if not ENRICHMENT_PATH.exists():
        _cache = {"glossary": [], "concept_maps": {}, "prove_packs": {}}
        return _cache
    _cache = json.loads(ENRICHMENT_PATH.read_text(encoding="utf-8"))
    return _cache


def glossary_entries() -> list[dict]:
    return list(load_curriculum_enrichment().get("glossary") or [])


def glossary_by_id() -> dict[str, dict]:
    return {g["id"]: g for g in glossary_entries() if g.get("id")}


def concept_map_for_course(course: int | str) -> list[str]:
    maps = load_curriculum_enrichment().get("concept_maps") or {}
    return list(maps.get(str(course)) or [])


def prove_pack_for_course(course: int | str) -> dict:
    packs = load_curriculum_enrichment().get("prove_packs") or {}
    return dict(packs.get(str(course)) or {})


def real_world_for_course(course: int | str) -> dict:
    blocks = load_curriculum_enrichment().get("real_world_by_course") or {}
    return dict(blocks.get(str(course)) or {})


def load_program_primer_markdown() -> str:
    if PRIMER_PATH.exists():
        return PRIMER_PATH.read_text(encoding="utf-8").strip()
    return ""


def prepare_program_brief_for_studio(md: str) -> str:
    """Learner-facing copy for the app: no repo filenames, no maintainer section."""
    text = md.strip()
    # Drop maintainer-only tail (still in docs/ for GitHub readers).
    text = re.sub(r"\n## 15\. Document maintenance\b.*", "", text, flags=re.DOTALL).strip()
    text = re.sub(r"\n15\. \[Document maintenance\][^\n]*\n?", "\n", text)
    # Home section already has a title; avoid duplicate H1 in the scroll body.
    if text.startswith("# "):
        text = re.sub(r"^# [^\n]+\n+", "", text, count=1).strip()
    # [Label](./something.md) → Label
    text = re.sub(r"\[([^\]]+)\]\([^)]*\.md[^)]*\)", r"\1", text)
    # `file.md` path literals
    text = re.sub(r"`[^`\n]*\.md`", "", text)
    text = re.sub(r"OPTIONAL_MODEL_DEPTH\.md", "optional model depth supplement", text, flags=re.I)
    return text.strip()


def load_program_brief_markdown() -> str:
    if not BRIEF_PATH.exists():
        return ""
    raw = BRIEF_PATH.read_text(encoding="utf-8").strip()
    return prepare_program_brief_for_studio(raw)


def _strip_brief_contents_toc(md: str) -> str:
    """Drop the long Contents block — home UI already navigates courses in the sidebar."""
    return re.sub(r"\n## Contents\b.*?\n---\n", "\n", md, count=1, flags=re.DOTALL).strip()


def load_program_brief_home_markdown() -> str:
    """Home brief: §1–9 and §11–14; omit §10 course encyclopedia (use course overviews)."""
    full = load_program_brief_markdown()
    if not full:
        return ""
    start_10 = re.search(r"\n## 10\. Course-by-course coverage", full)
    start_11 = re.search(r"\n## 11\. Suggested reading order", full)
    if start_10 and start_11 and start_11.start() > start_10.start():
        body = (full[: start_10.start()] + full[start_11.start() :]).strip()
    else:
        body = full
    body = _strip_brief_contents_toc(body)
    footer = (
        "\n\n---\n\n"
        "_**§10 course encyclopedia** (per-course hour tables) is in each **course overview** "
        "in the sidebar—not duplicated here._\n"
    )
    return body + footer


CAPSTONE_BRIEF_PATH = REPO_ROOT / "docs" / "capstone_product_brief.md"


def load_capstone_product_brief_markdown() -> str:
    if not CAPSTONE_BRIEF_PATH.exists():
        return ""
    return CAPSTONE_BRIEF_PATH.read_text(encoding="utf-8").strip()


def portfolio_starter() -> dict:
    return dict(load_curriculum_enrichment().get("portfolio_starter") or {})
