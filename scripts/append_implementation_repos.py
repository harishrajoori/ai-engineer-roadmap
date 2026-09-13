"""Attach validated GitHub implementation repos to lesson resource stacks."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from enrichment_utils import lesson_stable_key, normalize_lesson_title, token_set

REPO_ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = REPO_ROOT / "data" / "implementation_repo_catalog.json"

_cache: dict[str, Any] | None = None
MAX_REPOS_PER_LESSON = 4
MIN_ATTACH_SCORE = 6
GENERIC_REPO_IDS = frozenset({"patchy-hub", "ai-engineering-from-scratch"})
GENERIC_MIN_SCORE = 12


def load_implementation_catalog() -> dict[str, Any]:
    global _cache
    if _cache is not None:
        return _cache
    if not CATALOG_PATH.exists():
        _cache = {"repos": []}
        return _cache
    _cache = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return _cache


def _validated_repos() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for entry in load_implementation_catalog().get("repos") or []:
        if not isinstance(entry, dict):
            continue
        val = entry.get("github_validation") or {}
        if not val.get("ok"):
            continue
        out.append(entry)
    return out


def _pattern_matches_url(pattern: str, url: str) -> bool:
    p = (pattern or "").strip().lower()
    if not p or not url:
        return False
    if len(p) < 8 and "youtube.com" not in p and "github.com" not in p:
        return False
    return p in url


def _score_repo(entry: dict[str, Any], lesson: dict) -> int:
    url = (lesson.get("url") or "").lower()
    title = normalize_lesson_title(lesson.get("lesson") or "")
    title_tokens = token_set(title)
    score = 0
    course = str(lesson.get("course", ""))
    for pat in entry.get("url_match") or []:
        if _pattern_matches_url(str(pat), url):
            score += 15
    for tok in entry.get("title_match") or []:
        t = (tok or "").lower().strip()
        if len(t) < 4:
            continue
        if t in title or t in title_tokens:
            score += 8
    # Course alone is never enough — avoids same hub on every topic in a month
    on_course = course in [str(c) for c in entry.get("courses") or []]
    if on_course and score > 0:
        score += 2
    repo_id = entry.get("id") or ""
    if repo_id in GENERIC_REPO_IDS and score < GENERIC_MIN_SCORE:
        return 0
    if repo_id == "patchy-hub":
        return 0
    return score


def _resource_from_entry(entry: dict[str, Any], match_score: int) -> dict[str, Any]:
    val = entry.get("github_validation") or {}
    stars = val.get("stars")
    desc = (entry.get("description") or "").strip()
    if stars and int(stars) >= 100:
        desc = f"{desc} (★ {stars:,})".strip()
    return {
        "title": entry.get("title") or "Implementation reference",
        "url": entry.get("url"),
        "type": "implementation",
        "level": entry.get("level") or "intermediate",
        "description": desc or "Validated open-source reference implementation.",
        "source": "verified_repo_catalog",
        "repo_id": entry.get("id"),
        "match_score": match_score,
    }


def pick_repos_for_lesson(lesson: dict) -> list[dict[str, Any]]:
    scored: list[tuple[int, dict[str, Any]]] = []
    for entry in _validated_repos():
        s = _score_repo(entry, lesson)
        if s >= MIN_ATTACH_SCORE:
            scored.append((s, entry))
    scored.sort(key=lambda x: (-x[0], x[1].get("title") or ""))
    picked: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for match_score, entry in scored:
        url = (entry.get("url") or "").strip().lower()
        if not url or url in seen_urls:
            continue
        picked.append(_resource_from_entry(entry, match_score))
        seen_urls.add(url)
        if len(picked) >= MAX_REPOS_PER_LESSON:
            break
    return picked


def strip_stale_catalog_resources(row: dict) -> None:
    """Remove prior catalog attachments so merge_enrichment cannot leave stale hub links."""
    kept = []
    for res in row.get("resources") or []:
        if res.get("source") == "verified_repo_catalog":
            continue
        kept.append(res)
    row["resources"] = kept


def append_implementation_repos(row: dict) -> None:
    """Merge catalog repos into row['resources'] (after external curriculum)."""
    strip_stale_catalog_resources(row)
    extras = pick_repos_for_lesson(row)
    if not extras:
        return
    resources = list(row.get("resources") or [])
    index_by_url: dict[str, int] = {}
    for i, existing in enumerate(resources):
        u = (existing.get("url") or "").strip().lower()
        if u:
            index_by_url[u] = i
    for res in extras:
        url_key = (res.get("url") or "").strip().lower()
        if not url_key:
            continue
        if url_key in index_by_url:
            idx = index_by_url[url_key]
            merged = {**resources[idx], **res, "type": "implementation"}
            resources[idx] = merged
            continue
        resources.append(res)
        index_by_url[url_key] = len(resources) - 1
    row["resources"] = resources


def local_setup_for_lesson(lesson: dict) -> dict[str, Any]:
    """Build local dev instructions from prove pack + best-matching catalog entry."""
    from curriculum_enrichment import prove_pack_for_course

    course = str(lesson.get("course", ""))
    prove_pack = prove_pack_for_course(course)
    scored: list[tuple[int, dict[str, Any]]] = []
    for entry in _validated_repos():
        s = _score_repo(entry, lesson)
        if s > 0:
            scored.append((s, entry))
    specific = [(s, e) for s, e in scored if s >= MIN_ATTACH_SCORE and (e.get("id") or "") not in GENERIC_REPO_IDS]
    specific.sort(key=lambda x: -x[0])
    primary = specific[0][1] if specific else None
    if not primary:
        fallback = [(s, e) for s, e in scored if s >= MIN_ATTACH_SCORE]
        fallback.sort(key=lambda x: -x[0])
        primary = fallback[0][1] if fallback else None
    local = (primary or {}).get("local") or {}

    workspace = f"~/ai-systems-lab/course-{course}"
    steps = [
        f"mkdir -p {workspace} && cd {workspace}",
        "python3 -m venv .venv && source .venv/bin/activate  # Windows: .venv\\Scripts\\activate",
        "git init  # or: git clone <your-portfolio-repo-url> .",
    ]
    if local.get("clone"):
        steps.append(f"# Reference implementation\n{local['clone']}")
    for line in local.get("setup") or []:
        steps.append(line)
    for cmd in prove_pack.get("commands") or []:
        steps.append(f"# Course prove\n{cmd}")

    env_vars = list(local.get("env") or [])
    if "OPENAI_API_KEY=" not in " ".join(env_vars):
        env_vars.append("OPENAI_API_KEY=  # or ANTHROPIC_API_KEY / GEMINI_API_KEY")

    return {
        "workspace": workspace,
        "prerequisites": [
            "Python 3.11+",
            "git",
            "Docker (optional, for Qdrant/Neo4j/Langfuse)",
            "API key for at least one model provider",
        ],
        "steps": steps,
        "env_vars": env_vars,
        "portfolio_note": (local.get("portfolio_note") or "").strip()
        or "Keep synthetic/public data only; document commands in README.",
        "reference_repo": primary.get("title") if primary else None,
        "reference_url": primary.get("url") if primary else None,
    }
