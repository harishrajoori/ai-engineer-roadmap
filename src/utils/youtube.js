/**
 * Extract an 11-char YouTube video id from a watch or youtu.be URL.
 */
export function youtubeIdFromUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

export function isLikelyYoutubeId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id);
}
