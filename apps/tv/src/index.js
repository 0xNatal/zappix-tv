/* global ENACT_PACK_ISOMORPHIC */
import {createRoot, hydrateRoot} from 'react-dom/client';
import {initFirebase} from '@zappix/shared';

import App from './App';

initFirebase({
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const appElement = (<App />);

// In a browser environment, render instead of exporting
if (typeof window !== 'undefined') {
	if (ENACT_PACK_ISOMORPHIC) {
		hydrateRoot(document.getElementById('root'), appElement);
	} else {
		createRoot(document.getElementById('root')).render(appElement);
	}
}

export default appElement;
