import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

import {DATA_TYPE} from 'constants.shared/dataTypes';

import ButtonComponent from 'common-components/ButtonComponent';
import TextAreaComponent from 'common-components/TextAreaComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ToggleComponent from 'common-components/ToggleComponent';

import ConditionListEditorComponent from 'components/ConditionListEditorComponent';
import ConditionLogicDropdown from 'components/ConditionLogicDropdown';
import ItemListDropdown from 'components/ItemListDropdown';
import TagListEditorComponent from 'components/TagListEditorComponent';
import TagListDropdown from 'components/TagListDropdown';
import TriggerListEditorComponent from 'components/TriggerListEditorComponent';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import remoteAppState from 'state/remoteAppState';

import copyToClipboard from 'utilities/copyToClipboard';
import download from 'utilities/download';

import deepClone from 'utilities.shared/deepClone';
import * as itemDataUtils from 'utilities.shared/itemDataUtils';

/**
 * Item Editor page
 */
export default observer(
class ItemEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.createNew = this.createNew.bind(this);
    this.deleteActiveData = this.deleteActiveData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.setActiveData = this.setActiveData.bind(this);

    this.onToggleConsumable = this.onToggleConsumable.bind(this);
    this.onToggleKeyItem = this.onToggleKeyItem.bind(this);
    this.onToggleUseable = this.onToggleUseable.bind(this);

    this.copyActiveDataToClipboard = this.copyActiveDataToClipboard.bind(this);
    this.copyDataListToClipboard = this.copyDataListToClipboard.bind(this);
    this.downloadDataList = this.downloadDataList.bind(this);

    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeId = this.onChangeId.bind(this);
    this.onChangeName = this.onChangeName.bind(this);

    this.onChangeConditionData = this.onChangeConditionData.bind(this);
    this.onRemoveCondition = this.onRemoveCondition.bind(this);
    this.addCondition = this.addCondition.bind(this);

    this.addTrigger = this.addTrigger.bind(this);
    this.removeTrigger = this.removeTrigger.bind(this);
    this.updateTrigger = this.updateTrigger.bind(this);
    this.addConditionToTrigger = this.addConditionToTrigger.bind(this);

    this.addTag = this.addTag.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.updateTag = this.updateTag.bind(this);

    this.state = {
      // -- Editor
      /** @type {ItemData} */
      activeData: deepClone(itemDataHelper.ITEM_DATA[0]),
      /** @type {Array<ItemData>} */
      dataList: itemDataHelper.ITEM_DATA,

      /** @type {Boolean} */
      hasChanges: false,
    }
  }
  /** @override */
  render() {
    if (!remoteAppState.get('isEditorMode')) {
      if (remoteAppState.get('isInLobby')) {
        return <Redirect to='/lobby' />
      }

      if (remoteAppState.get('isInGame')) {
        return <Redirect to='/game' />
      }
    }

    const {
      activeData,
      dataList,
      hasChanges,
    } = this.state;

    return (
      <div
        className='flex-center flex-col color-white bg-primary fontfamily-secondary'
      >
        <h2 className='bg-secondary fsize-4 pad-v-1 width-full talign-center'>
          Item Editor
        </h2>

        <div className='flex-row height-full bg-primary-darker'>
          <ItemEditorMenu
            activeData={activeData}
            dataList={dataList}
            hasChanges={hasChanges}

            onClickCreateNew={this.createNew}
            onClickDelete={this.deleteActiveData}
            onClickSave={this.saveData}
            onSelectNewActiveItem={this.setActiveData}

            onClickCopyCurrentData={this.copyActiveDataToClipboard}
            onClickCopyAllData={this.copyDataListToClipboard}
            onClickDownload={this.downloadDataList}
          />

          <ItemEditorViewer
            activeData={activeData}
            dataList={dataList}

            onChangeDescription={this.onChangeDescription}
            onChangeId={this.onChangeId}
            onChangeName={this.onChangeName}

            onToggleConsumable={this.onToggleConsumable}
            onToggleKeyItem={this.onToggleKeyItem}
            onToggleUseable={this.onToggleUseable}

            onChangeConditionData={this.onChangeConditionData}
            onRemoveCondition={this.onRemoveCondition}
            onSelectNewCondition={this.addCondition}

            onChangeTriggerData={this.updateTrigger}
            onClickRemoveTrigger={this.removeTrigger}
            onSelectNewTrigger={this.addTrigger}
            onClickAddTriggerCondition={this.addConditionToTrigger}

            onChangeTagData={this.updateTag}
            onClickRemoveTag={this.removeTag}
            onSelectNewTag={this.addTag}
          />
        </div>
      </div>
    );
  }
  /**
   * set `activeData` to a blank template
   */
  createNew() {
    this.setState({
      activeData: deepClone(itemDataUtils.createBlankTemplate()),
      hasChanges: true,
    });
  }
  /**
   * saves all the changes from the current `activeData`
   *  to the
   */
  saveData() {
    const {
      dataList,
      activeData,
    } = this.state;

    // find if activeData is in list
    const matchingData = dataList.findIndex((dataObject) => (dataObject.id === activeData.id));

    // if not, add it to the `dataList``
    if (matchingData <= -1) {
      dataList.push(activeData);
      this.setState({
        activeData: deepClone(activeData),
        dataList: dataList,
        hasChanges: false,
      }, () => {
        this.copyDataListToClipboard();
      });
      return;
    }

    // replace data currently at the
    dataList[matchingData] = activeData;
    this.setState({
      activeData: deepClone(activeData),
      dataList: dataList,
      hasChanges: false,
    }, () => {
      this.copyDataListToClipboard();
    });
  }
  /**
   * deletes the currently viewed Data
   */
  deleteActiveData() {
    const {activeData} = this.state;
    this.deleteData(activeData);
  }
  /**
   * removes the `activeData` from the List
   *
   * @param {ItemData} itemData
   */
  deleteData(itemData) {
    const {
      dataList,
    } = this.state;

    // find if activeData is in list
    const matchingData = dataList.findIndex((dataObject) => (dataObject.id === itemData.id));
    if (matchingData <= -1) {
      return;
    }

    // remove it from the list
    dataList.splice(matchingData, 1);

    // if there are no other items, create a new one
    if (dataList.length <= 0) {
      this.onClickCreateNewHandler();
      this.setState({dataList: []});
      return;
    }

    // setState to the first item in the list
    this.setState({
      activeData: deepClone(dataList[0]),
      dataList: dataList,
      hasChanges: false,
    });
  }
  /**
   * set the active Data to one in the list
   *
   * @param {ItemData} itemData
   */
  setActiveData(itemData) {
    const { dataList } = this.state;

    const matchingItem = dataList.find((item) => (item.id === itemData.id));
    if (matchingItem === undefined) {
      return;
    }

    // set the `activeData` to a clone
    this.setState({
      activeData: deepClone(matchingItem),
      hasChanges: false,
    });
  }
  /**
   * copies a json of the `activeData` to clipboard
   */
  copyActiveDataToClipboard() {
    const { activeData } = this.state;
    copyToClipboard(JSON.stringify(activeData));
  }
  /**
   * copies a json of the `dataList` to clipboard
   *  triggered after pressing "save" so work isn't lost if we forget to export
   */
  copyDataListToClipboard() {
    const { dataList } = this.state;
    copyToClipboard(JSON.stringify(dataList));
  }
  /**
   * downloads a `itemData.json` file
   */
  downloadDataList() {
    const { dataList } = this.state;
    download(JSON.stringify(dataList), 'itemData.json', 'application/json');
  }
  /**
   * the `id` of the activeItem was changed
   *
   * @param {String} value
   */
  onChangeId(value) {
    const { activeData } = this.state;

    // change the data
    activeData.id = itemDataUtils.formatId(value);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * the `name` of the activeItem was changed
   *
   * @param {String} value
   */
  onChangeName(value) {
    const { activeData } = this.state;

    // change the data
    activeData.name = value;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * the `description` of the activeItem was changed
   *
   * @param {String} value
   */
  onChangeDescription(value) {
    const { activeData } = this.state;

    // change the data
    activeData.description = value;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   *
   */
  onToggleConsumable() {
    const { activeData } = this.state;

    // change the data
    activeData.isConsumable = !activeData.isConsumable;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   *
   */
  onToggleKeyItem() {
    const { activeData } = this.state;

    // change the data
    activeData.isKeyItem = !activeData.isKeyItem;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   *
   */
  onToggleUseable() {
    const { activeData } = this.state;

    // change the data
    activeData.isUseable = !activeData.isUseable;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Condition to the active Data
   *
   * @param {ConditionLogicId} conditionLogicId
   */
  addCondition(conditionLogicId) {
    const { activeData } = this.state;
    const { conditionList } = activeData;

    // add it
    conditionList.push({
      dataType: DATA_TYPE.CONDITION,
      conditionLogicId: conditionLogicId,
      targetId: undefined,
    });

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   *
   */
  onChangeConditionData(conditionData, conditionLogicIdx) {
    const { activeData } = this.state;

    // change the data
   activeData.conditionList[conditionLogicIdx] = conditionData;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   *
   */
  onRemoveCondition(idx) {
    const { activeData } = this.state;

    // change the data
    const conditionList = activeData.conditionList || [];
    conditionList.splice(idx, 1);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Trigger to the active Data
   *
   * @param {TriggerLogicId} triggerLogicId
   */
  addTrigger(triggerLogicId) {
    const { activeData } = this.state;
    const { triggerList } = activeData;

    // do not add duplicates
    if (triggerList.find(t => t.triggerLogicId === triggerLogicId)) {
      return;
    }

    // add it
    triggerList.push({
      dataType: DATA_TYPE.CONDITION,
      triggerLogicId: triggerLogicId,
      value: 1,
    });

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * remove Trigger
   *
   * @param {TriggerLogicId} triggerLogicId
   * @param {Number} idx
   */
  removeTrigger(triggerLogicId, idx) {
    const { activeData } = this.state;
    const { triggerList } = activeData;

    // remove it
    triggerList.splice(idx, 1);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * updates an Action
   *
   * @param {TriggerData} triggerData
   * @param {Number} idx
   */
  updateTrigger(triggerData, idx) {
    const { activeData } = this.state;
    const { triggerList } = activeData;

    //
    triggerList[idx] = triggerData;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Condition to given Trigger data
   *
   * @param {TriggerData} triggerData
   * @param {Number} idx
   */
  addConditionToTrigger(triggerData, idx) {
    const { activeData } = this.state;
    const { triggerList } = activeData;

    // add a new blank condition
    const conditionList = triggerData.conditionList || [];
    conditionList.push({
      conditionLogicId: undefined,
      targetId: undefined,
      value: 1,
    });

    // update the `conditionList` in the trigger
    triggerData.conditionList = conditionList;
    triggerList[idx] = triggerData;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * adds a Tag to the active Data
   *
   * @param {String} tagId
   */
  addTag(tagId) {
    const { activeData } = this.state;
    const { tagList } = activeData;

    // check if it already already has the tag
    if (tagList.includes(tagId)) {
      return;
    }

    // add it
    tagList.push(tagId);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * removes a Tag from the active Data
   *
   * @param {String} tagId
   */
  removeTag(tagId) {
    const { activeData } = this.state;
    const { tagList } = activeData;

    // check if there actually is the tag
    const tagIdx = tagList.indexOf(tagId);
    if (tagIdx <= -1) {
      return;
    }

    // remove it
    tagList.splice(tagIdx, 1);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * updates Tag data
   *
   * @param {String} tagId
   * @param {Number} idx
   */
  updateTag(tagId, idx) {
    const { activeData } = this.state;
    const { tagList } = activeData;

    // set it to the new tagData
    tagList[idx] = tagId;

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
})
/**
 * Menu
 */
class ItemEditorMenu extends Component {
  /** @override */
  render() {
    const {
      activeData,
      dataList,
      hasChanges,

      onClickCreateNew,
      onClickDelete,
      onClickSave,
      onSelectNewActiveItem,

      onClickCopyCurrentData,
      onClickCopyAllData,
      onClickDownload,
    } = this.props;

    const isNew = dataList.find(item => item.id === activeData.id) === undefined;
    const hasUndefinedId = activeData.id === 'ITEM_ID.NEW' || activeData.id === '';

    return (
      <div
        className='flex-col aitems-center color-white bg-primary pad-2'
        style={{
          width: '300px',
        }}
      >
        <MenuRow>
          <ButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCreateNew}
          >
            Create New
          </ButtonComponent>

          <ButtonComponent
            className='adjacent-mar-t-2'
            disabled={!hasChanges || hasUndefinedId}
            onClick={onClickSave}
          >
            {`Save ${isNew ? 'New' : ''}`}
          </ButtonComponent>

          <ButtonComponent
            className='adjacent-mar-t-2'
            disabled={isNew}
            onClick={onClickDelete}
          >
            Delete
          </ButtonComponent>

          <h3 className='talign-center adjacent-mar-t-2'>{`Items (${dataList.length})`}</h3>

          {/* List of Items */}
          <ItemListDropdown
            className='fsize-4 adjacent-mar-t-2'
            controlClassName='pad-2'
            selectedOption={activeData}
            onSelect={onSelectNewActiveItem}
            canSearch
          />
        </MenuRow>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Export options */}
        <MenuRow>
          <ButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCopyCurrentData}
          >
            Copy Current Data
          </ButtonComponent>

          <ButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCopyAllData}
          >
            Copy All Data
          </ButtonComponent>

          <ButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickDownload}
          >
            Download itemData.json
          </ButtonComponent>
        </MenuRow>
      </div>
    );
  }
}
/**
 *
 */
class ItemEditorViewer extends Component {
  render() {
    const {
      activeData,
      // dataList,

      onChangeDescription,
      onChangeId,
      onChangeName,

      onToggleConsumable,
      onToggleKeyItem,
      onToggleUseable,

      onChangeConditionData,
      onRemoveCondition,
      onSelectNewCondition,

      onChangeTriggerData,
      onClickRemoveTrigger,
      onSelectNewTrigger,
      onClickAddTriggerCondition,

      onClickRemoveTag,
      onChangeTagData,
      onSelectNewTag,
    } = this.props;

    const {
      id,
      isConsumable,
      isKeyItem,
      isUseable,
      name,
      conditionList,
      description,
      tagList,
      triggerList,
    } = activeData;

    return (
      <div
        className='mar-h-auto mar-v-2 flex-col pad-2 fsize-3 color-black bor-3-tertiary borradius-2'
        style={{
          backgroundColor: 'beige',
          width: '575px',
        }}
      >
        {/* Basic Info */}
        <ViewerRow>
          <ViewerHeader>Information</ViewerHeader>

          <TextInputComponent
            placeholder='Please enter a unique `id`'
            label='id'
            value={itemDataUtils.snipIdPrefix(id)}
            onChange={(evt) => onChangeId(evt.target.value)}
          />

          <TextInputComponent
            placeholder='Name'
            label='name'
            value={name}
            onChange={(evt) => onChangeName(evt.target.value)}
          />

          <TextAreaComponent
            className='resize-vertical adjacent-mar-t-2'
            placeholder='Description'
            label='description'
            value={description}
            onChange={(evt) => onChangeDescription(evt.target.value)}
          />
        </ViewerRow>

        <ViewerDivider />

        <ViewerRow>
          <ToggleComponent
            className='adjacent-mar-t-2'
            children='Useable'
            checked={isUseable || false}
            onChange={onToggleUseable}
          />

          <ToggleComponent
            className='adjacent-mar-t-2'
            children='Consumable'
            checked={isConsumable || false}
            onChange={onToggleConsumable}
          />

          <ToggleComponent
            className='adjacent-mar-t-2'
            children='Key Item'
            checked={isKeyItem || false}
            onChange={onToggleKeyItem}
          />
        </ViewerRow>

        <ViewerDivider />

        {/* Condition List */}
        <ViewerRow>
          <ViewerHeader>Use Conditions</ViewerHeader>

          <ConditionLogicDropdown
            className='flex-auto bor-1-gray adjacent-mar-t-2'
            placeholder='Add New Use Condition...'
            onSelect={onSelectNewCondition}
          />

          { conditionList.length > 0 &&
            <ConditionListEditorComponent
              className='bor-1-gray adjacent-mar-t-2'
              dataList={conditionList}
            />
          }
        </ViewerRow>

        <ViewerDivider />

        <ViewerDivider />

        {/* Trigger List */}
        <ViewerRow>
          <ViewerHeader>Triggers</ViewerHeader>

          <TriggerLogicListDropdown
            className='fsize-3 bor-1-gray adjacent-mar-t-2'
            placeholder='New Trigger...'
            canSearch={true}
            onSelect={onSelectNewTrigger}
          />

          <div className='fsize-3 flex-col adjacent-mar-t-2'>
            { triggerList.map((triggerData, idx) => (
              <TriggerListEditorComponent
                key={`trigger-item-${triggerData.triggerLogicId}-${idx}-key`}
                data={triggerData}
                onEdit={(updatedData) => {
                  onChangeTriggerData(updatedData, idx);
                }}

                onClickRemove={() => { onClickRemoveTrigger(triggerData, idx); }}
                onClickAddCondition={() => { onClickAddTriggerCondition(triggerData, idx); }}
              />
            ))}
          </div>
        </ViewerRow>

        <ViewerDivider />

        {/* Tag List */}
        <ViewerRow>
          <ViewerHeader>Tags</ViewerHeader>

          <TagListDropdown
            className='fsize-3 bor-1-gray adjacent-mar-t-2'
            placeholder='New Tag...'
            canSearch={true}
            onSelect={onSelectNewTag}
          />

          <div className='fsize-2 flex-row flexwrap-yes adjacent-mar-t-2'>
            { tagList.map((tagId, idx) => (
              <TagListEditorComponent
                key={`viewer-tag-item-${tagId}-${idx}-key`}
                selectedTagId={tagId}
                onClickRemove={() => { onClickRemoveTag(tagId) }}
                onEdit={(tagId) => {
                  onChangeTagData(tagId, idx);
                }}
              />
            ))}
          </div>
        </ViewerRow>
      </div>
    )
  }
};
/**
 * section in the menu
 */
const MenuRow = (props) => (
  <div
    className='adjacent-mar-t-3 width-full flex-col'
    {...props}
  />
)
/**
 * section in the viewer
 */
const ViewerRow = (props) => (
  <div
    className='flex-col adjacent-mar-t-2'
    {...props}
  />
)
/**
 * section in the viewer
 */
const ViewerHeader = (props) => (
  <h3
    className='fsize-3 f-bold color-grayest adjacent-mar-t-2'
  >
    { props.children }
  </h3>
)
/**
 * divider
 */
const ViewerDivider = (props) => (
  <div className='bor-b-1-secondary adjacent-mar-t-2'></div>
)
