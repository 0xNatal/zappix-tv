import {useMemo, useEffect} from 'react';
import {ChannelItem} from '../screens/MainLayout';

const MyListTab = ({channelIds, allChannels, onLoadAll, onToggle}) => {
  // Trigger loading all channels when this tab is shown
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

  if (channelIds.length > 0 && allChannels.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/40 text-sm">Sender werden geladen...</div>
      </div>
    );
  }

  if (!myChannels.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-center">
          <div className="font-medium text-white/50">Noch keine Sender</div>
          <div className="text-sm text-white/25 mt-1">Füge Sender über den Tab "Sender" hinzu</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-white/30 py-1">{myChannels.length} Sender</div>
      {myChannels.map(ch => (
        <ChannelItem key={ch.id} channel={ch} added={true} onToggle={onToggle} />
      ))}
    </div>
  );
};

export default MyListTab;
