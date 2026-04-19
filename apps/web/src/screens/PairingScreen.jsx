import {useState} from 'react';
import {findDeviceByPairingCode} from '@zappix/shared';

const PairingScreen = ({onPaired}) => {
  const [code, setCode] = useState(() => {
    const match = window.location.pathname.match(/\/pair\/([A-Z0-9-]+)/i);
    return match ? match[1] : '';
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await findDeviceByPairingCode(trimmed);
      if (result) {
        localStorage.setItem('zappix_device_id', result.deviceId);
        onPaired(result.deviceId);
      } else {
        setError('Code nicht gefunden. Bitte prüfe den Code auf deinem TV.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-accent tracking-tight">Zappix</h1>
        <p className="text-white/50 mt-2">Verbinde dein Handy mit dem TV</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/40 uppercase tracking-widest px-1">
          Code vom TV eingeben
        </label>
        <input
          type="text"
          placeholder="ZAP-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          className="bg-surface border border-accent/20 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[0.15em] text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
        />
      </div>

      {error && (
        <p className="text-live text-sm text-center -mt-4">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? 'Verbinde...' : 'Verbinden'}
      </button>
    </form>
  );
};

export default PairingScreen;
