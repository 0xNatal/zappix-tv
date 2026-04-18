import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator, {spotlightDefaultClass} from '@enact/spotlight/SpotlightContainerDecorator';
import css from './ListSelector.module.less';

const SpottableItem = Spottable('div');

const SelectorContainer = SpotlightContainerDecorator(
  {enterTo: 'default-element'},
  'div'
);

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
            title={list.name}
          >
            <span className={active ? css.initialActive : css.initial}>
              {list.name.charAt(0).toUpperCase()}
            </span>
          </SpottableItem>
        );
      })}
    </SelectorContainer>
  );
};

export default ListSelector;
export {ListSelector};
