import {useCallback} from 'react';
import VirtualList from '@enact/sandstone/VirtualList';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import ri from '@enact/ui/resolution';
import {getEpgProgress} from '@zappix/shared';
import css from './ChannelOverlay.module.less';

const SpottableItem = Spottable('div');

const OverlayContainer = SpotlightContainerDecorator(
  {enterTo: 'last-focused'},
  'div'
);

// Item height = logo (2.8rem ≈ 67px) + padding (2 × 0.75rem ≈ 38px) = ~105px
const ITEM_HEIGHT = ri.scale(105);
const ITEM_SPACING = 0;

const ChannelOverlay = ({channels, currentChannelId, getEpg, onSelect, onVisibleRangeChange, visible, children}) => {
  const handleScrollStop = useCallback(({moreInfo}) => {
    if (onVisibleRangeChange && moreInfo) {
      onVisibleRangeChange(moreInfo.firstVisibleIndex, moreInfo.lastVisibleIndex);
    }
  }, [onVisibleRangeChange]);

  const renderItem = useCallback(({index, ...rest}) => {
    const ch = channels[index];
    if (!ch) return null;

    const epg = getEpg ? getEpg(ch.id) : null;
    const progress = getEpgProgress(epg);
    const isCurrent = ch.id === currentChannelId;

    return (
      <SpottableItem
        {...rest}
        className={isCurrent ? css.itemActive : css.item}
        onFocus={() => onSelect(ch)}
      >
        {isCurrent && <div className={css.indicator} />}

        <div className={css.logo}>
          {ch.icon ? (
            <img
              src={ch.icon}
              alt=""
              className={css.logoImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span className={css.logoInitial}>{ch.name.charAt(0)}</span>
          )}
        </div>

        <div className={css.info}>
          <div className={css.channelName}>{ch.name}</div>
          {epg && <div className={css.programTitle}>{epg.title}</div>}
          {epg && progress > 0 && (
            <div className={css.progressBar}>
              <div className={css.progressFill} style={{width: `${progress * 100}%`}} />
            </div>
          )}
        </div>
      </SpottableItem>
    );
  }, [channels, currentChannelId, getEpg, onSelect]);

  return (
    <div className={visible ? css.overlay : css.overlayHidden}>
      <div className={css.dimmer} />
      <div className={css.panels}>
        <OverlayContainer className={css.panel} spotlightId="channelOverlay">
          <VirtualList
            className={css.list}
            dataSize={channels.length}
            itemRenderer={renderItem}
            itemSize={ITEM_HEIGHT}
            spacing={ITEM_SPACING}
            direction="vertical"
            scrollMode="translate"
            verticalScrollbar="hidden"
            wrap
            onScrollStop={handleScrollStop}
          />
        </OverlayContainer>
        {children}
      </div>
    </div>
  );
};

export default ChannelOverlay;
export {ChannelOverlay};
