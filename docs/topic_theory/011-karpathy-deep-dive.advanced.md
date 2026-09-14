# Karpathy — Deep Dive into LLMs

> **Platform depth** — read **Foundations** and the **Visual guide** before this layer.

## Platform narrative

Use the deep dive to separate **what you buy** (frontier API, managed inference) from **what you own** (gateway, prompts, schemas, golden sets, eval CI). Speculative decoding, continuous batching, and custom CUDA kernels are Month 13+ concerns—document a **baseline** gateway metric table first.

## Rollout depth

While watching, maintain a knob table in `docs/MONTH1_NOTES.md`:

| Knob | Latency | Cost | Your extraction policy |
| --- | --- | --- | --- |
| Context length | ↑ TTFT / memory | ↑ prompt tokens | Truncate logs; summarize only with tests |
| max_tokens | ↑ decode time | ↑ completion tokens | Cap JSON size in schema |
| Model tier | ↓ err rate, ↑ $ | ↑ $/1M tokens | Primary + fallback in LiteLLM |
| Temperature | ↓ variance | neutral | ≤0.2 for structured output |

## Failure modes

- Tuning GPUs or model size before golden-set quality plateaus.
- Logging only latency without **token attribution** (cannot explain invoices).
- Treating long RAG context as “the model remembers” instead of billed prefill.

## Metrics and alerts

- `prompt_tokens`, `completion_tokens`, `latency_ms_p50/p99`, `usd_per_request`
- Alert: `completion_tokens` p99 spike after a prompt change (regression or runaway generation).
- Alert: fallback rate ↑ after routing change.

## Interview depth

- Why does TTFT spike with long prompts but token/sec might still look fine?
- When would you self-host (vLLM) vs stay on API—tie to eval + cost evidence, not hype.

## Decision record (fill before you ship)

| Stance | Your choice | Rationale |
| --- | --- | --- |
| Adopt now | … | Why Karpathy deep dive informs gateway SLOs this month |
| Experiment | … | What you will measure in two weeks (tokens, TTFT) |
| Defer | … | GPU/self-host paths deferred until Course 13 with evidence |

## Capstone implementation

Log `prompt_tokens`, `completion_tokens`, `latency_ms`, and `usd` for one LiteLLM call in README. Write one paragraph: if P99 latency doubled, would you blame prefill, decode, or network—and how would you verify?

## Extended platform notes

- Pair this video with Course 1 **Build**: every model call must flow through the gateway with usage metadata.
- Relate **context window** policy to log truncation in your reconciler—do not silently drop fields without audit.
- When stakeholders ask for “bigger context,” respond with a **cost table**, not a boolean yes.

## Optional build-from-scratch

Not required for prove. See [`OPTIONAL_MODEL_DEPTH.md`](../OPTIONAL_MODEL_DEPTH.md) for nanoGPT and self-attention labs.

## Advanced done bar

One paragraph relates P99 latency to token volume; gateway README row is reproducible from documented CLI command.
