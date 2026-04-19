import {useState, useEffect} from 'react';
import {getDevice, updateDevice} from '@zappix/shared';

const getManagedDevices = () => {
  try { return JSON.parse(localStorage.getItem('zappix_managed_devices')) || []; }
  catch { return []; }
};

const saveManagedDevices = (devices) =>
  localStorage.setItem('zappix_managed_devices', JSON.stringify(devices));

const getOwnDevice = () => localStorage.getItem('zappix_own_device_id');

const ensureOwnDevice = (deviceId) => {
  if (!getOwnDevice()) localStorage.setItem('zappix_own_device_id', deviceId);
};

const SettingsTab = ({credentials, deviceId, onSwitchDevice}) => {
  const [remoteAccess, setRemoteAccess] = useState(false);
  const [managedDevices, setManagedDevices] = useState(getManagedDevices);
  const [addId, setAddId] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [addError, setAddError] = useState(null);
  const [adding, setAdding] = useState(false);
  const ownDeviceId = getOwnDevice() || deviceId;
  const isOnOwnDevice = deviceId === ownDeviceId;

  useEffect(() => { ensureOwnDevice(deviceId); }, []);

  useEffect(() => {
    getDevice(deviceId).then(data => {
      if (data?.allowRemoteAccess) setRemoteAccess(true);
    });
  }, [deviceId]);

  const toggleRemoteAccess = () => {
    const next = !remoteAccess;
    setRemoteAccess(next);
    updateDevice(deviceId, {allowRemoteAccess: next});
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    const id = addId.trim();
    if (!id) return;
    if (id === deviceId || id === ownDeviceId) { setAddError('Das ist dein eigenes Gerät.'); return; }
    if (managedDevices.some(d => d.deviceId === id)) { setAddError('Gerät bereits vorhanden.'); return; }

    setAdding(true);
    setAddError(null);

    const data = await getDevice(id);
    if (!data) { setAddError('Gerät nicht gefunden.'); setAdding(false); return; }
    if (!data.allowRemoteAccess) { setAddError('Fernzugriff nicht erlaubt.'); setAdding(false); return; }

    const label = addLabel.trim() || id;
    const next = [...managedDevices, {deviceId: id, label}];
    setManagedDevices(next);
    saveManagedDevices(next);
    setAddId('');
    setAddLabel('');
    setAdding(false);
  };

  const removeDevice = (id) => {
    const next = managedDevices.filter(d => d.deviceId !== id);
    setManagedDevices(next);
    saveManagedDevices(next);
  };

  const switchTo = async (id) => {
    const data = await getDevice(id);
    if (!data?.credentials) { setAddError('Gerät hat keine Zugangsdaten.'); return; }
    onSwitchDevice(id, data.credentials);
  };

  const handleReset = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Connection info */}
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
          {isOnOwnDevice && (
            <>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/50">Fernzugriff</span>
                <button
                  onClick={toggleRemoteAccess}
                  className={`w-10 h-5 rounded-full transition-colors relative ${remoteAccess ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${remoteAccess ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Managed devices */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Geräte</h2>

        {/* Own device */}
        <button
          onClick={() => !isOnOwnDevice && switchTo(ownDeviceId)}
          className={`rounded-xl p-4 flex items-center justify-between text-left transition-colors ${
            isOnOwnDevice ? 'bg-accent/8 border border-accent/15' : 'bg-surface hover:bg-white/5'
          }`}
        >
          <div>
            <div className={`text-sm font-medium ${isOnOwnDevice ? 'text-accent' : 'text-white/80'}`}>Mein Gerät</div>
            <div className="text-xs text-white/30 font-mono mt-0.5">{ownDeviceId}</div>
          </div>
          {isOnOwnDevice && <span className="text-xs text-accent/60">Aktiv</span>}
        </button>

        {/* Managed devices */}
        {managedDevices.map(d => {
          const active = d.deviceId === deviceId;
          return (
            <div key={d.deviceId} className={`rounded-xl p-4 flex items-center justify-between gap-3 transition-colors ${
              active ? 'bg-accent/8 border border-accent/15' : 'bg-surface'
            }`}>
              <button onClick={() => !active && switchTo(d.deviceId)} className="flex-1 text-left">
                <div className={`text-sm font-medium ${active ? 'text-accent' : 'text-white/80'}`}>{d.label}</div>
                <div className="text-xs text-white/30 font-mono mt-0.5">{d.deviceId}</div>
              </button>
              {active ? (
                <span className="text-xs text-accent/60">Aktiv</span>
              ) : (
                <button onClick={() => removeDevice(d.deviceId)} className="text-white/20 text-xs shrink-0">Entfernen</button>
              )}
            </div>
          );
        })}

        {/* Add device */}
        <form onSubmit={handleAddDevice} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={addId}
              onChange={(e) => setAddId(e.target.value)}
              placeholder="Device ID"
              className="flex-1 bg-surface border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white font-mono placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors"
            />
            <input
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              placeholder="Name"
              className="w-28 bg-surface border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors"
            />
            <button
              type="submit"
              disabled={adding || !addId.trim()}
              className="text-accent text-xs font-medium px-3 disabled:opacity-30"
            >
              {adding ? '...' : '+'}
            </button>
          </div>
          {addError && <p className="text-red-400 text-xs">{addError}</p>}
        </form>
      </div>

      {/* Actions */}
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
