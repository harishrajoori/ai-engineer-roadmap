/**
 * Normalize titles for duplicate h1 detection (generated theory vs lesson hero).
 */
function normalizeTitle(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\*\(optional\)\*\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Drop leading `# Title` when it matches the lesson hero title (avoids double heading).
 *
 * @param {string} markdown
 * @param {string | undefined} lessonTitle
 */
export function stripDuplicateTheoryTitle(markdown, lessonTitle) {
  if (!markdown || !lessonTitle) {
    return markdown || "";
  }
  const lines = markdown.split("\n");
  if (!lines[0]?.startsWith("# ")) {
    return markdown;
  }
  const h1 = lines[0].slice(2).trim();
  if (normalizeTitle(h1) !== normalizeTitle(lessonTitle)) {
    return markdown;
  }
  let start = 1;
  while (start < lines.length && lines[start].trim() === "") {
    start += 1;
  }
  return lines.slice(start).join("\n");
}
