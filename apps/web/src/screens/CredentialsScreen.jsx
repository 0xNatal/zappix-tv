import {useState} from 'react';
import {updateDevice, createXtreamClient} from '@zappix/shared';

const CredentialsScreen = ({deviceId, onSaved}) => {
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const creds = {
      host: host.trim().replace(/\/+$/, ''),
      username: username.trim(),
      password: password.trim(),
    };
    if (!creds.host || !creds.username || !creds.password) return;

    setLoading(true);
    setError(null);

    try {
      const client = createXtreamClient(creds);
      await client.getAccountInfo();
      await updateDevice(deviceId, {credentials: creds});
      sessionStorage.setItem('zappix_credentials', JSON.stringify(creds));
      onSaved(creds);
    } catch (err) {
      setError(
        err.message?.includes('HTTP')
          ? 'Zugangsdaten falsch. Bitte prüfe URL, Benutzername und Passwort.'
          : 'Verbindungsfehler. Ist die URL korrekt?'
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = host.trim() && username.trim() && password.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Zugangsdaten</h1>
        <p className="text-white/50 text-sm mt-1">Gib deine IPTV-Zugangsdaten ein</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider px-1">Xtream URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            autoFocus
            className="bg-surface border border-accent/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider px-1">Benutzername</label>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-surface border border-accent/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider px-1">Passwort</label>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border border-accent/20 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-live text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !isValid}
        className="bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? 'Prüfe...' : 'Speichern & weiter'}
      </button>
    </form>
  );
};

export default CredentialsScreen;
