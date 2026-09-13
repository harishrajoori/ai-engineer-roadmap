/**
 * Minimal Cloudflare Worker for AI Engineer Studio cloud sync.
 * Binds KV namespace STUDIO_KV. Deploy: see sync-worker/README.md
 *
 * GET  ?userId=<google-sub>  -> { state, updatedAt }
 * POST { userId, state, updatedAt } -> stores JSON blob
 */

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);

    if (request.method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const raw = await env.STUDIO_KV.get(userId);
      if (!raw) {
        return new Response(JSON.stringify({ state: null }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      return new Response(raw, { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "invalid json" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const userId = body.userId;
      const state = body.state || body;
      if (!userId || !state) {
        return new Response(JSON.stringify({ error: "userId and state required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      const existingRaw = await env.STUDIO_KV.get(userId);
      if (existingRaw) {
        try {
          const existing = JSON.parse(existingRaw);
          const existingAt = Date.parse(existing.updatedAt || existing.state?.updatedAt || 0);
          const incomingAt = Date.parse(state.updatedAt || body.updatedAt || 0);
          if (existingAt > incomingAt) {
            return new Response(JSON.stringify({ ok: true, skipped: "stale" }), {
              headers: { ...cors, "Content-Type": "application/json" },
            });
          }
        } catch {
          /* overwrite corrupt */
        }
      }

      const toStore = JSON.stringify({
        updatedAt: state.updatedAt || body.updatedAt || new Date().toISOString(),
        state,
        regenerations: state.regenerations,
      });
      await env.STUDIO_KV.put(userId, toStore);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response("method not allowed", { status: 405, headers: cors });
  },
};
