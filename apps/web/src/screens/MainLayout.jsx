import {useState, useEffect, useMemo, useCallback} from 'react';
import {createXtreamClient, parseCategories, updateDevice, getDevice} from '@zappix/shared';
import BrowseTab from '../tabs/BrowseTab';
import MyListTab from '../tabs/MyListTab';
import SettingsTab from '../tabs/SettingsTab';

const TABS = [
  {id: 'browse',   label: 'Sender'},
  {id: 'mylist',   label: 'Meine Liste'},
  {id: 'settings', label: 'Einstellungen'},
];

const MainLayout = ({deviceId, credentials}) => {
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [myChannelIds, setMyChannelIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allChannelsLoaded, setAllChannelsLoaded] = useState(false);

  const client = useMemo(() => createXtreamClient(credentials), [credentials]);
  const parsed = useMemo(() => parseCategories(categories), [categories]);

  useEffect(() => {
    client.getLiveCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [client]);

  // Load all channels lazily (for search + meine liste)
  const loadAllChannels = useCallback(() => {
    if (allChannelsLoaded) return;
    client.getLiveStreams()
      .then(chs => { setAllChannels(chs); setAllChannelsLoaded(true); })
      .catch(console.error);
  }, [client, allChannelsLoaded]);

  useEffect(() => {
    if (search.trim().length >= 2) loadAllChannels();
  }, [search, loadAllChannels]);

  useEffect(() => {
    getDevice(deviceId).then(data => {
      const list = data?.channelLists?.default?.channelIds;
      if (Array.isArray(list)) setMyChannelIds(list);
    });
  }, [deviceId]);

  const toggleChannel = useCallback((channelId) => {
    setMyChannelIds(prev => {
      const next = prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      updateDevice(deviceId, {
        'channelLists/default': {name: 'Meine Sender', channelIds: next, updatedAt: Date.now()}
      });
      return next;
    });
  }, [deviceId]);

  const searchResults = useMemo(() => {
    if (!search.trim() || search.length < 2) return null;
    const q = search.toLowerCase();
    return allChannels.filter(ch => ch.name.toLowerCase().includes(q)).slice(0, 50);
  }, [search, allChannels]);

  return (
    <div className="h-dvh bg-bg text-white flex flex-col">
      <header className="shrink-0 px-4 pt-4 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-accent">Zappix</h1>
          <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-full font-medium">
            {myChannelIds.length} Sender
          </span>
        </div>
        <input
          type="text"
          placeholder="Sender suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/40 transition-colors"
        />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/40 text-sm">Sender werden geladen...</div>
          </div>
        ) : search.trim().length >= 2 ? (
          <div className="flex flex-col gap-1.5">
            {!allChannelsLoaded ? (
              <div className="text-white/40 text-sm py-12 text-center">Suche wird vorbereitet...</div>
            ) : searchResults && searchResults.length > 0 ? (
              <>
                <div className="text-xs text-white/40 py-2">{searchResults.length} Treffer</div>
                {searchResults.map(ch => (
                  <ChannelItem key={ch.id} channel={ch} added={myChannelIds.includes(ch.id)} onToggle={toggleChannel} />
                ))}
              </>
            ) : (
              <div className="text-white/40 text-sm py-12 text-center">Kein Sender gefunden</div>
            )}
          </div>
        ) : tab === 'browse' ? (
          <BrowseTab parsed={parsed} client={client} myChannelIds={myChannelIds} onToggle={toggleChannel} />
        ) : tab === 'mylist' ? (
          <MyListTab channelIds={myChannelIds} allChannels={allChannels} onLoadAll={loadAllChannels} onToggle={toggleChannel} />
        ) : (
          <SettingsTab credentials={credentials} deviceId={deviceId} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-xl border-t border-white/5 flex justify-around py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {TABS.map(({id, label}) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSearch(''); }}
            className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'text-accent bg-accent/10' : 'text-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const ChannelItem = ({channel, added, onToggle}) => (
  <div
    onClick={() => onToggle(channel.id)}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.99] ${
      added ? 'bg-accent/8 border border-accent/15' : 'bg-surface border border-transparent hover:border-white/5'
    }`}
  >
    <div className="flex items-center gap-3 overflow-hidden">
      {channel.icon ? (
        <img
          src={channel.icon}
          alt=""
          className="w-9 h-9 rounded-lg object-contain bg-white/5 shrink-0 p-0.5"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-semibold text-xs shrink-0">
          {channel.name.charAt(0)}
        </div>
      )}
      <span className="text-sm truncate">{channel.name}</span>
    </div>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 text-xs font-bold ${
      added ? 'bg-accent text-white' : 'bg-white/5 text-white/20'
    }`}>
      {added ? '✓' : '+'}
    </div>
  </div>
);

export default MainLayout;
