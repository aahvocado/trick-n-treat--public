import React, { PureComponent } from 'react';
import uuid from 'uuid/v4';

import { faTimes } from '@fortawesome/free-solid-svg-icons'

import IconButtonComponent from 'common-components/IconButtonComponent';

import ConditionLogicDropdown from 'components/ConditionLogicDropdown';
import TargetListDropdown from 'components/TargetListDropdown';
import ItemListDropdown from 'components/ItemListDropdown';

import combineClassNames from 'utilities/combineClassNames';

import * as conditionLogicUtils from 'utilities.shared/conditionLogicUtils'
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils'

/**
 * this is an Editor for a ConditionList
 */
export default class ConditionListEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-col',
    /** @type {String} */
    className: '',

    /** @type {String} */
    itemClassName: '',

    /** @type {Array<ConditionData>} */
    dataList: [],
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    // create a unique id for generated keys
    this.id = uuid();

    this.onUpdateConditionData = this.onUpdateConditionData.bind(this);
    this.onRemoveCondition = this.onRemoveCondition.bind(this);
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
          <ConditionDataEditorComponent
            key={`condition-list-editor-${this.id}-item-${idx}-key`}
            className={itemClassName}
            data={data}
            onEdit={(updatedData) => {
              this.onUpdateConditionData(updatedData, idx);
            }}
            onClickRemove={() => {
              this.onRemoveCondition(idx);
            }}
          />
        ))}
      </div>
    )
  }
  /**
   * @param {EncounterData} newData
   * @param {Number} idx - index of the condition
   */
  onUpdateConditionData(newData, idx) {
    const {dataList, onEdit} = this.props;

    // update the data
    const resultList = encounterDataUtils.updateConditionDataAt(dataList, newData, idx);

    // callback to say data has changed
    onEdit(resultList);
  }
  /**
   * @param {Number} idx
   */
  onRemoveCondition(idx) {
    const {dataList, onEdit} = this.props;

    // remove the item
    dataList.splice(idx, 1);

    // callback to say data has changed
    onEdit(dataList);
  }
}
/**
 * this helps edit an individual ConditionData
 */
export class ConditionDataEditorComponent extends PureComponent {
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
  render() {
    const {
      baseClassName,
      className,
      data,
      onClickRemove,
      onEdit,
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
            className='flex-auto bor-r-1-gray'
            showButton={false}
            selectedOption={{id: targetId}}
            onSelect={(targetId) => onEdit({targetId: targetId})}
          />
        }

        {/* Logic check */}
        <ConditionLogicDropdown
          className='flex-auto'
          showButton={false}
          selectedOption={{id: conditionLogicId}}
          onSelect={(conditionLogicId) => onEdit({conditionLogicId: conditionLogicId})}
        />

        {/* Value */}
        { conditionLogicUtils.isNumberConditionLogic(conditionLogicId) &&
          <input
            className='flex-none bor-l-1-gray pad-h-2 pad-v-1'
            style={{width: '50px'}}
            placeholder='Value'
            type='number'
            value={value}
            onChange={(evt) => onEdit({value: evt.target.value})}
          />
        }

        {/* Item */}
        { conditionLogicUtils.isItemConditionLogic(conditionLogicId) &&
          <ItemListDropdown
            className='flex-auto bor-l-1-gray'
            selectedOption={{id: itemId}}
            onSelect={(itemData) => onEdit({itemId: itemData.id})}
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
}
