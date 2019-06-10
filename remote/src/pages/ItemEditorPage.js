import React, { Component } from 'react';
import {NotificationManager} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

import ButtonComponent from 'common-components/ButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';
import TextAreaComponent from 'common-components/TextAreaComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ToggleComponent from 'common-components/ToggleComponent';

import ConditionListEditorComponent from 'components/ConditionListEditorComponent';
import ConditionLogicDropdown from 'components/ConditionLogicDropdown';
import {
  EditorActionbarContainer,
  EditorBodyContainer,
  EditorPageContainer,
  SectionFormContainer,
} from 'components/EditorComponents';
import ItemListDropdown from 'components/ItemListDropdown';
import TagListEditorComponent from 'components/TagListEditorComponent';
import TagListDropdown from 'components/TagListDropdown';
import TriggerListEditorComponent from 'components/TriggerListEditorComponent';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import keycodes from 'constants.shared/keycodes';
import {RARITY_TAG_ID_LIST} from 'constants.shared/tagIds';

import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import remoteAppState from 'state/remoteAppState';

import copyToClipboard from 'utilities/copyToClipboard';
import download from 'utilities/download';

import deepClone from 'utilities.shared/deepClone';
import l10n from 'utilities.shared/l10n';
import * as itemDataUtils from 'utilities.shared/itemDataUtils';
import * as genericDataUtils from 'utilities.shared/genericDataUtils';

/**
 * Item Editor page
 */
export default observer(
class ItemEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.setActiveData = this.setActiveData.bind(this);
    this.updateListFilters = this.updateListFilters.bind(this);

    this.updateActiveData = this.updateActiveData.bind(this);
    this.deleteActiveData = this.deleteActiveData.bind(this);

    this.createNew = this.createNew.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.canSave = this.canSave.bind(this);

    this.addAction = this.addAction.bind(this);
    this.addCondition = this.addCondition.bind(this);
    this.addTag = this.addTag.bind(this);
    this.addTrigger = this.addTrigger.bind(this);

    this.copyActiveDataToClipboard = this.copyActiveDataToClipboard.bind(this);
    this.copyDataListToClipboard = this.copyDataListToClipboard.bind(this);
    this.downloadDataList = this.downloadDataList.bind(this);

    this.state = {
      // -- Editor
      /** @type {ItemData} */
      activeData: deepClone(itemDataHelper.ITEM_DATA[0]),
      /** @type {Array<ItemData>} */
      dataList: itemDataHelper.ITEM_DATA,
      /** @type {Object} */
      dataListFilters: {},

      /** @type {Boolean} */
      hasChanges: false,
    }
  }
  /** @override */
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  /** @override */
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
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
      // hasChanges,
    } = this.state;

    const {
      id = '',
      isUseable = false,
      isConsumable = false,
      isKeyItem = false,
      name = '',
      description = '',
      tagList = [],
      triggerList = [],
      isGeneratable = false,
      rarityId = '',
      conditionList = [],
    } = activeData;

    const isNew = dataList.find(item => item.id === activeData.id) === undefined;

    return (
      <EditorPageContainer className='bg-item-theme-primary' header='Item Editor'>
        {/* Actionbar */}
        <EditorActionbarContainer>
          {/* Menu Row 1 */}
          <div className='flex-row aitems-center adjacent-mar-t-2'>
            <div className='flex-auto flex-row adjacent-mar-l-2'>
              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Create New (Shortcut: N)'
                onClick={this.createNew}
              >
                Create New
              </ButtonComponent>

              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Save (Shortcut: S)'
                disabled={!this.canSave()}
                onClick={this.saveData}
              >
                {`Save ${isNew ? 'New' : ''}`}
              </ButtonComponent>

              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Delete'
                disabled={isNew}
                onClick={this.deleteActiveData}
              >
                Delete
              </ButtonComponent>
            </div>

            {/* Export options */}
            <div className='flex-none flex-row adjacent-mar-l-2'>
              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Copy Current'
                onClick={this.copyActiveDataToClipboard}
              >
                Copy Current
              </ButtonComponent>

              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Copy All (Shortcut: C)'
                onClick={this.copyDataListToClipboard}
              >
                Copy All Data
              </ButtonComponent>

              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Download'
                onClick={this.downloadDataList}
              >
                Download
              </ButtonComponent>
            </div>
          </div>

          {/* Menu Row 2 */}
          <div className='flex-row aitems-center adjacent-mar-t-2'>
            <div className='flex-auto flex-col adjacent-mar-l-2'>
              <form className='flex-row adjacent-mar-t-1' name='form0' onSubmit={(evt) => evt.preventDefault()}>
                <LetterIconComponent
                  className='aself-center mar-r-2'
                  children='0'
                />

                <div className='flex-none mar-v-auto mar-r-2'>{`Items (${dataList.length})`}</div>

                {/* List of Items */}
                <ItemListDropdown
                  className='flex-auto fsize-4'
                  controlClassName='pad-2'
                  selectedOption={activeData}
                  onSelect={this.setActiveData}
                  canSearch
                />
              </form>
            </div>
          </div>
        </EditorActionbarContainer>

        {/** Body */}
        <EditorBodyContainer>
          {/* Main pane */}
          <div className='flex-col flex-none' style={{minWidth: '575px'}}>
            {/* Basic Info */}
            <SectionFormContainer header='Information' name='form1'
              showIcon
              iconOptions={{
                style: {left: '-40px', top: '0'},
                children: '1',
              }}
            >
              <TextInputComponent
                placeholder='Please enter a unique `id`'
                label='id'
                value={itemDataUtils.snipIdPrefix(id)}
                onChange={(evt) => this.updateActiveData({id: evt.target.value})}
              />

              <TextInputComponent
                placeholder='Name'
                label='name'
                value={name}
                onChange={(evt) => this.updateActiveData({name: evt.target.value})}
              />

              <TextAreaComponent
                className='resize-vertical adjacent-mar-t-2'
                style={{minHeight: '80px'}}
                placeholder='Description'
                label='description'
                value={description}
                onChange={(evt) => this.updateActiveData({description: evt.target.value})}
              />
            </SectionFormContainer>

            {/* Condition List */}
            <SectionFormContainer header='Use Conditions' name='form2'
              showIcon
              iconOptions={{
                style: {left: '-40px', top: '0'},
                children: '2',
              }}
            >
              <ConditionLogicDropdown
                className='flex-auto bor-1-gray adjacent-mar-t-2'
                placeholder='New Condition...'
                onSelect={(conditionLogicId) => this.addCondition({conditionLogicId})}
              />

              { conditionList.length > 0 &&
                <ConditionListEditorComponent
                  className='adjacent-mar-t-2'
                  itemClassName='bor-1-gray adjacent-mar-t-2'
                  dataList={conditionList}
                  onEdit={(updatedData) => this.updateActiveData({conditionList: updatedData})}
                />
              }
            </SectionFormContainer>

            {/* Trigger List */}
            <SectionFormContainer header='Triggers' name='form3'
              showIcon
              iconOptions={{
                style: {left: '-40px', top: '0'},
                children: '3',
              }}
            >
              <TriggerLogicListDropdown
                className='fsize-3 bor-1-gray adjacent-mar-t-2'
                placeholder='New Trigger...'
                canSearch={true}
                onSelect={(triggerLogicId) => this.addTrigger({triggerLogicId: triggerLogicId})}
              />

              { triggerList.length > 0 &&
                <TriggerListEditorComponent
                  className='fsize-3 adjacent-mar-t-2'
                  dataList={triggerList}
                  onEdit={(updatedData) => this.updateActiveData({triggerList: updatedData})}
                />
              }
            </SectionFormContainer>
          </div>

          {/* Side pane */}
          <div className='flex-col flex-none mar-l-1' style={{width: '150px'}}>
            {/* Modifiers */}
            <SectionFormContainer header='Modifiers' name='form5'
              showIcon
              iconOptions={{
                style: {right: '-40px', top: '0'},
                children: '5',
              }}
            >
              <ToggleComponent
                className='adjacent-mar-t-2'
                children='Useable'
                checked={isUseable}
                onChange={() => this.updateActiveData({isUseable: !isUseable})}
              />

              <ToggleComponent
                className='adjacent-mar-t-2'
                children='Consumable'
                checked={isConsumable}
                onChange={() => this.updateActiveData({isConsumable: !isConsumable})}
              />

              <ToggleComponent
                className='adjacent-mar-t-2'
                children='Key Item'
                checked={isKeyItem}
                onChange={() => this.updateActiveData({isKeyItem: !isKeyItem})}
              />
            </SectionFormContainer>

            {/* Generation */}
            <SectionFormContainer header='Generation' name='form6'
              showIcon
              iconOptions={{
                style: {right: '-40px', top: '0'},
                children: '6',
              }}
            >
              <ToggleComponent
                className='adjacent-mar-t-2'
                children='Generatable'
                checked={isGeneratable}
                onChange={() => this.updateActiveData({isGeneratable: !isGeneratable})}
              />

              { isGeneratable &&
                <div className='flex-col adjacent-mar-t-2'>
                  Rarity
                  <DropdownComponent
                    className='bor-1-gray'
                    selectedOption={{id: rarityId}}
                    options={RARITY_TAG_ID_LIST.map((item) => ({
                      data: item,
                      id: item,
                      label: l10n(item),
                    }))}
                    onSelect={(rarityId) => this.updateActiveData({rarityId: rarityId})}
                  />
                </div>
              }
            </SectionFormContainer>

            {/* Tag List */}
            <SectionFormContainer header='Tags' name='form7'
              showIcon
              iconOptions={{
                style: {right: '-40px', top: '0'},
                children: '7',
              }}
            >
              <TagListDropdown
                className='fsize-3 bor-1-gray adjacent-mar-t-2'
                placeholder='New Tag...'
                canSearch={true}
                onSelect={this.addTag}
              />

              { tagList.length > 0 &&
                <TagListEditorComponent
                  className='fsize-2 flex-col flexwrap-yes adjacent-mar-t-2'
                  itemClassName='adjacent-mar-t-1'
                  dataList={tagList}
                  onEdit={(updatedData) => this.updateActiveData({tagList: updatedData})}
                />
              }
            </SectionFormContainer>
          </div>
        </EditorBodyContainer>
      </EditorPageContainer>
    );
  }
  /**
   * @param {Event} evt
   */
  handleKeyDown(evt) {
    // EXPERIMENTAL - stop focusing element
    if (evt.keyCode === keycodes.escape) {
      document.activeElement.blur();
    }

    // don't use the hotkeys if trying to type
    if (evt.srcElement.type === 'text' || evt.srcElement.type === 'textarea' || evt.srcElement.type === 'number') {
      return;
    }

    // create new shortcut
    if (evt.keyCode === keycodes.n) {
      this.createNew();
    }

    // save shortcut
    if (evt.keyCode === keycodes.s) {
      this.saveData();
    }

    // copy all shortcut
    if (evt.keyCode === keycodes.c) {
      this.copyDataListToClipboard();
    }

    // preview item
    if (evt.keyCode === keycodes.p) {
      this.togglePreviewModal();
    }

    // EXPERIMENTAL - Form shorcuts
    //  focus the first input in a form, preventDefault stops it from typing the number
    if (evt.keyCode === keycodes[0]) {
      document.form0.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[1]) {
      document.form1.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[2]) {
      document.form2.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[3]) {
      document.form3.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[4]) {
      // document.form4.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[5]) {
      document.form5.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[6]) {
      document.form6.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
    if (evt.keyCode === keycodes[7]) {
      document.form7.getElementsByTagName('input')[0].focus();
      evt.preventDefault();
    }
  }
  /**
   * set the active Item to one in the list
   *
   * @param {Object} itemData
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
   * @param {Object} newData
   */
  updateListFilters(newData) {
    // for now, we'll interpret null as clearing out filters
    if (newData === null) {
      this.setState({dataListFilters: {}});
      return;
    };

    this.setState({dataListFilters: {
      ...this.state.dataListFilters,
      ...newData,
    }});
  }
  /**
   * the ActiveItem data has changed
   *
   * @param {Object} newData
   */
  updateActiveData(newData) {
    const { activeData } = this.state;

    // this creates the formatted data
    const resultData = itemDataUtils.updateItemData(activeData, newData);

    // update state
    this.setState({
      activeData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * deletes the currently viewed Item
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

    // find if activeItem is in list
    const matchingItemIdx = dataList.findIndex((item) => (item.id === itemData.id));
    if (matchingItemIdx <= -1) {
      return;
    }

    NotificationManager.info(`Deleted "${itemData.name}"`);

    // remove it from the list
    dataList.splice(matchingItemIdx, 1);

    // if there are no other items, create a new one
    if (dataList.length <= 0) {
      this.createNew();
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
   * saves all the changes from the current `activeData`
   *  to the
   */
  saveData() {
    const {
      activeData,
      dataList,
    } = this.state;

    // no need to save if we did not indicate there are changes made
    if (!this.canSave()) {
      return;
    }

    NotificationManager.info(`Saved "${activeData.name}"`);

    // find if activeItem is in list
    const matchingItemIdx = dataList.findIndex((item) => (item.id === activeData.id));

    // if not, add it to the `dataList``
    if (matchingItemIdx <= -1) {
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
    dataList[matchingItemIdx] = activeData;
    this.setState({
      activeData: deepClone(activeData),
      dataList: dataList,
      hasChanges: false,
    }, () => {
      this.copyDataListToClipboard();
    });
  }
  /**
   * @returns {Boolean}
   */
  canSave() {
    const {activeData, hasChanges} = this.state;
    return hasChanges && activeData.id !== 'ITEM_ID.NEW' && activeData.id !== '';
  }
  /**
   * set `activeItem` to a blank template
   */
  createNew() {
    if (this.state.hasChanges) {
      this.saveData();
    }

    this.setState({
      activeData: deepClone(itemDataUtils.createItemData()),
      hasChanges: true,
    });
  }
  /**
   * adds a new Action to the active Item
   *
   * @param {Object} [defaultData]
   */
  addAction(defaultData = {}) {
    const { activeData } = this.state;

    // create it
    const newAction = genericDataUtils.createActionData(defaultData);

    // add it
    const resultData = genericDataUtils.addActionToData(activeData, newAction);

    // update state
    this.setState({
      activeData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Condition to the active Data
   *
   * @param {Object} [defaultData]
   */
  addCondition(defaultData = {}) {
    const { activeData } = this.state;

    // create it
    const newCondition = genericDataUtils.createConditionData(defaultData);

    // add it
    const resultData = genericDataUtils.addConditionToData(activeData, newCondition);

    // update state
    this.setState({
      activeData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * adds a Tag to the active Item
   *
   * @param {String} tagId
   */
  addTag(tagId) {
    const { activeData } = this.state;

    // create array if it does not exist
    if (activeData.tagList === undefined) {
      activeData.tagList = [];
    }

    // check if it already already has the tag
    if (activeData.tagList.includes(tagId)) {
      return;
    }

    // add it
    activeData.tagList.push(tagId);

    // update the data
    this.setState({
      activeData: deepClone(activeData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Trigger to the active Item
   *
   * @param {Object} [defaultData]
   */
  addTrigger(defaultData = {}) {
    const { activeData } = this.state;

    // create it
    const newTrigger = genericDataUtils.createTriggerData(defaultData);

    // add it
    const resultData = genericDataUtils.addTriggerToData(activeData, newTrigger);

    // update state
    this.setState({
      activeData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * copies a json of the `activeItem` to clipboard
   */
  copyActiveDataToClipboard() {
    const { activeData } = this.state;
    const cleanData = itemDataUtils.formatItemData(activeData);
    NotificationManager.info('Copied Current Data', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanData));
  }
  /**
   * copies a json of the `dataList` to clipboard
   *  triggered after pressing "save" so work isn't lost if we forget to export
   */
  copyDataListToClipboard() {
    const { dataList } = this.state;
    const cleanList = itemDataUtils.formatItemList(dataList);
    NotificationManager.info('Copied All Data', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanList));
  }
  /**
   * downloads a `itemData.json` file
   */
  downloadDataList() {
    const { dataList } = this.state;
    const cleanList = itemDataUtils.formatItemList(dataList);
    NotificationManager.info('Downloading', undefined, 1000);
    download(JSON.stringify(cleanList), 'itemData.json', 'application/json');
  }
})
