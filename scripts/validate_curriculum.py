#!/usr/bin/env python3
"""Validate curriculum docs, HTTP links, and app data consistency."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
_SCRIPTS = REPO_ROOT / "scripts"
import sys

if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from enrichment_utils import digest_matches_lesson  # noqa: E402
from topic_hints import get_topic_hint  # noqa: E402
from topic_handbook.entries import HANDBOOK_BY_ORDER  # noqa: E402
from link_quality import validate_lesson_links  # noqa: E402
DOCS = REPO_ROOT / "docs"
TRACK = DOCS / "AI_System_Engineer_Learning_Track_2027.md"
LESSONS_JSON = REPO_ROOT / "data" / "lessons.json"
PUBLIC_LESSONS_JSON = REPO_ROOT / "public" / "data" / "lessons.json"

LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
URL_RE = re.compile(r"https?://[^\s\]|)>\"']+")
CHECKBOX_LINK = re.compile(r"^- \[ \] (\(optional\) )?\[([^\]]+)\]\(([^)]+)\)")

# Sites that block bots — treat non-403 failures only as errors
SOFT_FAIL_HOSTS = {
    "www.coursera.org",
    "coursera.org",
    "www.deeplearning.ai",
    "deeplearning.ai",
    "www.youtube.com",
    "youtube.com",
    "youtu.be",
    "www.linkedin.com",
    "linkedin.com",
    "x.com",
    "twitter.com",
    "openai.com",
    "www.openai.com",
    "localhost",
    "127.0.0.1",
}


def extract_http_urls_from_text(text: str) -> set[str]:
    urls = set(URL_RE.findall(text))
    for _label, url in LINK_RE.findall(text):
        url = url.strip()
        if url.startswith("http"):
            urls.add(url.rstrip(")"))
    return urls


def load_lessons() -> list[dict]:
    if not LESSONS_JSON.exists():
        raise SystemExit(f"Missing {LESSONS_JSON} — run npm run curriculum")
    data = json.loads(LESSONS_JSON.read_text(encoding="utf-8"))
    return data.get("lessons", [])


def lesson_urls(lessons: list[dict]) -> set[str]:
    urls: set[str] = set()
    for les in lessons:
        u = (les.get("url") or "").strip()
        if u.startswith("http"):
            urls.add(u)
        for r in les.get("resources") or []:
            ru = (r.get("url") or "").strip()
            if ru.startswith("http"):
                urls.add(ru)
    return urls


def track_checkbox_urls() -> set[str]:
    text = TRACK.read_text(encoding="utf-8")
    urls: set[str] = set()
    for line in text.splitlines():
        m = CHECKBOX_LINK.match(line.strip())
        if m:
            urls.add(m.group(3).strip())
    return urls


def check_url(url: str, timeout: float) -> tuple[str, str | None]:
    """Return (url, error_message or None)."""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    host = (parsed.hostname or parsed.netloc).lower()
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "ai-engineer-roadmap-validate/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status >= 400:
                return url, f"HTTP {resp.status}"
        return url, None
    except urllib.error.HTTPError as e:
        if e.code in (403, 405, 429) and host in SOFT_FAIL_HOSTS:
            return url, None
        if e.code == 405:
            # Some servers disallow HEAD
            try:
                req_get = urllib.request.Request(
                    url,
                    method="GET",
                    headers={"User-Agent": "ai-engineer-roadmap-validate/1.0"},
                )
                with urllib.request.urlopen(req_get, timeout=timeout) as resp:
                    if resp.status >= 400:
                        return url, f"HTTP {resp.status}"
                return url, None
            except Exception as exc:  # noqa: BLE001
                return url, str(exc)
        if e.code == 403 and host in SOFT_FAIL_HOSTS:
            return url, None
        return url, f"HTTP {e.code}"
    except Exception as exc:  # noqa: BLE001
        if host in SOFT_FAIL_HOSTS:
            return url, None
        return url, str(exc)


def validate_app_data(lessons: list[dict]) -> list[str]:
    errors: list[str] = []
    if not lessons:
        errors.append("lessons.json is empty")
        return errors

    orders = [l.get("order") for l in lessons]
    if len(orders) != len(set(orders)):
        errors.append("Duplicate lesson order ids in lessons.json")

    courses = sorted({l.get("course") for l in lessons})
    if courses != list(range(min(courses), max(courses) + 1)):
        errors.append(f"Non-contiguous course numbers: {courses}")

    for les in lessons:
        if les.get("type") == "Video":
            url = les.get("url") or ""
            open_how = les.get("open_how") or ""
            has_vid = bool(les.get("youtube_id")) or "youtube.com" in url or "youtu.be" in url
            external_ok = any(
                x in url or x in open_how
                for x in ("deeplearning.ai", "DL.AI", "Embed / YouTube", "Browser")
            )
            if not has_vid and not external_ok:
                errors.append(f"Video lesson missing play target: order={les.get('order')} {les.get('lesson')}")

    if not PUBLIC_LESSONS_JSON.exists():
        errors.append(f"Missing {PUBLIC_LESSONS_JSON} — run npm run curriculum")
    else:
        try:
            pub = json.loads(PUBLIC_LESSONS_JSON.read_text(encoding="utf-8"))
            if not pub.get("courses_ref"):
                errors.append("public/data/lessons.json missing courses_ref")
        except json.JSONDecodeError:
            errors.append("public/data/lessons.json is invalid JSON")

    return errors


def _youtube_id_from_url(url: str) -> str:
    m = re.search(
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})",
        url or "",
    )
    return m.group(1) if m else ""


def validate_enrichment_quality(lessons: list[dict]) -> list[str]:
    """Warnings for mis-merged digest / duplicate YouTube ids."""
    warnings: list[str] = []
    yid_orders: dict[str, list[int]] = {}

    for les in lessons:
        order = les.get("order")
        digest = les.get("digest")
        if digest and not digest_matches_lesson(les, digest):
            warnings.append(
                f"digest title mismatch (order={order}): "
                f"lesson={les.get('lesson')!r} digest={digest.get('title')!r}"
            )
        url = (les.get("url") or "").strip()
        yid = les.get("youtube_id") or ""
        if yid:
            yid_orders.setdefault(yid, []).append(int(order))
        if yid and "youtube" in url:
            expected = _youtube_id_from_url(url)
            if expected and expected != yid:
                warnings.append(f"youtube_id drift order={order}: stored={yid} url={expected}")

    for yid, orders in yid_orders.items():
        if len(orders) > 4:
            warnings.append(f"youtube_id {yid} attached to {len(orders)} lessons (orders {orders[:8]}…)")

    missing_theory = sum(1 for les in lessons if not (les.get("theory_summary") or "").strip())
    if missing_theory:
        warnings.append(f"{missing_theory} lessons missing theory_summary")

    thin_hints = 0
    for les in lessons:
        h = get_topic_hint(les)
        if not (h.get("one_liner") or "").strip() or len(h.get("concepts") or []) < 1:
            thin_hints += 1
    if thin_hints:
        warnings.append(f"{thin_hints} lessons with thin topic hints (should be 0)")

    orders = {int(les["order"]) for les in lessons if les.get("order") is not None}
    handbook_orders = set(HANDBOOK_BY_ORDER.keys())
    missing_handbook = sorted(orders - handbook_orders)
    if missing_handbook:
        warnings.append(
            f"{len(missing_handbook)} lessons missing topic_handbook entry (orders {missing_handbook[:8]}…)"
        )
    handbook_json_path = REPO_ROOT / "data" / "topic_handbook.json"
    merged_handbook: dict[int, dict] = {}
    if handbook_json_path.exists():
        raw = json.loads(handbook_json_path.read_text(encoding="utf-8"))
        merged_handbook = {int(k): v for k, v in raw.items()}

    shallow_handbook = 0
    short_handbook = 0
    for oid in orders & handbook_orders:
        row = merged_handbook.get(oid) or HANDBOOK_BY_ORDER[oid]
        if not (row.get("intermediate_deep_dive") or "").strip() or not (row.get("advanced_extra") or "").strip():
            shallow_handbook += 1
        if len((row.get("intermediate_deep_dive") or "")) < 720 or len((row.get("advanced_extra") or "")) < 720:
            short_handbook += 1
    if shallow_handbook:
        warnings.append(f"{shallow_handbook} handbook rows missing intermediate_deep_dive or advanced_extra")
    if short_handbook:
        warnings.append(f"{short_handbook} handbook rows with intermediate/advanced < 720 chars (re-run merge_topic_handbook)")

    missing_levels = sum(
        1
        for les in lessons
        if not les.get("theory_levels", {}).get("beginner")
        or not les.get("theory_levels", {}).get("advanced")
    )
    if missing_levels:
        warnings.append(f"{missing_levels} lessons missing theory_levels beginner/advanced")

    shallow_advanced = 0
    advanced_shorter_than_beginner = 0
    for les in lessons:
        levels = les.get("theory_levels") or {}
        adv = (levels.get("advanced") or "").strip()
        beg = (levels.get("beginner") or "").strip()
        if len(adv) < 1600:
            shallow_advanced += 1
        if adv and beg and len(adv) < len(beg):
            advanced_shorter_than_beginner += 1
    try:
        from topic_theory_docs import list_studio_guide_orders, validate_studio_orders

        studio_orders = set(list_studio_guide_orders())
        if studio_orders:
            warnings.append(
                f"{len(studio_orders)} topics use studio visual guides (docs/topic_theory/*.studio.md)"
            )
        for issue in validate_studio_orders({int(les["order"]) for les in lessons}):
            warnings.append(issue)
    except ImportError:
        pass

    if shallow_advanced:
        warnings.append(f"{shallow_advanced} lessons with advanced theory < 1600 chars (target richer platform depth)")

    missing_mermaid = sum(
        1
        for les in lessons
        if "```mermaid" not in (les.get("theory_levels") or {}).get("beginner", "")
    )
    if missing_mermaid:
        warnings.append(f"{missing_mermaid} lessons missing mermaid diagram in beginner theory")
    if advanced_shorter_than_beginner:
        warnings.append(
            f"{advanced_shorter_than_beginner} lessons where advanced is shorter than beginner (inverted depth)"
        )

    missing_de_lab: list[str] = []
    build_prove_courses = {
        str(les.get("course"))
        for les in lessons
        if les.get("type") in ("Build", "Prove", "Capstone")
    }
    for course_id in [str(c) for c in range(16)]:
        sample = next((les for les in lessons if str(les.get("course")) == course_id), None)
        if not sample:
            missing_de_lab.append(f"course {course_id}: no lessons")
            continue
        de = (sample.get("lab_plan") or {}).get("de_lab") or {}
        if not (de.get("scenario_markdown") or "").strip():
            missing_de_lab.append(f"course {course_id}: lab_plan.de_lab missing")
        elif course_id in build_prove_courses and not (de.get("code_snippets") or []):
            missing_de_lab.append(f"course {course_id}: de_lab has no code_snippets (Build/Prove path)")
    if missing_de_lab:
        for msg in missing_de_lab:
            warnings.append(f"lab_scenarios: {msg}")

    link_issues: list[str] = []
    for les in lessons:
        link_issues.extend(validate_lesson_links(les))
    if link_issues:
        warnings.append(f"{len(link_issues)} link-quality issues (paid/shallow/read-repo):")
        warnings.extend(link_issues[:25])
        if len(link_issues) > 25:
            warnings.append(f"… and {len(link_issues) - 25} more link-quality issues")

    return warnings


def validate_track_vs_lessons(lessons: list[dict]) -> list[str]:
    warnings: list[str] = []
    track_urls = track_checkbox_urls()
    app_primary = {(l.get("url") or "").strip() for l in lessons if (l.get("url") or "").startswith("http")}
    missing_in_app = sorted(track_urls - app_primary)
    extra_in_app = sorted(app_primary - track_urls)

    # Spine / generated rows may add URLs not in checkbox form
    if len(missing_in_app) > 15:
        warnings.append(f"{len(missing_in_app)} track checkbox URLs not found as primary lesson URLs (first 5): {missing_in_app[:5]}")
    elif missing_in_app:
        warnings.append(f"Track URLs not in app primary url field: {missing_in_app[:10]}")

    if len(extra_in_app) > 30:
        warnings.append(f"{len(extra_in_app)} app lesson URLs not from track checkboxes (spine/enrichment ok)")
    return warnings


def collect_all_urls(lessons: list[dict]) -> set[str]:
    urls: set[str] = set()
    for path in DOCS.glob("*.md"):
        urls |= extract_http_urls_from_text(path.read_text(encoding="utf-8"))
    urls |= lesson_urls(lessons)
    return urls


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-http", action="store_true", help="Skip network link checks")
    parser.add_argument("--timeout", type=float, default=12.0)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()

    failures: list[str] = []
    warnings: list[str] = []

    if not TRACK.exists():
        failures.append(f"Missing track: {TRACK}")

    master = DOCS / "AI_System_Engineer_Master_Plan.md"
    if not master.exists():
        failures.append(f"Missing master plan: {master}")

    lessons = load_lessons()
    failures.extend(validate_app_data(lessons))
    warnings.extend(validate_track_vs_lessons(lessons))
    warnings.extend(validate_enrichment_quality(lessons))

    rel_dead = []
    for path in DOCS.glob("*.md"):
        for _l, url in LINK_RE.findall(path.read_text(encoding="utf-8")):
            url = url.strip()
            if url.startswith("http") or url.startswith("#") or url.startswith("mailto:"):
                continue
            if url.startswith("./") or (url.endswith(".md") and not url.startswith("http")):
                target = (path.parent / url.removeprefix("./")).resolve()
                if not target.exists():
                    rel_dead.append(f"{path.name} → {url}")
    if rel_dead:
        failures.extend([f"Broken relative link: {x}" for x in rel_dead])

    urls = sorted(collect_all_urls(lessons))
    print(f"Lessons: {len(lessons)} | Unique HTTP URLs: {len(urls)}")

    if not args.skip_http:
        broken: list[str] = []
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = {pool.submit(check_url, u, args.timeout): u for u in urls}
            for fut in as_completed(futures):
                url, err = fut.result()
                if err:
                    broken.append(f"{url} — {err}")
        if broken:
            failures.append(f"{len(broken)} broken HTTP URLs")
            for line in sorted(broken)[:25]:
                print(f"  FAIL {line}")
            if len(broken) > 25:
                print(f"  ... and {len(broken) - 25} more")

    for w in warnings:
        print(f"WARN {w}")

    if failures:
        print("\nVALIDATION FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print("\nVALIDATION OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
