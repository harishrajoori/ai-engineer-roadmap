# Implementation catalog hygiene (monthly)

The studio links **topic-scoped** repos from `data/implementation_repo_catalog.json` (validated by `npm run validate:repos` and `scripts/audit_implementation_resources.py`). Use this checklist once a month or before a major curriculum release.

## Checklist

1. **Run audits locally**
   ```bash
   npm run validate:repos
   python3 scripts/audit_implementation_resources.py
   ```
2. **Stale attachments** — fix or remove catalog entries that no longer match lesson keywords (`url_match` too short or wrong).
3. **Drift** — ensure `pick_repos` logic in generators still aligns with lessons (audit reports `pick_repos vs lessons.json drift`).
4. **Hub root URLs** — lessons should link to subpaths, not monorepo roots only.
5. **Regenerate** after catalog edits:
   ```bash
   npm run curriculum
   npm run validate:ci
   ```

## Owners

- Curriculum / track editors: lesson text and prove criteria
- Platform maintainers: catalog JSON + validation scripts

See also [`DOCUMENTATION_MAP.md`](./DOCUMENTATION_MAP.md) and the studio audit backlog in [`audit/AI_Systems_Engineer_Studio_Full_Audit_Review.md`](./audit/AI_Systems_Engineer_Studio_Full_Audit_Review.md).
