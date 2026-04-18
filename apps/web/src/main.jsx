import {createRoot} from 'react-dom/client';
import {initFirebase} from '@zappix/shared';
import App from './App';

initFirebase({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
});

createRoot(document.getElementById('root')).render(<App />);
