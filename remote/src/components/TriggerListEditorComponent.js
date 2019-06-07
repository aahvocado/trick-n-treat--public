import React, {Fragment, PureComponent} from 'react';
import uuid from 'uuid/v4';

import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import {TARGET_ID} from 'constants.shared/targetIds';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';

import ConditionListEditorComponent from 'components/ConditionListEditorComponent';
import ItemEditorComponent from 'components/ItemEditorComponent';
import {TriggerTargetListDropdown} from 'components/TargetListDropdown';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import combineClassNames from 'utilities/combineClassNames';

import {
  isItemTriggerLogic,
  isNumberTriggerLogic,
} from 'utilities.shared/triggerLogicUtils';
import * as genericDataUtils from 'utilities.shared/genericDataUtils'

/**
 * this is an Editor for a TriggerList
 */
export default class TriggerListEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-col',
    /** @type {String} */
    className: '',

    /** @type {String} */
    itemClassName: 'adjacent-mar-t-2',

    /** @type {Array<TriggerData>} */
    dataList: [],
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    // create a unique id for generated keys
    this.id = uuid();

    this.onUpdateTriggerData = this.onUpdateTriggerData.bind(this);
    this.onRemoveTrigger = this.onRemoveTrigger.bind(this);
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
          <TriggerDataEditorComponent
            key={`trigger-list-editor-${this.id}-item-${idx}-key`}
            className={itemClassName}
            data={data}
            onEdit={(updatedData) => {
              this.onUpdateTriggerData(updatedData, idx);
            }}
            onClickRemove={() => {
               this.onRemoveTrigger(idx);
            }}
          />
        ))}
      </div>
    )
  }
  /**
   * @param {EncounterData} newData
   * @param {Number} idx - index of the trigger
   */
  onUpdateTriggerData(newData, idx) {
    const {dataList, onEdit} = this.props;

    // update the data
    const resultList = genericDataUtils.updateTriggerDataAt(dataList, newData, idx);

    // callback to say data has changed
    onEdit(resultList);
  }
  /**
   * @param {Number} idx
   */
  onRemoveTrigger(idx) {
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
export class TriggerDataEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {TriggerData} */
    data: {},
    /** @type {Function} */
    onEdit: () => {},
    /** @type {Function} */
    onClickRemove: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onClickAddCondition = this.onClickAddCondition.bind(this);
  }
  /** @override */
  render() {
    const {
      data,
      onClickRemove,
      onEdit,
    } = this.props;

    const {
      conditionList = [],
      // itemId,
      targetId,
      triggerLogicId,
      value,
    } = data;

    return (
      <div className='adjacent-mar-t-2 flex-col'>
        {/* Basic Information row */}
        <div className='bor-1-gray bg-white flex-row'>
          {/* current Trigger */}
          <TriggerLogicListDropdown
            className='bor-0-transparent flex-auto'
            inputSize={16}
            showButton={false}
            selectedOption={{id: triggerLogicId}}
            onSelect={(triggerLogicId) => onEdit({
              targetId: isItemTriggerLogic(triggerLogicId) ? TARGET_ID.ITEM.ALL : data.targetId,
              triggerLogicId: triggerLogicId,
            })}
          />

          {/* trigger changes a Number */}
          { isNumberTriggerLogic(triggerLogicId) &&
            <Fragment>
              <TriggerTargetListDropdown
                className='bor-l-1-gray'
                inputSize={16}
                showButton={false}
                selectedOption={{id: targetId}}
                onSelect={(targetId) => onEdit({targetId: targetId})}
              />

              <input
                className='flex-auto bor-l-1-gray pad-h-2'
                type='number'
                value={value}
                onChange={(evt) => onEdit({value: evt.target.value})}
              />
            </Fragment>
          }

          {/* trigger gives an Item */}
          { isItemTriggerLogic(triggerLogicId) &&
            <ItemEditorComponent
              className='flex-auto'
              data={data}
              onEdit={(itemData) => onEdit(itemData)}
            />
          }

          {/* Remove Trigger */}
          <IconButtonComponent
            className='flex-none borwidth-v-0 borwidth-r-0 bor-l-1-gray'
            icon={faTimes}
            onClick={onClickRemove}
          />
        </div>

        {/* Condition List */}
        { conditionList.length > 0 &&
          <ConditionListEditorComponent
            className='bor-h-1-gray bor-b-1-gray'
            dataList={conditionList}
            onEdit={(updatedData) => onEdit({conditionList: updatedData})}
          />
        }

        {/* Button to add another Condition */}
        <ButtonComponent
          className='fsize-2 aself-start flex-none borradius-b-2 borwidth-t-0 bor-h-1-gray bor-b-1-gray'
          theme={BUTTON_THEME.WHITE}
          onClick={this.onClickAddCondition}
        >
          Add Condition
        </ButtonComponent>
      </div>
    )
  }
  /**
   *
   */
  onClickAddCondition() {
    const { data, onEdit } = this.props;

    // create it
    const newCondition = genericDataUtils.createConditionData();

    // add it
    const resultData = genericDataUtils.addConditionToData(data, newCondition);

    // update parent
    onEdit(resultData);
  }
}
