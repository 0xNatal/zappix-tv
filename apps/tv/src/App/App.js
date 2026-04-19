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
  const {resolveList, loading: channelsLoading, error: channelsError} = useChannelMap(status === 'ready');

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
      icon: data.icon || null,
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

  // Select channel → switch and close overlay
  const handleChannelSelect = useCallback((ch) => {
    setActiveChannel(ch);
    setLastWatched(ch.id);
    setListSelectorVisible(false);
    setOverlayVisible(false);
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

  // Auto-hide overlay after inactivity
  const hideTimerRef = useRef(null);

  const resetHideTimer = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setListSelectorVisible(false);
      setOverlayVisible(false);
    }, 8000);
  }, []);

  useEffect(() => {
    if (overlayVisible) {
      resetHideTimer();
    } else {
      clearTimeout(hideTimerRef.current);
    }
  }, [overlayVisible, resetHideTimer]);

  // Refs for stable key handler — listener registered once, no re-registration
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {status, currentChannel, overlayVisible, listSelectorVisible, allLists, currentList};
  });

  useEffect(() => {
    const handleKeyDown = (ev) => {
      const {status: s, currentChannel: ch, overlayVisible: ov, listSelectorVisible: lv, allLists: al, currentList: cl} = stateRef.current;
      if (s !== 'ready' || !ch) return;

      // Reset auto-hide on any interaction while overlay is open
      if (ov) resetHideTimer();

      // Channel up/down on player (overlay closed) — capture phase stops Spotlight
      if (!ov && (ev.key === 'ArrowUp' || ev.keyCode === 38 || ev.key === 'ArrowDown' || ev.keyCode === 40)) {
        const idx = cl.findIndex(c => c.id === ch.id);
        if (idx === -1) return;
        const next = ev.key === 'ArrowUp' || ev.keyCode === 38
          ? cl[(idx - 1 + cl.length) % cl.length]
          : cl[(idx + 1) % cl.length];
        setActiveChannel(next);
        setLastWatched(next.id);
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      if (ev.key === 'ArrowRight' || ev.keyCode === 39) {
        if (!ov) {
          setOverlayVisible(true);
          ev.preventDefault();
          ev.stopPropagation();
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
          ev.stopPropagation();
        }
      }

      if (ev.key === 'Escape' || ev.key === 'GoBack' || ev.keyCode === 461) {
        if (lv) {
          setListSelectorVisible(false);
          ev.preventDefault();
        } else if (ov) {
          setOverlayVisible(false);
          ev.preventDefault();
          ev.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [resetHideTimer, setLastWatched]);

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
        <div className={css.empty}>
          <div className={css.emptyIcon}>!</div>
          <div className={css.emptyTitle}>Verbindungsfehler</div>
          <div className={css.emptyHint}>Bitte App neu starten</div>
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

  // Channel loading error
  if (channelsError) {
    return (
      <div {...props} className={css.app}>
        <div className={css.empty}>
          <div className={css.emptyIcon}>!</div>
          <div className={css.emptyTitle}>Sender konnten nicht geladen werden</div>
          <div className={css.emptyHint}>{channelsError}</div>
        </div>
      </div>
    );
  }

  // No channels in list
  if (currentList.length === 0) {
    return (
      <div {...props} className={css.app}>
        <div className={css.empty}>
          <div className={css.emptyIcon}>0</div>
          <div className={css.emptyTitle}>Keine Sender</div>
          <div className={css.emptyHint}>Füge Sender über die Web-App hinzu</div>
        </div>
      </div>
    );
  }

  // TV-Modus: Player + Overlays
  return (
    <div {...props} className={css.app}>
      <PlayerView channel={currentChannel} epg={currentChannel ? getEpg(currentChannel.id) : null} />

      <ChannelOverlay
        channels={currentList}
        currentChannelId={currentChannel?.id}
        getEpg={getEpg}
        onSelect={handleChannelSelect}
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
