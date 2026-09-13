const STUDY_DAYS_KEY = "ai_hub_react_study_days";

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
  const today = new Date().toISOString().slice(0, 10);
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

  const today = cursor.toISOString().slice(0, 10);
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (!set.has(today) && !set.has(yesterdayStr)) {
    return 0;
  }

  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
