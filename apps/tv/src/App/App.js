import {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import Spotlight from '@enact/spotlight';

import useDevice from '../hooks/useDevice';
import useFirebaseSync from '../hooks/useFirebaseSync';
import useChannelMap from '../hooks/useChannelMap';
import useEpg from '../hooks/useEpg';
import PairingScreen from '../views/PairingScreen';
import PlayerView from '../views/PlayerView';
import ChannelOverlay from '../components/ChannelOverlay';
import ListSelector from '../components/ListSelector';

import './attachErrorHandler';
import css from './App.module.less';

const AppBase = (props) => {
  const {deviceId, mac, pairingCode, loading: deviceLoading} = useDevice();
  const firebaseSync = useFirebaseSync(deviceId, pairingCode, mac);
  const {status, channelLists, lastWatchedChannelId} = firebaseSync;

  // Channel data
  const {resolveList, loading: channelsLoading} = useChannelMap(status === 'ready');

  // Active channel + overlay state
  const [activeChannel, setActiveChannel] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [listSelectorVisible, setListSelectorVisible] = useState(false);
  const [activeListId, setActiveListId] = useState('default');

  // Resolve current channel list
  const currentList = useMemo(() => {
    const listData = channelLists?.[activeListId];
    const ids = listData?.channelIds || [];
    return resolveList(ids);
  }, [channelLists, activeListId, resolveList]);

  // All available lists for the ListSelector
  const allLists = useMemo(() => {
    if (!channelLists) return [];
    return Object.entries(channelLists).map(([id, data]) => ({
      id,
      name: data.name || id,
    }));
  }, [channelLists]);

  // EPG for visible channels in overlay
  const [epgRange, setEpgRange] = useState({first: 0, last: 15});
  const getEpg = useEpg(currentList, epgRange.first, epgRange.last);
  const handleVisibleRangeChange = useCallback((first, last) => {
    setEpgRange({first, last});
  }, []);

  // Auto-play: derive initial channel from list (no setState in effect)
  const initialChannel = useMemo(() => {
    if (status !== 'ready' || channelsLoading || currentList.length === 0) return null;
    if (lastWatchedChannelId) {
      return currentList.find(ch => ch.id === lastWatchedChannelId) || currentList[0];
    }
    return currentList[0];
  }, [status, channelsLoading, currentList, lastWatchedChannelId]);

  // Use activeChannel if set by user, otherwise use derived initial
  const currentChannel = activeChannel || initialChannel;

  // Handlers
  const {setLastWatched} = firebaseSync;

  // Focus on channel in overlay → switch immediately, overlay stays open
  const handleChannelFocus = useCallback((ch) => {
    setActiveChannel(ch);
    setLastWatched(ch.id);
  }, [setLastWatched]);

  const handleListSelect = useCallback((listId) => {
    setActiveListId(listId);
    setListSelectorVisible(false);
    Spotlight.focus('channelOverlay');
  }, []);

  // Move Spotlight focus to overlay when it opens
  useEffect(() => {
    if (overlayVisible) {
      Spotlight.focus('channelOverlay');
    }
  }, [overlayVisible]);

  // Move Spotlight focus to list selector when it opens
  useEffect(() => {
    if (listSelectorVisible) {
      Spotlight.focus('listSelector');
    }
  }, [listSelectorVisible]);

  // Refs for stable key handler — listener registered once, no re-registration
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {status, currentChannel, overlayVisible, listSelectorVisible, allLists};
  });

  useEffect(() => {
    const handleKeyDown = (ev) => {
      const {status: s, currentChannel: ch, overlayVisible: ov, listSelectorVisible: lv, allLists: al} = stateRef.current;
      if (s !== 'ready' || !ch) return;

      if (ev.key === 'ArrowRight' || ev.keyCode === 39) {
        if (!ov) {
          setOverlayVisible(true);
          ev.preventDefault();
        } else if (!lv && al.length > 1) {
          setListSelectorVisible(true);
          ev.preventDefault();
        }
      }

      if (ev.key === 'ArrowLeft' || ev.keyCode === 37) {
        if (lv) {
          setListSelectorVisible(false);
          ev.preventDefault();
        } else if (ov) {
          setOverlayVisible(false);
          ev.preventDefault();
        }
      }

      if (ev.key === 'Escape' || ev.key === 'GoBack' || ev.keyCode === 461) {
        if (lv) {
          setListSelectorVisible(false);
          ev.preventDefault();
        } else if (ov) {
          setOverlayVisible(false);
          ev.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // empty deps — registered once, reads latest state from ref

  // Loading device / Firebase
  if (deviceLoading || status === 'loading') {
    return (
      <div {...props} className={css.app}>
        <div className={css.splash}>
          <div className={css.logo}>Zappix</div>
          <div className={css.loader} />
        </div>
      </div>
    );
  }

  // Pairing
  if (status === 'pairing') {
    return (
      <div {...props} className={css.app}>
        <PairingScreen pairingCode={pairingCode} />
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div {...props} className={css.app}>
        <div className={css.center}>
          <div className={css.statusText}>Verbindungsfehler</div>
          <div className={css.statusHint}>Bitte App neu starten</div>
        </div>
      </div>
    );
  }

  // Loading channels
  if (channelsLoading) {
    return (
      <div {...props} className={css.app}>
        <div className={css.splash}>
          <div className={css.logo}>Zappix</div>
          <div className={css.loader} />
        </div>
      </div>
    );
  }

  // No channels in list
  if (currentList.length === 0) {
    return (
      <div {...props} className={css.app}>
        <div className={css.center}>
          <div className={css.statusText}>Keine Sender vorhanden</div>
          <div className={css.statusHint}>Sender über die Web-App hinzufügen</div>
        </div>
      </div>
    );
  }

  // TV-Modus: Player + Overlays
  return (
    <div {...props} className={css.app}>
      <PlayerView channel={currentChannel} />

      <ChannelOverlay
        channels={currentList}
        currentChannelId={currentChannel?.id}
        getEpg={getEpg}
        onSelect={handleChannelFocus}
        onVisibleRangeChange={handleVisibleRangeChange}
        visible={overlayVisible}
      >
        <ListSelector
          lists={allLists}
          activeListId={activeListId}
          onSelect={handleListSelect}
          visible={listSelectorVisible}
        />
      </ChannelOverlay>
    </div>
  );
};

const App = ThemeDecorator(AppBase);

export default App;
export {App, AppBase};
