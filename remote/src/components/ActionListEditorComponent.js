import React, { PureComponent } from 'react';
import uuid from 'uuid/v4';

import {faTimes} from '@fortawesome/free-solid-svg-icons'

import {GOTO_CHOICE_ID_LIST} from 'constants.shared/choiceIds';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';

import ActionListDropdown from 'components/ActionListDropdown';
import ConditionListEditorComponent from 'components/ConditionListEditorComponent';

import {ALL_ENCOUNTER_DATA_LIST} from 'helpers.shared/encounterDataHelper'

import combineClassNames from 'utilities/combineClassNames';

import * as genericDataUtils from 'utilities.shared/genericDataUtils'

/**
 * this is an Editor for a ActionList
 */
export default class ActionListEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-col',
    /** @type {String} */
    className: '',

    /** @type {String} */
    itemClassName: 'adjacent-mar-t-2',

    /** @type {Array<ActionData>} */
    dataList: [],
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    // create a unique id for generated keys
    this.id = uuid();

    this.onUpdateActionData = this.onUpdateActionData.bind(this);
    this.onRemoveAction = this.onRemoveAction.bind(this);
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
          <ActionDataEditorComponent
            key={`condition-list-editor-${this.id}-item-${idx}-key`}
            className={itemClassName}
            data={data}
            onEdit={(updatedData) => {
              this.onUpdateActionData(updatedData, idx);
            }}
            onClickRemove={() => {
               this.onRemoveAction(idx);
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
  onUpdateActionData(newData, idx) {
    const {dataList, onEdit} = this.props;

    // update the data
    const resultList = genericDataUtils.updateActionDataAt(dataList, newData, idx);

    // callback to say data has changed
    onEdit(resultList);
  }
  /**
   * @param {Number} idx
   */
  onRemoveAction(idx) {
    const {dataList, onEdit} = this.props;

    // remove the item
    dataList.splice(idx, 1);

    // callback to say data has changed
    onEdit(dataList);
  }
}
/**
 * this helps edit an individual ActionData
 */
export class ActionDataEditorComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: '',
    /** @type {String} */
    className: '',

    /** @type {ActionData} */
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
      baseClassName,
      className,
      data,
      onClickRemove,
      onEdit,
    } = this.props;

    const {
      choiceId,
      conditionList = [],
      label,
      gotoId,
    } = data;

    return (
      <div className={combineClassNames(baseClassName, className)}>
        {/* Basic Information row */}
        <div className='bor-1-gray bg-white flex-row'>
          {/* current Action */}
          <ActionListDropdown
            className='bor-0-transparent adjacent-mar-t-2'
            showButton={false}
            selectedOption={{id: choiceId}}
            onSelect={(choiceId) => onEdit({choiceId: choiceId})}
          />

          {/* Label change */}
          <input
            className='flex-auto bor-h-1-gray pad-h-2'
            type='text'
            placeholder='Label for the button...'
            value={label}
            onChange={(evt) => onEdit({label: evt.target.value})}
          />

          {/* Remove Action */}
          <IconButtonComponent
            className='flex-none bor-0-transparent'
            icon={faTimes}
            onClick={onClickRemove}
          />
        </div>

        {/* Encounter to "go to" */}
        { GOTO_CHOICE_ID_LIST.includes(choiceId) &&
          <div className='bg-white flex-row-center bor-h-1-gray bor-b-1-gray'>
            <div className='flex-none pad-1 bor-r-1-gray color-grayer'>Goes to Encounter</div>
            <DropdownComponent
              className='flex-auto borcolor-transparent adjacent-mar-t-2'
              selectedOption={{id: gotoId}}
              options={ALL_ENCOUNTER_DATA_LIST.map((item) => ({
                data: item.id,
                id: item.id,
                label: item.title,
              }))}
              onSelect={(gotoId) => onEdit({gotoId: gotoId})}
            />
          </div>
        }

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
   * @param {Object} [defaultData]
   */
  onClickAddCondition(defaultData = {}) {
    const { data, onEdit } = this.props;

    // create it
    const newCondition = genericDataUtils.createConditionData(defaultData);

    // add it
    const resultData = genericDataUtils.addConditionToData(data, newCondition);

    // update parent
    onEdit(resultData);
  }
}
