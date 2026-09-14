---
title: MCP tools + audit log
---

# Build — MCP tools with audit trail

```mermaid
sequenceDiagram
  participant Agent
  participant MCP as MCP server
  participant DB as Staging DB
  participant AUD as audit.jsonl
  Agent->>MCP: lookup_schema
  MCP->>AUD: append row
  MCP-->>Agent: columns
  Agent->>MCP: run_readonly_sql
  MCP->>DB: SELECT (allow-list)
  MCP->>AUD: append row
```

## DE scenario

Replace “paste SQL into ChatGPT” with **allow-listed tools** and an **append-only audit log**—same compliance story as logged stored procedures.

Implement: `lookup_schema`, `query_golden_set`, `run_readonly_sql` (see Lab code card).
