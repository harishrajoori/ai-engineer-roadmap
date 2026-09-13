"""Load glossary, concept maps, and prove packs bundled with the curriculum."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
ENRICHMENT_PATH = REPO_ROOT / "data" / "curriculum_enrichment.json"
PRIMER_PATH = REPO_ROOT / "docs" / "AI_for_Data_Engineers_Primer.md"

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


def load_program_primer_markdown() -> str:
    if PRIMER_PATH.exists():
        return PRIMER_PATH.read_text(encoding="utf-8").strip()
    return ""
