const SettingsTab = ({credentials, deviceId}) => {
  const handleReset = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Verbindung</h2>
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">Server</span>
            <span className="text-sm text-white/80 truncate ml-4">{credentials?.host}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">Benutzer</span>
            <span className="text-sm text-white/80">{credentials?.username}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">Device ID</span>
            <span className="text-xs text-white/40 font-mono">{deviceId}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Aktionen</h2>
        <button
          onClick={handleReset}
          className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-3 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Verbindung trennen
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
