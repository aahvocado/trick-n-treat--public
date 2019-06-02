import React, { PureComponent } from 'react';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import ConditionLogicDropdown from 'components/ConditionLogicDropdown';
import TargetListDropdown from 'components/TargetListDropdown';
import ItemListDropdown from 'components/ItemListDropdown';

import combineClassNames from 'utilities/combineClassNames';

import * as conditionLogicUtils from 'utilities.shared/conditionLogicUtils'

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
      targetId,
      conditionLogicId,
      itemId,
      value,
    } = data;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        <div className='flex-none pad-1 bor-r-1-gray color-grayer'>
          Condition:
        </div>

        {/* Target - for now only shows up for stats */}
        { conditionLogicUtils.isNumberConditionLogic(conditionLogicId) &&
          <TargetListDropdown
            className='flex-auto'
            showButton={false}
            selectedOption={{id: targetId}}
            onSelect={this.onSelectTarget}
          />
        }

        {/* Logic check */}
        <ConditionLogicDropdown
          className='flex-auto bor-l-1-gray'
          showButton={false}
          selectedOption={{id: conditionLogicId}}
          onSelect={this.onSelectLogic}
        />

        {/* Value */}
        { conditionLogicUtils.isNumberConditionLogic(conditionLogicId) &&
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
        { conditionLogicUtils.isItemConditionLogic(conditionLogicId) &&
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
   * @param {TargetId} targetId
   */
  onSelectTarget(targetId) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      targetId: targetId,
    });
  }
  /**
   * @param {ConditionLogicId} conditionLogicId
   */
  onSelectLogic(conditionLogicId) {
    const { data, onEdit } = this.props;
    onEdit({
      ...data,
      conditionLogicId: conditionLogicId,
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
