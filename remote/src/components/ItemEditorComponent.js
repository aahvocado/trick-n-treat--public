import React, { PureComponent } from 'react';

import ItemListDropdown from 'components/ItemListDropdown';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ItemEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bg-white flex-row',
    /** @type {String} */
    className: '',
    /** @type {ConditionData} */
    data: {},
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSelectItemId = this.onSelectItemId.bind(this);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      data,
    } = this.props;

    const {
      itemId,
      value,
    } = data;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        <ItemListDropdown
          className='flex-auto bor-l-1-gray'
          selectedOption={{id: itemId}}
          onSelect={this.onSelectItemId}
          showButton={false}
        />

        {/* Value */}
        <input
          className='flex-none bor-l-1-gray pad-h-2 pad-v-1'
          style={{width: '50px'}}
          placeholder='Value'
          type='number'
          value={value}
          onChange={this.onChangeValue}
        />
      </div>
    )
  }
  /**
   * @param {ItemData} itemData
   */
  onSelectItemId(itemData) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      itemId: itemData.id,
    });
  }
  /**
   * @param {SyntheticEvent} evt
   */
  onChangeValue(evt) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      value: parseInt(evt.target.value),
    });
  }
}
