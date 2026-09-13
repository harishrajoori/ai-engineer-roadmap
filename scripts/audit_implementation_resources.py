#!/usr/bin/env python3
"""One-shot audit: topic implementation repos, lab plans, catalog, and data parity."""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
LESSONS_PATH = REPO_ROOT / "data" / "lessons.json"
PUBLIC_LESSONS_PATH = REPO_ROOT / "public" / "data" / "lessons.json"
CATALOG_PATH = REPO_ROOT / "data" / "implementation_repo_catalog.json"
EXTERNAL_PATH = REPO_ROOT / "data" / "external_curriculum_links.json"

GENERIC_REPO_IDS = frozenset({"patchy-hub", "ai-engineering-from-scratch"})
HUB_ROOT = "github.com/patchy631/ai-engineering-hub"
MIN_CATALOG_MATCH_SCORE = 6


def load_lessons() -> list[dict]:
    data = json.loads(LESSONS_PATH.read_text(encoding="utf-8"))
    return list(data.get("lessons") or [])


def implementation_rows(lesson: dict) -> list[dict]:
    return [r for r in lesson.get("resources") or [] if (r.get("type") or "").lower() == "implementation"]


def topic_scoped_impl(lesson: dict) -> list[dict]:
    """Mirror src/utils/implementationResources.js (catalog needs match_score >= 6)."""
    rows = []
    for r in implementation_rows(lesson):
        source = r.get("source") or ""
        score = int(r.get("match_score") or 0)
        repo_id = r.get("repo_id") or ""
        if source == "verified_repo_catalog" and score < MIN_CATALOG_MATCH_SCORE:
            continue
        if repo_id in GENERIC_REPO_IDS and score < 12:
            continue
        rows.append(r)
    rows.sort(key=lambda x: (-int(x.get("match_score") or 0), x.get("title") or ""))
    return rows


def main() -> int:
    sys.path.insert(0, str(REPO_ROOT / "scripts"))
    from append_implementation_repos import pick_repos_for_lesson  # noqa: E402
    from enrichment_utils import lesson_stable_key  # noqa: E402
    from github_repo_validate import check_catalog  # noqa: E402

    errors: list[str] = []
    warnings: list[str] = []

    # --- Catalog validation ---
    catalog_errs = check_catalog()
    errors.extend([f"catalog: {e}" for e in catalog_errs])

    if CATALOG_PATH.exists():
        catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
        for entry in catalog.get("repos") or []:
            for pat in entry.get("url_match") or []:
                p = str(pat).strip()
                if len(p) < 8 and "youtube.com" not in p and "github.com" not in p:
                    warnings.append(f"catalog:{entry.get('id')}: short url_match `{p}`")

    # --- lessons.json parity ---
    if not LESSONS_PATH.exists() or not PUBLIC_LESSONS_PATH.exists():
        errors.append("missing lessons.json or public/data/lessons.json")
    else:
        a = LESSONS_PATH.read_bytes()
        b = PUBLIC_LESSONS_PATH.read_bytes()
        if a != b:
            errors.append("data/lessons.json and public/data/lessons.json differ (run generate_lessons.py)")

    lessons = load_lessons()
    by_course: dict[int, list[dict]] = defaultdict(list)
    for les in lessons:
        by_course[int(les.get("course", 0))].append(les)

    zero_topic_impl: list[str] = []
    zero_any_impl: list[str] = []
    hub_root_leaks: list[str] = []
    stale_catalog: list[str] = []
    pick_drift: list[str] = []
    lab_plan_gaps: list[str] = []
    dup_urls: list[str] = []

    for les in lessons:
        key = lesson_stable_key(les)
        label = f"c{les.get('course')}|#{les.get('order')} {str(les.get('lesson') or '')[:50]}"
        impl_all = implementation_rows(les)
        impl_topic = topic_scoped_impl(les)

        if not impl_all:
            zero_any_impl.append(label)
        if not impl_topic:
            zero_topic_impl.append(label)

        for r in impl_all:
            url = (r.get("url") or "").lower()
            if url.rstrip("/") == HUB_ROOT or url.endswith("/ai-engineering-hub"):
                hub_root_leaks.append(f"{label} → {r.get('title')}")
            if r.get("source") == "verified_repo_catalog":
                if r.get("match_score") is None:
                    stale_catalog.append(f"{label} → {r.get('title')} (no match_score)")
                elif int(r.get("match_score") or 0) < MIN_CATALOG_MATCH_SCORE:
                    stale_catalog.append(
                        f"{label} → {r.get('title')} (score {r.get('match_score')})"
                    )

        urls = [((r.get("url") or "").lower(), r.get("title")) for r in impl_all]
        if len(urls) != len(set(u[0] for u in urls)):
            dup_urls.append(label)

        expected = pick_repos_for_lesson(les)
        expected_urls = {(r.get("url") or "").lower() for r in expected}
        actual_urls = {
            (r.get("url") or "").lower()
            for r in impl_all
            if r.get("source") == "verified_repo_catalog"
        }
        if expected_urls != actual_urls:
            pick_drift.append(
                f"{label}: catalog urls expected {sorted(expected_urls)} got {sorted(actual_urls)}"
            )

        plan_links = (les.get("lab_plan") or {}).get("implementation_links") or []
        plan_urls = {(x.get("url") or "").lower() for x in plan_links}
        topic_urls = {(x.get("url") or "").lower() for x in impl_topic[:4]}
        if plan_urls and not plan_urls.issubset(
            {(r.get("url") or "").lower() for r in impl_all} | plan_urls
        ):
            lab_plan_gaps.append(label)

        # lab_plan should list topic-scoped implementations (external + catalog)
        if impl_topic and not plan_links:
            lab_plan_gaps.append(f"{label}: has topic impl but empty lab_plan.implementation_links")

    # External curriculum keys must use lowercase URLs
    if EXTERNAL_PATH.exists():
        ext = json.loads(EXTERNAL_PATH.read_text(encoding="utf-8"))
        for k in (ext.get("by_lesson_key") or {}):
            if "|u|" in k:
                _, url = k.split("|u|", 1)
                if url != url.lower():
                    errors.append(f"external_curriculum_links key not lowercased: {k[:80]}")

    # Portfolio starter: only is_start_here should matter in UI (document expectation)
    start_here = [les for les in lessons if les.get("is_start_here")]
    if len(start_here) < 12:
        warnings.append(f"is_start_here count={len(start_here)} (expected ~1 per course)")

    # --- Report ---
    print("=" * 60)
    print("IMPLEMENTATION & LAB AUDIT")
    print("=" * 60)
    print(f"Lessons: {len(lessons)} | Courses: {len(by_course)}")
    print(f"Catalog repos: {len(catalog.get('repos', [])) if CATALOG_PATH.exists() else 0}")

    impl_counts = [len(topic_scoped_impl(les)) for les in lessons]
    print(
        f"Topic-scoped implementation links per lesson: "
        f"min={min(impl_counts)} max={max(impl_counts)} avg={sum(impl_counts)/len(impl_counts):.2f}"
    )

    by_course_avg = {
        c: sum(len(topic_scoped_impl(l)) for l in rows) / len(rows) for c, rows in sorted(by_course.items())
    }
    print("Avg topic-scoped impl by course:", ", ".join(f"{c}:{v:.1f}" for c, v in by_course_avg.items()))

    def section(title: str, items: list[str], limit: int = 15) -> None:
        print(f"\n{title} ({len(items)})")
        if not items:
            print("  OK")
            return
        for line in items[:limit]:
            print(f"  - {line}")
        if len(items) > limit:
            print(f"  … and {len(items) - limit} more")

    section("ERRORS (fail audit)", errors)
    section("Stale / low-score catalog attachments", stale_catalog)
    section("pick_repos vs lessons.json drift", pick_drift)
    section("Hub root on lesson (should be subpaths only)", hub_root_leaks)
    section("Duplicate implementation URLs", dup_urls)
    section("lab_plan gaps", lab_plan_gaps)
    section("Zero topic-scoped implementation", zero_topic_impl)
    section("Zero any implementation (incl. external)", zero_any_impl)
    section("Warnings", warnings)

    gap_by_type: Counter[str] = Counter()
    for les in lessons:
        if topic_scoped_impl(les):
            continue
        gap_by_type[str(les.get("type") or "?")] += 1
    if gap_by_type:
        print("\nGap breakdown (no topic-scoped impl) by lesson type:")
        for typ, count in gap_by_type.most_common():
            print(f"  {typ}: {count}")

    if errors or pick_drift or stale_catalog or hub_root_leaks:
        print("\nAUDIT RESULT: FAIL")
        return 1
    if zero_topic_impl:
        print(f"\nAUDIT RESULT: PASS with {len(zero_topic_impl)} topics lacking scoped impl (see list)")
        return 0
    print("\nAUDIT RESULT: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
