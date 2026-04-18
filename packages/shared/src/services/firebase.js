import {initializeApp} from 'firebase/app';
import {getDatabase, ref, get, set, update, remove, onValue} from 'firebase/database';

let db;

export const initFirebase = (config) => {
  const app = initializeApp(config);
  db = getDatabase(app);
};

/**
 * Get a device's data from RTDB.
 * @returns {Object|null}
 */
export const getDevice = async (deviceId) => {
  const snap = await get(ref(db, `devices/${deviceId}`));
  return snap.exists() ? snap.val() : null;
};

/**
 * Create or merge device data.
 */
export const setDevice = (deviceId, data) =>
  set(ref(db, `devices/${deviceId}`), data);

/**
 * Update specific fields on a device.
 */
export const updateDevice = (deviceId, data) =>
  update(ref(db, `devices/${deviceId}`), data);

/**
 * Listen for real-time changes on a device.
 * Returns an unsubscribe function.
 */
export const onDeviceChange = (deviceId, callback) =>
  onValue(ref(db, `devices/${deviceId}`), (snap) => {
    callback(snap.exists() ? snap.val() : null);
  });

/**
 * Write a pairing index entry so the web app can look up a device by code
 * without scanning all devices.
 */
export const setPairingIndex = (pairingCode, deviceId) =>
  set(ref(db, `pairings/${pairingCode}`), {deviceId});

/**
 * Remove the pairing index entry after successful pairing.
 */
export const removePairingIndex = (pairingCode) =>
  remove(ref(db, `pairings/${pairingCode}`));

/**
 * Find a device by pairing code via the pairings index.
 * @returns {{ deviceId, data }|null}
 */
export const findDeviceByPairingCode = async (pairingCode) => {
  const snap = await get(ref(db, `pairings/${pairingCode}`));
  if (!snap.exists()) return null;
  const {deviceId} = snap.val();
  const data = await getDevice(deviceId);
  return data ? {deviceId, data} : null;
};
