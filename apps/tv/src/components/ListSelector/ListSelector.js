import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator, {spotlightDefaultClass} from '@enact/spotlight/SpotlightContainerDecorator';
import css from './ListSelector.module.less';

const SpottableItem = Spottable('div');

const SelectorContainer = SpotlightContainerDecorator(
  {enterTo: 'default-element'},
  'div'
);

/**
 * Stufe 2: List selector — appears to the right of the ChannelOverlay.
 * Allows switching between channel lists (Meine Sender, Sport, Kids, etc.)
 */
const ListSelector = ({lists, activeListId, onSelect, visible}) => {
  if (!lists || !lists.length) return null;

  return (
    <SelectorContainer className={visible ? css.panel : css.panelHidden} spotlightId="listSelector">
      {lists.map(list => {
        const active = list.id === activeListId;
        return (
          <SpottableItem
            key={list.id}
            className={`${active ? css.itemActive : css.item} ${active ? spotlightDefaultClass : ''}`}
            onClick={() => onSelect(list.id)}
          >
            {list.name}
          </SpottableItem>
        );
      })}
    </SelectorContainer>
  );
};

export default ListSelector;
export {ListSelector};
