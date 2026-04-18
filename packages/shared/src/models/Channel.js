/**
 * Normalizes a raw Xtream API stream object into a clean Channel.
 *
 * Raw fields → normalized:
 *   stream_id        → id
 *   stream_icon      → icon  (empty string → null)
 *   epg_channel_id   → epgId (empty string → null)
 *   is_adult         → isAdult  (0/1 → boolean)
 *   tv_archive       → hasCatchUp (0/1 → boolean)
 *   tv_archive_duration → catchUpDays
 *   category_id      → categoryId
 *   category_ids     → categoryIds
 *   added            → addedAt (unix string → number)
 */
const Channel = (raw) => ({
  id:           raw.stream_id,
  name:         raw.name,
  icon:         raw.stream_icon || null,
  epgId:        raw.epg_channel_id || null,
  isAdult:      !!raw.is_adult,
  hasCatchUp:   !!raw.tv_archive,
  catchUpDays:  raw.tv_archive_duration || 0,
  categoryId:   raw.category_id,
  categoryIds:  raw.category_ids || [],
  addedAt:      Number(raw.added) || 0,
});

export default Channel;
export {Channel};
