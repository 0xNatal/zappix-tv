import {useState, useEffect, useCallback, useMemo} from 'react';
import {getLiveStreams} from '../api/xtream';

/**
 * Loads ALL channels from Xtream and provides a lookup map.
 * Used to resolve channel IDs from Firebase lists to full channel objects.
 */
const useChannelMap = (credentialsReady) => {
  const [channels, setChannels] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loading = credentialsReady && !loaded && !error;

  useEffect(() => {
    if (!credentialsReady) return;

    let cancelled = false;

    getLiveStreams()
      .then(data => {
        if (!cancelled) {
          setChannels(data.filter(ch => !ch.isAdult));
          setLoaded(true);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoaded(true);
        }
      });

    return () => { cancelled = true; };
  }, [credentialsReady]);

  const channelMap = useMemo(() => {
    const map = new Map();
    for (const ch of channels) {
      map.set(ch.id, ch);
    }
    return map;
  }, [channels]);

  const resolveList = useCallback((ids) => {
    if (!ids || !ids.length) return [];
    return ids.map(id => channelMap.get(id)).filter(Boolean);
  }, [channelMap]);

  return {channelMap, resolveList, loading, error};
};

export default useChannelMap;
export {useChannelMap};
