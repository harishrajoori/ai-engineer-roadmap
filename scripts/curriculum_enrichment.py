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
    return text.strip()


def load_program_brief_markdown() -> str:
    if not BRIEF_PATH.exists():
        return ""
    raw = BRIEF_PATH.read_text(encoding="utf-8").strip()
    return prepare_program_brief_for_studio(raw)


def portfolio_starter() -> dict:
    return dict(load_curriculum_enrichment().get("portfolio_starter") or {})
