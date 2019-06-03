import React, {Fragment, PureComponent} from 'react';

import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import {TARGET_ID} from 'constants.shared/targetIds';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';

import ConditionEditorComponent from 'components/ConditionEditorComponent';
import ItemEditorComponent from 'components/ItemEditorComponent';
import {TriggerTargetListDropdown} from 'components/TargetListDropdown';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import {
  isItemTriggerLogic,
  isNumberTriggerLogic,
} from 'utilities.shared/triggerLogicUtils';

/**
 *
 */
export default class TriggerEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {TriggerData} */
    data: {},
    /** @type {Function} */
    onEdit: () => {},

    /** @type {Function} */
    onClickRemove: () => {},
    /** @type {Function} */
    onClickAddCondition: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onChangeConditionData = this.onChangeConditionData.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onRemoveCondition = this.onRemoveCondition.bind(this);
    this.onSelectTarget = this.onSelectTarget.bind(this);
    this.onSelectTrigger = this.onSelectTrigger.bind(this);
  }
  /** @override */
  render() {
    const {
      data,
      onClickAddCondition,
      onClickRemove,
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
          <TriggerLogicListDropdown
            className='bor-0-transparent'
            inputSize={16}
            showButton={false}
            selectedOption={{id: triggerLogicId}}
            onSelect={this.onSelectTrigger}
          />

          {/* trigger changes a Number */}
          { isNumberTriggerLogic(triggerLogicId) &&
            <Fragment>
              <TriggerTargetListDropdown
                className='bor-l-1-gray'
                inputSize={16}
                showButton={false}
                selectedOption={{id: targetId}}
                onSelect={this.onSelectTarget}
              />

              <input
                className='flex-auto bor-l-1-gray pad-h-2'
                type='number'
                value={value}
                onChange={this.onChangeValue}
              />
            </Fragment>
          }

          {/* trigger gives an Item */}
          { isItemTriggerLogic(triggerLogicId) &&
            <ItemEditorComponent
              className='flex-auto'
              data={data}
              onEdit={(updatedData) => {
                this.props.onEdit(updatedData);
              }}
            />
          }

          <IconButtonComponent
            className='flex-none borwidth-v-0 borwidth-r-0 bor-l-1-gray'
            icon={faTimes}
            onClick={onClickRemove}
          />
        </div>

        {/* Condition List */}
        { conditionList.map((conditionData, idx) => (
          <ConditionEditorComponent
            key={`viewer-trigger-item-condition-row-${idx}-key`}
            className='bor-h-1-gray bor-b-1-gray'
            data={conditionData}
            onEdit={(updatedData) => {
              this.onChangeConditionData(updatedData, idx);
            }}
            onClickRemove={() => {
              this.onRemoveCondition(idx);
            }}
          />
        ))}

        <ButtonComponent
          className='fsize-2 aself-start flex-none borradius-b-2 bor-b-1-gray bor-h-1-gray'
          theme={BUTTON_THEME.WHITE}
          onClick={onClickAddCondition}
        >
          Add Condition
        </ButtonComponent>
      </div>
    )
  }
  /**
   * @param {TriggerLogicId} triggerLogicId
   */
  onSelectTrigger(triggerLogicId) {
    const { data, onEdit } = this.props;

    const isItemTrigger = isItemTriggerLogic(triggerLogicId);

    onEdit({
      ...data,
      targetId: isItemTrigger ? TARGET_ID.ITEM.ALL : data.targetId,
      triggerLogicId: triggerLogicId,
    });
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
   * @param {ConditionData} conditionData
   * @param {Number} conditionLogicIdx
   */
  onChangeConditionData(conditionData, conditionLogicIdx) {
    const { data, onEdit } = this.props;

    data.conditionList[conditionLogicIdx] = conditionData;

    onEdit({
      ...data,
      conditionList: data.conditionList,
    });
  }
  /**
   * @param {Number} idx
   */
  onRemoveCondition(idx) {
    const { data, onEdit } = this.props;

    const conditionList = data.conditionList || [];
    conditionList.splice(idx, 1);

    onEdit({
      ...data,
      conditionList: conditionList,
    });
  }
}
