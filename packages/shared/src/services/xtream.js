import Channel from '../models/Channel';
import Category from '../models/Category';
import EpgEntry from '../models/EpgEntry';

const jsonOrThrow = (r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

/**
 * Creates a parametrized Xtream API client.
 * Used by both TV-App (credentials from Firebase) and Web-App (credentials from user input).
 *
 * @param {Object} credentials - {host, username, password}
 * @returns {Object} API client with all Xtream endpoints
 */
export const createXtreamClient = ({host, username, password}) => {
  const BASE = `${host}/player_api.php?username=${username}&password=${password}`;
  const api = (action = '') => action ? `${BASE}&action=${action}` : BASE;

  return {
    getAccountInfo: () =>
      fetch(api()).then(jsonOrThrow),

    getLiveCategories: () =>
      fetch(api('get_live_categories'))
        .then(jsonOrThrow)
        .then(data => (Array.isArray(data) ? data : []).map(Category)),

    getLiveStreams: (categoryId) =>
      fetch(api(`get_live_streams${categoryId ? `&category_id=${categoryId}` : ''}`))
        .then(jsonOrThrow)
        .then(data => (Array.isArray(data) ? data : []).map(Channel)),

    getShortEpg: (streamId) =>
      fetch(api(`get_short_epg&stream_id=${streamId}`))
        .then(jsonOrThrow)
        .then(data => {
          const listings = data?.epg_listings;
          return (Array.isArray(listings) ? listings : []).map(EpgEntry);
        }),

    getStreamUrl: (id) =>
      `${host}/live/${username}/${password}/${id}.m3u8`,
  };
};

export default createXtreamClient;
