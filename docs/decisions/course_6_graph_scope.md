# ADR: Course 6 graph scope (audit follow-up)

**Date:** 2026-09-16  
**Status:** Accepted  

## Context

The Grok audit asked whether Course 6 should be **thickened** into a full GraphRAG product narrative or **demoted** to a short elective.

## Decision

**Keep Course 6 on the main spine** as a **single graph validator slice** (one passing + one failing Cypher test in CI), not a separate GraphRAG capstone.

## Rationale

- Aligns with the platform story: relational invariants beside extraction and RAG, not another product surface.
- Prove pack already requires pytest + README + sample output (`curriculum_enrichment.json` course `6`).
- DE lab scenario + code live in `lab_scenarios.json` course `6`.

## Consequences

- Do not add large Neo4j/GraphRAG optional tracks to Course 6 without rebaselining Courses 10–12 integration time.
- Interview narratives can cite “one validator test” as the graph touchpoint; frontier graph work stays in Course 13 electives if needed.
