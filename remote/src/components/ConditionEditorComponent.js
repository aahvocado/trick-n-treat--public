import React, { PureComponent } from 'react';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import ConditionIdDropdown from 'components/ConditionIdDropdown';
import ConditionTargetDropdown from 'components/ConditionTargetDropdown';
import ItemListDropdown from 'components/ItemListDropdown';

import combineClassNames from 'utilities/combineClassNames';

import * as conditionUtils from 'utilities.shared/conditionUtils'

/**
 *
 */
export default class ConditionEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bg-white flex-row-center',
    /** @type {String} */
    className: '',

    /** @type {ConditionData} */
    data: {},
    /** @type {Function} */
    onEdit: () => {},
    /** @type {Function} */
    onClickRemove: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSelectItem = this.onSelectItem.bind(this);
    this.onSelectLogic = this.onSelectLogic.bind(this);
    this.onSelectTarget = this.onSelectTarget.bind(this);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      data,
      onClickRemove,
    } = this.props;

    const {
      conditionTargetId,
      conditionId,
      itemId,
      value,
    } = data;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        <div className='flex-none pad-1 bor-r-1-gray color-grayer'>
          Condition:
        </div>

        {/* Target - for now only shows up for stats */}
        { conditionUtils.isNumberCondition(conditionId) &&
          <ConditionTargetDropdown
            className='flex-auto'
            showButton={false}
            selectedOption={{id: conditionTargetId}}
            onSelect={this.onSelectTarget}
          />
        }

        {/* Logic check */}
        <ConditionIdDropdown
          className='flex-auto bor-l-1-gray'
          showButton={false}
          selectedOption={{id: conditionId}}
          onSelect={this.onSelectLogic}
        />

        {/* Value */}
        { conditionUtils.isNumberCondition(conditionId) &&
          <input
            className='flex-none bor-l-1-gray pad-h-2 pad-v-1'
            style={{width: '200px'}}
            placeholder='Value'
            type='number'
            value={value}
            onChange={this.onChangeValue}
          />
        }

        {/* Item */}
        { conditionUtils.isItemCondition(conditionId) &&
          <ItemListDropdown
            className='flex-auto bor-l-1-gray'
            selectedOption={{id: itemId}}
            onSelect={this.onSelectItem}
          />
        }

        <IconButtonComponent
          className='flex-none bor-l-1-gray'
          icon={faTimes}
          onClick={onClickRemove}
        />
      </div>
    )
  }
  /**
   * @param {ConditionTargetId} conditionTargetId
   */
  onSelectTarget(conditionTargetId) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      conditionTargetId: conditionTargetId,
    });
  }
  /**
   * @param {ConditionId} conditionId
   */
  onSelectLogic(conditionId) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      conditionId: conditionId,
    });
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeValue(e) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      value: parseInt(e.target.value),
    });
  }
  /**
   * @param {ItemData} itemData
   */
  onSelectItem(itemData) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      itemId: itemData.id,
    });
  }
}
