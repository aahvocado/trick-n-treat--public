import React, { PureComponent } from 'react';
import uuid from 'uuid/v4';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import TagListDropdown from 'components/TagListDropdown';

import combineClassNames from 'utilities/combineClassNames';

import l10n from 'utilities.shared/l10n';

/**
 * this is an Editor for a TagList
 */
export default class TagListEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row',
    /** @type {String} */
    className: '',

    /** @type {String} */
    itemClassName: 'adjacent-mar-1',

    /** @type {Array<TagData>} */
    dataList: [],
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    // create a unique id for generated keys
    this.id = uuid();

    this.onUpdateTagData = this.onUpdateTagData.bind(this);
    this.onRemoveTag = this.onRemoveTag.bind(this);
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
          <TagDataEditorComponent
            key={`tag-list-editor-${this.id}-item-${idx}-key`}
            className={itemClassName}
            selectedTagId={data}
            onEdit={(updatedData) => {
              this.onUpdateTagData(updatedData, idx);
            }}
            onClickRemove={() => {
              this.onRemoveTag(idx);
            }}
          />
        ))}
      </div>
    )
  }
  /**
   * @param {EncounterData} newData
   * @param {Number} idx - index of the tag
   */
  onUpdateTagData(newData, idx) {
    const {dataList, onEdit} = this.props;

    // update the data
    dataList[idx] = newData;

    // callback to say data has changed
    onEdit(dataList);
  }
  /**
   * @param {Number} idx
   */
  onRemoveTag(idx) {
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
export class TagDataEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bg-white flex-row bor-1-gray',
    /** @type {String} */
    className: '',
    /** @type {TagId} */
    selectedTagId: '',
    /** @type {Function} */
    onEdit: () => {},
    /** @type {Function} */
    onClickRemove: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onSelectTag = this.onSelectTag.bind(this);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      selectedTagId,
      onClickRemove,
      onEdit,
    } = this.props;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        <TagListDropdown
          className='fsize-3 flex-auto borcolor-transparent bor-r-1-gray'
          selectedOption={l10n(selectedTagId)}
          onSelect={(selectedTagId) => onEdit(selectedTagId)}
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
  onSelectTag(tagId) {
    const { onEdit } = this.props;
    onEdit(tagId);
  }
}
