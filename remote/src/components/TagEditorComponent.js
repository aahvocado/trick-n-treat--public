import React, { PureComponent } from 'react';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import TagListDropdown from 'components/TagListDropdown';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default class TagEditorComponent extends PureComponent {
  static defaultProps = {
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
      selectedTagId,
      onClickRemove,
    } = this.props;

    return (
      <div className='bg-white flex-row bor-1-gray mar-1'>
        <TagListDropdown
          className='fsize-3 flex-none borcolor-transparent bor-r-1-gray'
          showButton={false}
          selectedOption={l10n(selectedTagId)}
          onSelect={this.onSelectTag}
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
   * @param {ConditionTargetId} conditionTargetId
   */
  onSelectTag(tagId) {
    const { onEdit } = this.props;
    onEdit(tagId);
  }
}
