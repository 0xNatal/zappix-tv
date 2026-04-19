import {useState} from 'react';
import PairingScreen from './screens/PairingScreen';
import CredentialsScreen from './screens/CredentialsScreen';
import MainLayout from './screens/MainLayout';
import './App.css';

const App = () => {
  const [screen, setScreen] = useState(() => {
    if (sessionStorage.getItem('zappix_credentials')) return 'main';
    if (sessionStorage.getItem('zappix_device_id')) return 'credentials';
    return 'pairing';
  });
  const [deviceId, setDeviceId] = useState(() => sessionStorage.getItem('zappix_device_id'));
  const [credentials, setCredentials] = useState(() => {
    const stored = sessionStorage.getItem('zappix_credentials');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSwitchDevice = (newDeviceId, newCredentials) => {
    sessionStorage.setItem('zappix_device_id', newDeviceId);
    sessionStorage.setItem('zappix_credentials', JSON.stringify(newCredentials));
    setDeviceId(newDeviceId);
    setCredentials(newCredentials);
  };

  if (screen === 'pairing') {
    return (
      <div className="min-h-dvh bg-bg text-white flex items-center justify-center p-4">
        <PairingScreen onPaired={(id) => { setDeviceId(id); setScreen('credentials'); }} />
      </div>
    );
  }

  if (screen === 'credentials') {
    return (
      <div className="min-h-dvh bg-bg text-white flex items-center justify-center p-4">
        <CredentialsScreen deviceId={deviceId} onSaved={(c) => { setCredentials(c); setScreen('main'); }} />
      </div>
    );
  }

  return <MainLayout deviceId={deviceId} credentials={credentials} onSwitchDevice={handleSwitchDevice} />;
};

export default App;
