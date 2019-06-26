import React, { PureComponent } from 'react';
import uuid from 'uuid/v4';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import TileListDropdown from 'components/TileListDropdown';

import combineClassNames from 'utilities/combineClassNames';

// import l10n from 'utilities.shared/l10n';

/**
 * this is an Editor for a TileList
 */
export default class TileListEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row',
    /** @type {String} */
    className: '',

    /** @type {String} */
    itemClassName: 'adjacent-mar-1',

    /** @type {Array<TileId>} */
    dataList: [],
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    // create a unique id for generated keys
    this.id = uuid();

    this.onUpdate = this.onUpdate.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      dataList,
      itemClassName,
    } = this.props;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        { dataList.map((data, idx) => (
          <TileDataEditorComponent
            key={`tag-list-editor-${this.id}-item-${idx}-key`}
            className={itemClassName}
            selectedTileName={data}
            onEdit={(updatedData) => {
              this.onUpdate(updatedData, idx);
            }}
            onClickRemove={() => {
              this.onRemove(idx);
            }}
          />
        ))}
      </div>
    )
  }
  /**
   * @param {EncounterData} newData
   * @param {Number} idx
   */
  onUpdate(newData, idx) {
    const {dataList, onEdit} = this.props;

    // update the data
    dataList[idx] = newData;

    // callback to say data has changed
    onEdit(dataList);
  }
  /**
   * @param {Number} idx
   */
  onRemove(idx) {
    const {dataList, onEdit} = this.props;

    // remove the item
    dataList.splice(idx, 1);

    // callback to say data has changed
    onEdit(dataList);
  }
}
/**
 *
 */
export class TileDataEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bg-white flex-row bor-1-gray',
    /** @type {String} */
    className: '',
    /** @type {TileId} */
    selectedTileName: '',
    /** @type {Function} */
    onEdit: () => {},
    /** @type {Function} */
    onClickRemove: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onSelectTile = this.onSelectTile.bind(this);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      selectedTileName,
      onClickRemove,
      onEdit,
    } = this.props;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        <TileListDropdown
          className='fsize-3 flex-auto borcolor-transparent bor-r-1-gray'
          selectedOption={{id: selectedTileName}}
          onSelect={(selectedTileName) => onEdit(selectedTileName)}
          canSearch={false}
        />

        <IconButtonComponent
          className='flex-none bor-0-transparent'
          icon={faTimes}
          onClick={onClickRemove}
        />
      </div>
    )
  }
  /**
   * @param {TargetId} targetId
   */
  onSelectTile(tileId) {
    const { onEdit } = this.props;
    onEdit(tileId);
  }
}
