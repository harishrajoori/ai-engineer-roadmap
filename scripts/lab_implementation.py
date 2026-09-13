"""Build per-topic lab implementation plans for the studio Lab tab."""

from __future__ import annotations

from typing import Any

from append_implementation_repos import local_setup_for_lesson
from curriculum_enrichment import prove_pack_for_course, real_world_for_course
from topic_hints import get_topic_hint


def _implementation_resources(row: dict) -> list[dict]:
    out: list[dict] = []
    for res in row.get("resources") or []:
        if (res.get("type") or "").lower() != "implementation":
            continue
        url = (res.get("url") or "").strip()
        if not url.startswith("http"):
            continue
        out.append(
            {
                "title": (res.get("title") or "Implementation reference").strip(),
                "url": url,
                "description": (res.get("description") or "").strip(),
            }
        )
    return out


def _orient_bullets(hint: dict[str, Any], lesson: dict) -> list[str]:
    bullets: list[str] = []
    if hint.get("why_now"):
        bullets.append(str(hint["why_now"]))
    for section in hint.get("read_sections") or []:
        bullets.append(f"Read: {section}")
    for item in hint.get("watch_for") or []:
        bullets.append(f"Watch for: {item}")
    url = (lesson.get("url") or "").strip()
    if url.startswith("http"):
        bullets.append(f"Primary source: {url}")
    return bullets


def build_lab_plan(row: dict) -> dict[str, Any]:
    """Structured build → verify → prove steps for Lab tab and worksheets."""
    course = row.get("course", "")
    hint = get_topic_hint(row)
    prove_pack = prove_pack_for_course(course)
    real_world = real_world_for_course(course)
    ltype = row.get("type") or "Read"

    steps: list[dict[str, Any]] = []

    orient_detail = (hint.get("one_liner") or "").strip()
    orient_bullets = _orient_bullets(hint, row)
    if orient_detail or orient_bullets:
        steps.append(
            {
                "id": "orient",
                "title": "Orient",
                "detail": orient_detail or f"Understand {row.get('lesson') or 'this topic'} before you code.",
                "bullets": orient_bullets,
            }
        )

    implement_bullets: list[str] = []
    if ltype == "Build":
        build_text = (row.get("lesson") or "").strip()
        if build_text:
            implement_bullets.append(build_text)
    if hint.get("capstone_action"):
        implement_bullets.append(str(hint["capstone_action"]))
    if row.get("prove_criteria"):
        implement_bullets.append(f"Topic bar: {row['prove_criteria']}")

    ladder = real_world.get("practice_ladder") or []
    for entry in ladder:
        if not isinstance(entry, dict):
            continue
        name = (entry.get("name") or f"Step {entry.get('step', '')}").strip()
        action = (entry.get("action") or "").strip()
        exit_criteria = (entry.get("exit") or "").strip()
        line = f"{name}: {action}".strip(": ")
        if exit_criteria:
            line = f"{line} (exit: {exit_criteria})"
        if line:
            implement_bullets.append(line)

    if implement_bullets:
        steps.append(
            {
                "id": "implement",
                "title": "Implement in your portfolio repo",
                "detail": "Create or extend a module under your public repo; use synthetic or public data only.",
                "bullets": implement_bullets,
            }
        )

    commands = list(prove_pack.get("commands") or [])
    verify_bullets = [
        "Run unit/integration tests locally (e.g. pytest) before you mark this topic complete.",
    ]
    if commands:
        verify_bullets.append("Course prove commands (copy from Lab tab):")
        verify_bullets.extend(commands)

    steps.append(
        {
            "id": "verify",
            "title": "Verify",
            "detail": "Green tests and logged metrics beat slide-deck completion.",
            "bullets": verify_bullets,
            "commands": commands,
        }
    )

    prove_bullets = [
        "Link your portfolio repo and/or a milestone URL (PR, tag, Colab, demo) in the Lab tab.",
    ]
    if real_world.get("maps_to_prove"):
        prove_bullets.append(str(real_world["maps_to_prove"]))
    acceptance = prove_pack.get("acceptance") or []
    if acceptance:
        prove_bullets.append(
            f"Check off required items on the course acceptance checklist ({len(acceptance)} rows).",
        )

    steps.append(
        {
            "id": "prove",
            "title": "Capture evidence",
            "detail": "The studio tracks links and checklist—it does not auto-grade your repo.",
            "bullets": prove_bullets,
        }
    )

    done_when = (hint.get("done_when") or "").strip()
    if not done_when and prove_pack.get("title"):
        done_when = f"You can demo {prove_pack['title']} from your repo with tests passing."

    local_setup = local_setup_for_lesson(row)

    return {
        "title": "Implementation plan",
        "done_when": done_when,
        "steps": steps,
        "implementation_links": _implementation_resources(row),
        "local_setup": local_setup,
    }


def attach_lab_plan(row: dict) -> None:
    row["lab_plan"] = build_lab_plan(row)
