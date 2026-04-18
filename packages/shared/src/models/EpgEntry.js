/**
 * Decodes Base64-encoded strings with proper UTF-8 support.
 * The Xtream API returns title/description as Base64.
 * Standard atob() breaks on non-ASCII (Umlauts, Arabic, CJK).
 */
const decodeBase64Utf8 = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    try { return atob(str); } catch { return ''; }
  }
};

/**
 * Normalizes a raw Xtream EPG listing into a clean EpgEntry.
 *
 * Raw fields → normalized:
 *   title            → title (Base64 decoded)
 *   description      → description (Base64 decoded)
 *   start_timestamp  → start (unix seconds, number)
 *   stop_timestamp   → end (unix seconds, number)
 *   stream_id        → channelId
 */
const EpgEntry = (raw) => ({
  title:       decodeBase64Utf8(raw.title),
  description: decodeBase64Utf8(raw.description),
  start:       Number(raw.start_timestamp) || 0,
  end:         Number(raw.stop_timestamp) || 0,
  channelId:   raw.stream_id,
});

/**
 * Calculate the progress of an EPG entry (0-1).
 * Returns 0 if the entry is null, hasn't started, or has ended.
 */
const getEpgProgress = (epg) => {
  if (!epg || !epg.start || !epg.end) return 0;
  const now = Date.now() / 1000;
  if (now < epg.start || now >= epg.end) return 0;
  return Math.min(1, (now - epg.start) / (epg.end - epg.start));
};

/**
 * From a list of EPG entries, find the one currently airing.
 */
const getCurrentEpg = (entries) => {
  if (!entries || !entries.length) return null;
  const now = Date.now() / 1000;
  return entries.find(e => now >= e.start && now < e.end) || null;
};

export default EpgEntry;
export {EpgEntry, getEpgProgress, getCurrentEpg, decodeBase64Utf8};
