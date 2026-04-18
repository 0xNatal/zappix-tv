import {useState, useEffect, useCallback, useRef} from 'react';
import {getDevice, setDevice, updateDevice, onDeviceChange, setPairingIndex, removePairingIndex} from '@zappix/shared';
import {initXtreamClient} from '../api/xtream';

/**
 * Hook that syncs the TV with Firebase RTDB.
 *
 * Handles:
 * - Device registration (first start → write pairingCode to RTDB)
 * - Real-time listener for credentials + channel lists
 * - Xtream client initialization when credentials arrive
 * - Last watched channel tracking
 *
 * @param {string} deviceId - MAC-based device ID
 * @param {string} pairingCode - Random pairing code for this device
 * @returns {{ status, credentials, channelLists, lastWatchedChannelId, setLastWatched }}
 *   status: 'loading' | 'pairing' | 'ready' | 'error'
 */
const useFirebaseSync = (deviceId, pairingCode, mac) => {
  const [status, setStatus] = useState('loading');
  const [channelLists, setChannelLists] = useState({});
  const [lastWatchedChannelId, setLastWatchedChannelId] = useState(null);
  const credentialsRef = useRef(null);

  // Register device + listen for changes
  useEffect(() => {
    if (!deviceId || !pairingCode) return;

    let unsubscribe;

    const init = async () => {
      try {
        const existing = await getDevice(deviceId);

        if (!existing) {
          await setDevice(deviceId, {
            pairingCode,
            createdAt: Date.now(),
            ...(mac && {mac}),
          });
        } else if (!existing.credentials && existing.pairingCode !== pairingCode) {
          // Device exists but unpaired with a different code — clean up old index
          if (existing.pairingCode) removePairingIndex(existing.pairingCode);
          await updateDevice(deviceId, {pairingCode});
        }

        // Ensure pairing index exists for unpaired devices
        if (!existing?.credentials) {
          await setPairingIndex(pairingCode, deviceId);
        }

        unsubscribe = onDeviceChange(deviceId, (data) => {
          if (!data) {
            setStatus('pairing');
            return;
          }

          if (data.channelLists) {
            setChannelLists(data.channelLists);
          }

          if (data.lastWatchedChannelId) {
            setLastWatchedChannelId(data.lastWatchedChannelId);
          }

          if (data.credentials?.host && data.credentials?.username && data.credentials?.password) {
            // Only reinitialize client if credentials actually changed
            const creds = data.credentials;
            const prev = credentialsRef.current;
            if (!prev || prev.host !== creds.host || prev.username !== creds.username || prev.password !== creds.password) {
              initXtreamClient(creds);
              if (!prev) removePairingIndex(pairingCode);
              credentialsRef.current = creds;
            }
            setStatus('ready');
          } else {
            setStatus('pairing');
          }
        });
      } catch (err) {
        console.error('Firebase sync error:', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [deviceId, pairingCode]);

  const setLastWatched = useCallback((channelId) => {
    if (!deviceId) return;
    setLastWatchedChannelId(channelId);
    updateDevice(deviceId, {lastWatchedChannelId: channelId});
  }, [deviceId]);

  return {status, channelLists, lastWatchedChannelId, setLastWatched};
};

export default useFirebaseSync;
export {useFirebaseSync};
