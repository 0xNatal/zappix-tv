import {useState, useMemo, useEffect} from 'react';
import {ChannelItem} from '../screens/MainLayout';

const MyListTab = ({channelIds, allChannels, onLoadAll, onToggle, lists, activeListId, onSelectList, onCreateList, onDeleteList, onRenameList}) => {
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (channelIds.length > 0 && allChannels.length === 0) {
      onLoadAll();
    }
  }, [channelIds, allChannels, onLoadAll]);

  const myChannels = useMemo(() =>
    channelIds
      .map(id => allChannels.find(ch => ch.id === id))
      .filter(Boolean),
    [channelIds, allChannels]
  );

  const listEntries = Object.entries(lists);

  const handleCreate = (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    onCreateList(name);
    setNewListName('');
  };

  const handleRename = (listId) => {
    const name = editName.trim();
    if (name) onRenameList(listId, name);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* List selector */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {listEntries.map(([id, list]) => (
            <button
              key={id}
              onClick={() => onSelectList(id)}
              onDoubleClick={() => { setEditingId(id); setEditName(list.name || id); }}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeListId === id ? 'text-accent bg-accent/10' : 'text-white/30 bg-white/5'
              }`}
            >
              {list.name || id}
            </button>
          ))}
        </div>

        {/* Rename dialog */}
        {editingId && editingId !== 'default' && (
          <div className="flex gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename(editingId)}
              autoFocus
              className="flex-1 bg-surface border border-accent/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-accent transition-colors"
            />
            <button onClick={() => handleRename(editingId)} className="text-accent text-xs font-medium px-2">OK</button>
            <button onClick={() => onDeleteList(editingId)} className="text-red-400 text-xs font-medium px-2">Löschen</button>
            <button onClick={() => setEditingId(null)} className="text-white/30 text-xs px-2">Abbrechen</button>
          </div>
        )}

        {/* Create new list */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Neue Liste..."
            className="flex-1 bg-surface border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!newListName.trim()}
            className="text-accent text-xs font-medium px-3 disabled:opacity-30"
          >
            +
          </button>
        </form>
      </div>

      {/* Channel list */}
      {channelIds.length > 0 && allChannels.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white/40 text-sm">Sender werden geladen...</div>
        </div>
      ) : !myChannels.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-center">
            <div className="font-medium text-white/50">Noch keine Sender</div>
            <div className="text-sm text-white/25 mt-1">Füge Sender über den Tab "Sender" hinzu</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs text-white/30 py-1">{myChannels.length} Sender</div>
          {myChannels.map(ch => (
            <ChannelItem key={ch.id} channel={ch} added={true} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListTab;
