import React from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { REPLY_DEPTHS, formatTokenCount } from "../utils/tokenGovernance";

export default function MentorTokenBar({
  snapshot,
  replyDepth,
  onReplyDepthChange,
  lastUsageLine,
  onResetSession,
  budgetWarning,
}) {
  const depth = REPLY_DEPTHS[replyDepth] || REPLY_DEPTHS.standard;
  const budget = snapshot?.dailyBudgetTokens;
  const todayTotal = snapshot?.today?.total_tokens ?? 0;
  const sessionTotal = snapshot?.session?.total_tokens ?? 0;
  const requests = snapshot?.session?.requests ?? 0;

  const budgetLabel =
    budget == null
      ? "Daily budget: off"
      : `Today ~${formatTokenCount(todayTotal)} / ${formatTokenCount(budget)}`;

  const pct = snapshot?.usedPctToday;

  return (
    <div className="mentor-token-bar" role="region" aria-label="Token usage">
      <div className="mentor-token-bar-row">
        <Gauge size={13} aria-hidden />
        <span className="mentor-token-stat" title="Estimated or provider-reported tokens">
          Session ~{formatTokenCount(sessionTotal)} · {requests} req
        </span>
        <span className="mentor-token-stat mentor-token-budget">{budgetLabel}</span>
        {pct != null && budget != null && (
          <span
            className={`mentor-token-pct ${pct >= (snapshot.warnAtPercent ?? 80) ? "mentor-token-pct-warn" : ""}`}
          >
            {pct}%
          </span>
        )}
        <button
          type="button"
          className="mentor-token-reset"
          onClick={onResetSession}
          title="Reset session counters (does not change provider billing)"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      <div className="mentor-token-bar-row mentor-token-depth-row">
        <span className="mentor-token-label">Reply depth</span>
        {Object.values(REPLY_DEPTHS).map((d) => (
          <button
            key={d.id}
            type="button"
            className={`mentor-depth-btn ${d.id === depth.id ? "active" : ""}`}
            onClick={() => onReplyDepthChange?.(d.id)}
            title={`Max ~${d.maxOutputTokens} output tokens · ${d.wordHint}`}
          >
            {d.label}
          </button>
        ))}
        <span className="mentor-token-cap">cap ~{formatTokenCount(depth.maxOutputTokens)} out</span>
      </div>

      {budgetWarning && <p className="mentor-token-warning">{budgetWarning}</p>}
      {lastUsageLine && <p className="mentor-token-last">Last: {lastUsageLine}</p>}
      <p className="mentor-token-hint">
        Each message includes compact lesson context + up to 2 prior turns. Counters are local estimates unless the
        provider returns usage.
      </p>
    </div>
  );
}
