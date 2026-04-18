import {useState, useEffect} from 'react';
import {ChannelItem} from '../screens/MainLayout';

const SECTIONS = [
  {key: 'countries',   label: 'Nach Land',     desc: 'Sender nach Land durchsuchen'},
  {key: 'liveSport',   label: 'Live Sport',    desc: 'Sportevents & Ligen'},
  {key: 'replays',     label: 'Replays',       desc: 'Wiederholungen & Highlights'},
  {key: 'channels247', label: '24/7 Channels', desc: 'Rund um die Uhr'},
  {key: 'streaming',   label: 'Streaming',     desc: 'On-Demand Inhalte'},
  {key: 'special',     label: 'Spezial',       desc: '4K, PPV & mehr'},
];

const BrowseTab = ({parsed, client, myChannelIds, onToggle}) => {
  const [section, setSection] = useState(null);
  const [country, setCountry] = useState(null);
  const [category, setCategory] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) { setChannels([]); return; }
    setLoading(true);
    client.getLiveStreams(category.id).then(setChannels).catch(() => setChannels([])).finally(() => setLoading(false));
  }, [category, client]);

  if (category) {
    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => setCategory(null)} className="text-accent text-sm font-medium self-start">
          ← Zurück
        </button>
        {loading ? (
          <div className="text-white/40 text-sm py-12 text-center">Laden...</div>
        ) : channels.length === 0 ? (
          <div className="text-white/40 text-sm py-12 text-center">Keine Sender in dieser Kategorie</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {channels.map(ch => (
              <ChannelItem key={ch.id} channel={ch} added={myChannelIds.includes(ch.id)} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section === 'countries' && country) {
    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => setCountry(null)} className="text-accent text-sm font-medium self-start">
          ← {country.name}
        </button>
        <div className="flex flex-col gap-1">
          {country.categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setCategory(cat.original)}
              className="text-left px-4 py-3.5 rounded-xl bg-surface hover:bg-white/5 transition-colors text-sm"
            >
              {cat.displayName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section) {
    const isCountries = section === 'countries';
    const items = isCountries
      ? Object.entries(parsed.countries)
          .sort(([, a], [, b]) => a.name.localeCompare(b.name))
          .map(([id, c]) => ({id, label: `${c.flag} ${c.name}`, count: c.categories.length, data: c}))
      : (parsed[section] || []).map(item => ({label: item.displayName, category: item.original}));

    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => setSection(null)} className="text-accent text-sm font-medium self-start">
          ← Bereiche
        </button>
        <div className="flex flex-col gap-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => isCountries ? setCountry(item.data) : setCategory(item.category)}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-surface hover:bg-white/5 transition-colors"
            >
              <span className="text-sm">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.count && <span className="text-xs text-white/25">{item.count}</span>}
                <span className="text-white/15">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {SECTIONS.map(({key, label, desc}) => {
        const count = key === 'countries'
          ? Object.keys(parsed.countries || {}).length
          : (parsed[key] || []).length;
        if (!count) return null;
        return (
          <button
            key={key}
            onClick={() => setSection(key)}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-surface border border-white/[0.03] hover:border-white/10 transition-all active:scale-[0.99]"
          >
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-white/35 mt-0.5">{desc}</div>
            </div>
            <div className="flex items-center gap-2 text-white/20">
              <span className="text-xs">{count}</span>
              <span>›</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BrowseTab;
