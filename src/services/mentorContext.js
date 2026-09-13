import { depthConfig } from "../utils/tokenGovernance";

const MAX_THEORY_CHARS = 1400;
const MAX_PRIOR_TURNS = 2;
const MAX_TURN_CHARS = 480;

/**
 * Compact lesson grounding sent on every mentor request (not the full regenerate payload).
 */
export function buildLessonContextBlock(lesson, courseRef = {}) {
  if (!lesson) {
    return "";
  }

  const lines = [
    `Topic: "${lesson.lesson}"`,
    `Course ${lesson.course}: ${lesson.course_title || "n/a"}`,
    `Type: ${lesson.type || "lesson"} · Section: ${lesson.section || "syllabus"}`,
  ];

  const concepts = (courseRef.concepts || []).filter(Boolean).slice(0, 6);
  if (concepts.length) {
    lines.push(`Course concepts: ${concepts.join("; ")}`);
  }

  const digest = lesson.digest;
  if (digest?.takeaways?.length) {
    const tw = digest.takeaways.filter(Boolean).slice(0, 4);
    lines.push(`Key takeaways: ${tw.map((t) => `• ${t}`).join(" ")}`);
  }
  if (digest?.pitfalls?.length) {
    const pit = digest.pitfalls.filter(Boolean).slice(0, 2);
    lines.push(`Watch-outs: ${pit.join("; ")}`);
  }

  const theory = (lesson.theory_summary || "").trim();
  if (theory) {
    const snippet =
      theory.length > MAX_THEORY_CHARS ? `${theory.slice(0, MAX_THEORY_CHARS)}…` : theory;
    lines.push(`Curriculum excerpt (authoritative — do not contradict):\n${snippet}`);
  }

  if (lesson.prove_criteria) {
    lines.push(`Prove bar: ${String(lesson.prove_criteria).slice(0, 280)}`);
  }

  return lines.join("\n");
}

export function mentorSystemInstruction({ learnerName, depthId }) {
  const depth = depthConfig(depthId);
  const learner = learnerName || "the learner";
  return `You are a Principal AI System Engineer mentoring ${learner} toward Staff AI Platform Engineer.
Stay precise, systems-focused, and pragmatic (QPS, SLA, P99, cost/token, failure modes).
Ground answers in the lesson context the user provides; do not invent curriculum facts.

Reply depth: ${depth.label} — target ${depth.wordHint}.
Format in GitHub-flavored Markdown: ## headings when needed, bullets, **bold** for terms.
Use short fenced code blocks only when essential. End with **Takeaway** or **Next step** when helpful.`;
}

/**
 * Build OpenAI-style messages: system + optional prior turns + user with context.
 * @param {{ role: 'user' | 'ai', text: string }[]} uiMessages — full UI thread (excludes loading)
 */
export function buildMentorChatMessages({
  lesson,
  courseRef,
  userQuestion,
  uiMessages = [],
  learnerName,
  depthId,
}) {
  const system = mentorSystemInstruction({ learnerName, depthId });
  const contextBlock = buildLessonContextBlock(lesson, courseRef);

  const messages = [{ role: "system", content: system }];

  const prior = uiMessages
    .filter((m) => m.role === "user" || m.role === "ai")
    .filter((m) => !m.text.includes("API notice"))
    .slice(-MAX_PRIOR_TURNS * 2);

  for (const turn of prior) {
    const text = String(turn.text || "").slice(0, MAX_TURN_CHARS);
    if (!text.trim()) {
      continue;
    }
    messages.push({
      role: turn.role === "user" ? "user" : "assistant",
      content: text,
    });
  }

  const userBody = [
    "=== Lesson context (use for grounding) ===",
    contextBlock,
    "=== Learner question ===",
    userQuestion.trim(),
  ].join("\n\n");

  messages.push({ role: "user", content: userBody });

  return messages;
}

/** Estimate input tokens for budget pre-check. */
export function estimateMentorInputTokens(messages) {
  const chars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  return Math.max(1, Math.ceil(chars / 4));
}
