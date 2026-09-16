/**
 * Client-side token budgets and usage tracking (estimates + provider usage when returned).
 * Stored in localStorage; no server sync.
 */

const GOVERNANCE_KEY = "studio_token_governance";
const DEPTH_KEY = "mentor_reply_depth";

/** Applied only when user explicitly sets a budget in Settings (not for first-time learners). */
const DEFAULT_DAILY_BUDGET = 120_000;
const DEFAULT_WARN_PERCENT = 80;

/** @typedef {{ prompt_tokens: number, completion_tokens: number, total_tokens: number, estimated?: boolean }} TokenUsage */

export const REPLY_DEPTHS = {
  brief: {
    id: "brief",
    label: "Brief",
    maxOutputTokens: 384,
    wordHint: "80–120 words",
  },
  standard: {
    id: "standard",
    label: "Standard",
    maxOutputTokens: 1024,
    wordHint: "150–250 words",
  },
  deep: {
    id: "deep",
    label: "Deep",
    maxOutputTokens: 2048,
    wordHint: "300–450 words",
  },
};

export function readReplyDepth() {
  const raw = localStorage.getItem(DEPTH_KEY);
  if (raw && REPLY_DEPTHS[raw]) {
    return raw;
  }
  return "brief";
}

export function saveReplyDepth(depthId) {
  if (!REPLY_DEPTHS[depthId]) {
    return;
  }
  localStorage.setItem(DEPTH_KEY, depthId);
}

export function depthConfig(depthId) {
  return REPLY_DEPTHS[depthId] || REPLY_DEPTHS.standard;
}

/** Rough token estimate (~4 chars per token for English prose). */
export function estimateTokensFromText(text) {
  if (!text) {
    return 0;
  }
  return Math.max(1, Math.ceil(String(text).length / 4));
}

export function readGovernanceSettings() {
  try {
    const raw = localStorage.getItem(GOVERNANCE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const daily =
        parsed.dailyBudgetTokens === 0 || parsed.dailyBudgetTokens === null
          ? null
          : Number(parsed.dailyBudgetTokens) || DEFAULT_DAILY_BUDGET;
      return {
        dailyBudgetTokens: daily,
        warnAtPercent: Number(parsed.warnAtPercent) || DEFAULT_WARN_PERCENT,
        byDay: parsed.byDay && typeof parsed.byDay === "object" ? parsed.byDay : {},
        session: normalizeBucket(parsed.session),
      };
    }
  } catch {
    /* ignore */
  }
  return {
    dailyBudgetTokens: null,
    warnAtPercent: DEFAULT_WARN_PERCENT,
    byDay: {},
    session: emptyBucket(),
  };
}

function emptyBucket() {
  return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, requests: 0 };
}

function normalizeBucket(b) {
  if (!b || typeof b !== "object") {
    return emptyBucket();
  }
  return {
    prompt_tokens: Number(b.prompt_tokens) || 0,
    completion_tokens: Number(b.completion_tokens) || 0,
    total_tokens: Number(b.total_tokens) || 0,
    requests: Number(b.requests) || 0,
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function persistGovernance(state) {
  localStorage.setItem(
    GOVERNANCE_KEY,
    JSON.stringify({
      dailyBudgetTokens: state.dailyBudgetTokens,
      warnAtPercent: state.warnAtPercent,
      byDay: state.byDay,
      session: state.session,
    }),
  );
}

/** @param {TokenUsage} usage */
export function recordTokenUsage(usage) {
  if (!usage?.total_tokens) {
    return readUsageSnapshot();
  }
  const state = readGovernanceSettings();
  const day = todayKey();

  const add = (bucket) => ({
    prompt_tokens: bucket.prompt_tokens + (usage.prompt_tokens || 0),
    completion_tokens: bucket.completion_tokens + (usage.completion_tokens || 0),
    total_tokens: bucket.total_tokens + (usage.total_tokens || 0),
    requests: bucket.requests + 1,
  });

  state.session = add(state.session);
  state.byDay[day] = add(normalizeBucket(state.byDay[day]));
  persistGovernance(state);
  return readUsageSnapshot(state);
}

export function resetSessionUsage() {
  const state = readGovernanceSettings();
  state.session = emptyBucket();
  persistGovernance(state);
  return readUsageSnapshot(state);
}

export function saveGovernanceSettings({ dailyBudgetTokens, warnAtPercent }) {
  const state = readGovernanceSettings();
  if (dailyBudgetTokens === 0 || dailyBudgetTokens === "" || dailyBudgetTokens === null) {
    state.dailyBudgetTokens = null;
  } else {
    const n = Number(dailyBudgetTokens);
    state.dailyBudgetTokens = Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_DAILY_BUDGET;
  }
  if (warnAtPercent != null) {
    const w = Number(warnAtPercent);
    if (Number.isFinite(w) && w >= 50 && w <= 99) {
      state.warnAtPercent = w;
    }
  }
  persistGovernance(state);
  return readUsageSnapshot(state);
}

export function readUsageSnapshot(stateIn) {
  const state = stateIn || readGovernanceSettings();
  const day = todayKey();
  const today = normalizeBucket(state.byDay[day]);
  const budget = state.dailyBudgetTokens;
  const remainingToday = budget == null ? null : Math.max(0, budget - today.total_tokens);
  const usedPctToday = budget == null ? null : Math.min(100, Math.round((today.total_tokens / budget) * 100));

  return {
    session: state.session,
    today,
    dailyBudgetTokens: budget,
    remainingToday,
    usedPctToday,
    warnAtPercent: state.warnAtPercent,
  };
}

/**
 * Pre-flight check before a mentor request.
 * @param {{ estimatedInput: number, maxOutput: number }} params
 */
export function checkTokenBudget({ estimatedInput, maxOutput }) {
  const snapshot = readUsageSnapshot();
  const estimatedRequest = estimatedInput + maxOutput;
  const budget = snapshot.dailyBudgetTokens;

  if (budget == null) {
    return { allowed: true, level: "ok", message: null, snapshot, estimatedRequest };
  }

  const projected = snapshot.today.total_tokens + estimatedRequest;
  if (projected > budget) {
    return {
      allowed: false,
      level: "blocked",
      message: `Daily token budget reached (~${formatTokenCount(budget)}). Raise the limit in Settings, use Brief depth, or try again tomorrow. Session today: ~${formatTokenCount(snapshot.today.total_tokens)}.`,
      snapshot,
      estimatedRequest,
    };
  }

  const warnThreshold = (budget * snapshot.warnAtPercent) / 100;
  if (projected >= warnThreshold) {
    return {
      allowed: true,
      level: "warn",
      message: `~${formatTokenCount(remainingAfter(projected, budget))} of today's budget left after this reply (cap ~${formatTokenCount(maxOutput)} out).`,
      snapshot,
      estimatedRequest,
    };
  }

  return { allowed: true, level: "ok", message: null, snapshot, estimatedRequest };
}

function remainingAfter(projected, budget) {
  return Math.max(0, budget - projected);
}

export function formatTokenCount(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 10_000) {
    return `${Math.round(v / 1000)}k`;
  }
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)}k`;
  }
  return String(Math.round(v));
}

export function formatUsageLine(usage, estimatedRequest) {
  if (!usage) {
    return "";
  }
  const est = usage.estimated ? "~" : "";
  const parts = [
    `in ${est}${formatTokenCount(usage.prompt_tokens)}`,
    `out ${est}${formatTokenCount(usage.completion_tokens)}`,
  ];
  if (estimatedRequest) {
    parts.push(`reserved cap ~${formatTokenCount(estimatedRequest)}`);
  }
  return parts.join(" · ");
}
