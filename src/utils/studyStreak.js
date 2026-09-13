const STUDY_DAYS_KEY = "ai_hub_react_study_days";

/** Local calendar date YYYY-MM-DD (not UTC). */
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * @returns {string[]} ISO date strings (YYYY-MM-DD) when the user completed at least one lesson.
 */
export function loadStudyDays() {
  try {
    const raw = localStorage.getItem(STUDY_DAYS_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudyDays(days) {
  localStorage.setItem(STUDY_DAYS_KEY, JSON.stringify(days));
}

/**
 * Record today as a study day (deduped).
 */
export function recordStudyDay(existingDays) {
  const today = localDateKey();
  if (existingDays.includes(today)) {
    return existingDays;
  }
  return [...existingDays, today].sort();
}

/**
 * Consecutive calendar days with study activity ending today (or yesterday if none today).
 */
export function computeStreakDays(studyDays) {
  if (!studyDays?.length) {
    return 0;
  }
  const set = new Set(studyDays);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const today = localDateKey(cursor);
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = localDateKey(yesterday);

  if (!set.has(today) && !set.has(yesterdayStr)) {
    return 0;
  }

  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = localDateKey(cursor);
    if (!set.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
