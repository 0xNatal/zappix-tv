import {useState, useEffect} from 'react';
import LS2Request from '@enact/webos/LS2Request';
import {platform} from '@enact/webos/platform';
import {macToDeviceId, generatePairingCode} from '@zappix/shared';

// Read persisted values synchronously (before first render)
const getStoredDeviceId = () => localStorage.getItem('zappix_device_id');

const ensurePairingCode = () => {
  let code = localStorage.getItem('zappix_pairing_code');
  if (!code) {
    code = generatePairingCode();
    localStorage.setItem('zappix_pairing_code', code);
  }
  return code;
};

/**
 * Hook that reads the TV's MAC address and derives a stable deviceId.
 * On webOS: reads MAC from luna://com.webos.service.connectionmanager
 * In browser: generates a random ID and persists in localStorage.
 */
const useDevice = () => {
  const isTV = platform.tv;

  // Non-TV: resolve immediately from localStorage (no async needed)
  const initialId = !isTV ? ensureFallbackId() : getStoredDeviceId();
  const [deviceId, setDeviceId] = useState(initialId);
  const [mac, setMac] = useState(null);
  const [pairingCode] = useState(ensurePairingCode);
  const loading = !deviceId;

  // TV-only: async MAC address lookup
  useEffect(() => {
    if (!isTV || deviceId) return;

    new LS2Request().send({
      service: 'luna://com.webos.service.connectionmanager',
      method: 'getStatus',
      parameters: {},
      onSuccess: (res) => {
        const rawMac = res?.wired?.macAddress || res?.wifi?.macAddress;
        if (rawMac) {
          const id = macToDeviceId(rawMac);
          localStorage.setItem('zappix_device_id', id);
          setDeviceId(id);
          setMac(rawMac);
        } else {
          const id = ensureFallbackId();
          setDeviceId(id);
        }
      },
      onFailure: () => {
        const id = ensureFallbackId();
        setDeviceId(id);
      },
    });
  }, [isTV, deviceId]);

  return {deviceId, mac, pairingCode, loading};
};

function ensureFallbackId () {
  let stored = localStorage.getItem('zappix_device_id');
  if (!stored) {
    stored = 'DEV_' + Math.random().toString(36).slice(2, 14).toUpperCase();
    localStorage.setItem('zappix_device_id', stored);
  }
  return stored;
}

export default useDevice;
export {useDevice};
