import {useState, useEffect, useCallback, useRef} from 'react';
import {getCurrentEpg} from '@zappix/shared';
import {getShortEpg} from '../api/xtream';

const MAX_CONCURRENT = 5;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Throttled batch-fetcher for EPG data.
 * Limits concurrent requests to MAX_CONCURRENT.
 */
const fetchBatch = async (channelIds, cache, onUpdate) => {
  const toFetch = channelIds.filter(id => !cache.current.has(id));
  if (!toFetch.length) return;

  // Process in chunks of MAX_CONCURRENT
  for (let i = 0; i < toFetch.length; i += MAX_CONCURRENT) {
    const chunk = toFetch.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(
      chunk.map(id => getShortEpg(id).then(entries => [id, entries]))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const [id, entries] = result.value;
        cache.current.set(id, entries);
      }
    }

    onUpdate();
  }
};

/**
 * Hook that provides EPG data for a list of channels.
 * Loads EPG viewport-based: fetches for visible channels + buffer.
 * Caches results and refreshes every 5 minutes.
 *
 * @param {Array} channels - Array of Channel model objects
 * @param {number} firstVisible - Index of first visible channel in list
 * @param {number} lastVisible - Index of last visible channel in list
 * @param {number} buffer - Extra channels to prefetch beyond visible range
 * @returns {Function} getChannelEpg(channelId) - returns current EPG entry or null
 */
const useEpg = (channels, firstVisible = 0, lastVisible = 20, buffer = 10) => {
  const cache = useRef(new Map());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Fetch EPG for visible range + buffer
  useEffect(() => {
    if (!channels.length) return;

    const start = Math.max(0, firstVisible - buffer);
    const end = Math.min(channels.length, lastVisible + buffer);
    const visibleIds = channels.slice(start, end).map(ch => ch.id);

    let cancelled = false;

    fetchBatch(visibleIds, cache, () => {
      if (!cancelled) forceUpdate();
    });

    return () => { cancelled = true; };
  }, [channels, firstVisible, lastVisible, buffer, forceUpdate]);

  // Refresh visible channels periodically
  useEffect(() => {
    if (!channels.length) return;

    const interval = setInterval(() => {
      const start = Math.max(0, firstVisible - buffer);
      const end = Math.min(channels.length, lastVisible + buffer);
      const visibleIds = channels.slice(start, end).map(ch => ch.id);

      // Clear cached entries for visible channels to force re-fetch
      for (const id of visibleIds) {
        cache.current.delete(id);
      }

      fetchBatch(visibleIds, cache, forceUpdate);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [channels, firstVisible, lastVisible, buffer, forceUpdate]);

  // Lookup function: returns current EPG entry for a channel, or null
  const getChannelEpg = useCallback((channelId) => {
    const entries = cache.current.get(channelId);
    return getCurrentEpg(entries);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  // cache.current is a ref — stable across renders, no dependency needed

  return getChannelEpg;
};

export default useEpg;
export {useEpg};
