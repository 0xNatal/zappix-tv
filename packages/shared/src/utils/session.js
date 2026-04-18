// Pairing-Logik für TV ↔ Web-App Kopplung
// TV zeigt Pairing-Code → Web-App gibt Code ein → findet Device in Firebase

/**
 * Generates a random pairing code (e.g. "ZAP-7K3M").
 * Format: "ZAP-" + 4 alphanumeric uppercase chars.
 * Used for manual entry when QR scanning isn't possible.
 */
export const generatePairingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ZAP-${code}`;
};

/**
 * Derives a Firebase-safe device ID from a MAC address.
 * Strips colons: "AA:BB:CC:DD:EE:FF" → "AABBCCDDEEFF"
 */
export const macToDeviceId = (mac) =>
  mac.replace(/:/g, '').toUpperCase();

/**
 * Builds the pairing URL for the QR code.
 * @param {string} baseUrl - Web app URL (e.g. "https://user.github.io/zappix")
 * @param {string} pairingCode - The pairing code (e.g. "ZAP-7K3M")
 */
export const buildPairingUrl = (baseUrl, pairingCode) =>
  `${baseUrl}/pair/${pairingCode}`;
