import {createXtreamClient} from '@zappix/shared';

let client = null;

/**
 * Initialize the Xtream client with credentials from Firebase.
 * Called by useFirebaseSync when credentials arrive or change.
 */
export const initXtreamClient = (credentials) => {
  client = createXtreamClient(credentials);
};

export const getClient = () => {
  if (!client) throw new Error('Xtream client not initialized — credentials missing');
  return client;
};

export const getLiveStreams = (...args) => getClient().getLiveStreams(...args);
export const getShortEpg = (...args) => getClient().getShortEpg(...args);
export const getStreamUrl = (...args) => getClient().getStreamUrl(...args);
