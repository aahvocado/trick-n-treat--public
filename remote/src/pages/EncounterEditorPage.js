import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

import {faTimes} from '@fortawesome/free-solid-svg-icons';

import ButtonComponent, {BUTTON_THEME} from 'common-components/ButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';
import RadioButtonComponent from 'common-components/RadioButtonComponent';
import TextAreaComponent from 'common-components/TextAreaComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ToggleComponent from 'common-components/ToggleComponent';

import ActionListDropdown from 'components/ActionListDropdown';
import ActionListEditorComponent from 'components/ActionListEditorComponent';
import ConditionListEditorComponent from 'components/ConditionListEditorComponent';
import EncounterModalComponent from 'components/EncounterModalComponent';
import {
  EditorActionbarContainer,
  EditorBodyContainer,
  EditorPageContainer,
  SectionFormContainer,
} from 'components/EditorComponents';
import TagListEditorComponent from 'components/TagListEditorComponent';
import TagListDropdown from 'components/TagListDropdown';
import TargetListDropdown from 'components/TargetListDropdown';
import TileListDropdown from 'components/TileListDropdown';
import TriggerListEditorComponent from 'components/TriggerListEditorComponent';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import {
  DATA_TYPE,
  PRIMARY_DATA_TYPE_LIST,
} from 'constants.shared/dataTypes';
import keycodes from 'constants.shared/keycodes';
import {RARITY_TAG_ID_LIST} from 'constants.shared/tagIds';

import {ALL_ENCOUNTER_DATA_LIST, GROUPINGS_ID_LIST} from 'helpers.shared/encounterDataHelper';

import remoteAppState from 'state/remoteAppState';

import copyToClipboard from 'utilities/copyToClipboard';
import download from 'utilities/download';

import deepClone from 'utilities.shared/deepClone';
import l10n from 'utilities.shared/l10n';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';
import * as genericDataUtils from 'utilities.shared/genericDataUtils';

/**
 * Encounter Editor page, this should handle all the state and data
 */
export default observer(
class EncounterEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.togglePreviewModal = this.togglePreviewModal.bind(this);

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
      /** @type {EncounterData} */
      activeData: deepClone(ALL_ENCOUNTER_DATA_LIST[0]),
      /** @type {Array<EncounterData>} */
      dataList: ALL_ENCOUNTER_DATA_LIST,
      /** @type {Object} */
      dataListFilters: {},

      /** @type {Boolean} */
      hasChanges: false,
      /** @type {Boolean} */
      showPreview: false,
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
      dataListFilters,
      // hasChanges,
      showPreview,
    } = this.state;

    const {
      id = '',
      groupId = '',
      title = '',
      content = '',
      dataType = '',
      isGeneratable = false,
      isGeneratableOnce = false,
      rarityId = '',
      isDialogue = false,
      actionList = [],
      conditionList = [],
      tagList = [],
      triggerList = [],
    } = activeData;

    // are we currently viewing a new encounter
    const isNewEncounter = dataList.find(encounter => encounter.id === activeData.id) === undefined;

    // change list based on filters
    const hasFilters = JSON.stringify(dataListFilters) !== "{}";
    const filteredEncounterList = !hasFilters ? dataList : encounterDataUtils.filterEncounterList(dataList, dataListFilters);

    return (
      <EditorPageContainer className='bg-encounter-theme-primary' header='Encounter Editor'>
        {/* Encounter Preview Modal */}
        <EncounterModalComponent
          active={showPreview}
          onClickOverlay={this.togglePreviewModal}
          encounterData={activeData}
        />

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
                onClick={this.saveData}
                disabled={!this.canSave()}
              >
                {`Save ${isNewEncounter ? 'New' : ''}`}
              </ButtonComponent>

              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Delete'
                onClick={this.deleteActiveData}
                disabled={isNewEncounter}
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
              {/* Filters */}
              <div className='flex-auto flex-row fsize-3 adjacent-mar-t-1'>
                {/* Grouping filter */}
                <DropdownComponent
                  className='flex-none'
                  inputSize={15}
                  placeholder='Filter by Type...'
                  selectedOption={{id: dataListFilters.dataType}}
                  options={PRIMARY_DATA_TYPE_LIST.map((item) => ({
                    data: item,
                    id: item,
                    label: l10n(item),
                  }))}
                  onSelect={(dataType) => this.updateListFilters({dataType: dataType})}
                />
                <IconButtonComponent
                  className='bor-r-1-gray bg-white'
                  icon={faTimes}
                  onClick={() => this.updateListFilters({dataType: undefined})}
                />

                {/* Grouping filter */}
                <DropdownComponent
                  className='flex-auto'
                  placeholder='Filter by Grouping...'
                  selectedOption={{id: dataListFilters.groupId}}
                  options={GROUPINGS_ID_LIST.map((item) => ({
                    data: item,
                    id: item,
                    label: item,
                  }))}
                  onSelect={(groupId) => this.updateListFilters({groupId: groupId})}
                />
                <IconButtonComponent
                  className='bor-r-1-gray bg-white'
                  icon={faTimes}
                  onClick={() => this.updateListFilters({groupId: undefined})}
                />

                {/* Tag filter*/}
                <TagListDropdown
                  className='flex-none'
                  inputSize={15}
                  placeholder='Filter by Tags...'
                  selectedOption={{id: dataListFilters.includeTags && dataListFilters.includeTags[0]}}
                  onSelect={(tagId) => this.updateListFilters({includeTags: [tagId]})}
                />
                <IconButtonComponent
                  className='bor-r-1-gray bg-white'
                  icon={faTimes}
                  onClick={() => this.updateListFilters({includeTags: undefined})}
                />

                <ButtonComponent
                  className='flex-none pad-v-1 pad-h-2'
                  style={{height: 'auto'}}
                  theme={BUTTON_THEME.WHITE}
                  onClick={() => this.updateListFilters(null)}
                >
                  Clear filters
                </ButtonComponent>
              </div>

              <form className='flex-row adjacent-mar-t-1' name='form0' onSubmit={(evt) => evt.preventDefault()}>
                <LetterIconComponent
                  className='aself-center mar-r-2'
                  children='0'
                />

                <div className='flex-none mar-v-auto mar-r-2'>{`Encounters (${filteredEncounterList.length})`}</div>

                {/* Filtered Encounters */}
                <DropdownComponent
                  className='flex-auto fsize-4'
                  controlClassName='pad-2'
                  selectedOption={activeData}
                  options={filteredEncounterList.map((item) => ({
                    data: item,
                    id: item.id,
                    label: item.title,
                  }))}
                  onSelect={this.setActiveData}
                />
              </form>
            </div>

            <div className='flex-none flex-row aself-start adjacent-mar-l-2'>
              <ButtonComponent
                className='adjacent-mar-l-2'
                title='Preview Encounter (Shortcut: P)'
                onClick={this.togglePreviewModal}
              >
                Preview Encounter
              </ButtonComponent>
            </div>
          </div>
        </EditorActionbarContainer>

        {/* Body */}
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
                value={encounterDataUtils.snipIdPrefix(id)}
                onChange={(evt) => this.updateActiveData({id: evt.target.value})}
              />

              <TextInputComponent
                placeholder='Grouping name (optional)'
                label='groupId'
                value={groupId || ''}
                onChange={(evt) => this.updateActiveData({groupId: evt.target.value})}
              />

              <TextInputComponent
                placeholder='Title of the encounter'
                label='title'
                value={title}
                onChange={(evt) => this.updateActiveData({title: evt.target.value})}
              />

              <TextAreaComponent
                className='resize-vertical adjacent-mar-t-2'
                style={{minHeight: '80px'}}
                placeholder='Content to display'
                label='content'
                value={content}
                onChange={(evt) => this.updateActiveData({content: evt.target.value})}
              />
            </SectionFormContainer>

            {/* Condition List */}
            <SectionFormContainer header='Conditions' name='form2'
              showIcon
              iconOptions={{
                style: {left: '-40px', top: '0'},
                children: '2',
              }}
            >
              <TargetListDropdown
                className='flex-auto bor-1-gray adjacent-mar-t-2'
                placeholder='New Condition...'
                onSelect={(targetId) => this.addCondition({targetId: targetId})}
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

            {/* Action List */}
            <SectionFormContainer header='Actions' name='form4'
              showIcon
              iconOptions={{
                style: {left: '-40px', top: '0'},
                children: '4',
              }}
            >
              <ActionListDropdown
                className='fsize-3 bor-1-gray adjacent-mar-t-2'
                placeholder='New Action...'
                onSelect={(choiceId) => this.addAction({choiceId: choiceId})}
              />

              { actionList.length > 0 &&
                <ActionListEditorComponent
                  className='adjacent-mar-t-2'
                  dataList={actionList}
                  onEdit={(updatedData) => this.updateActiveData({actionList: updatedData})}
                />
              }
            </SectionFormContainer>
          </div>

          {/* Side pane */}
          <div className='flex-col flex-none mar-l-1' style={{width: '150px'}}>
            {/* Additional options */}
            <SectionFormContainer header='Type' name='form5'
              showIcon
              iconOptions={{
                style: {right: '-40px', top: '0'},
                children: '5',
              }}
            >
              <RadioButtonComponent
                className='adjacent-mar-t-2'
                children={'Encounter'}
                checked={dataType === DATA_TYPE.ENCOUNTER}
                onChange={() => this.updateActiveData({dataType: DATA_TYPE.ENCOUNTER})}
              />

              <RadioButtonComponent
                className='adjacent-mar-t-2'
                children={'House'}
                checked={dataType === DATA_TYPE.HOUSE}
                onChange={() => this.updateActiveData({dataType: DATA_TYPE.HOUSE})}
              />

              <ToggleComponent
                className='adjacent-mar-t-2'
                children='Dialogue'
                checked={isDialogue}
                onChange={() => this.updateActiveData({isDialogue: !isDialogue})}
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
                <ToggleComponent
                  className='adjacent-mar-t-2'
                  children='Only Once'
                  checked={isGeneratableOnce}
                  onChange={() => this.updateActiveData({isGeneratableOnce: !isGeneratableOnce})}
                />
              }

              { isGeneratable &&
                <React.Fragment>
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

                  <div className='flex-col adjacent-mar-t-2'>
                    Tiles
                    <TileListDropdown
                      className='bor-1-gray'
                      // onSelect={(rarityId) => this.updateActiveData({rarityId: rarityId})}
                    />
                  </div>
                </React.Fragment>
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

    // preview encounter
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
      document.form4.getElementsByTagName('input')[0].focus();
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
   * toggles visibility of the EncounterModal to preview the `activeData`
   *
   * @param {Boolean} [shouldShow]
   */
  togglePreviewModal(shouldShow) {
    if (shouldShow !== undefined) {
      this.setState({showPreview: shouldShow});
      return;
    }

    this.setState({showPreview: !this.state.showPreview});
  }
  /**
   * set the active Encounter to one in the list
   *
   * @param {Object} encounterData
   */
  setActiveData(encounterData) {
    const { dataList } = this.state;

    const matchingEncounter = dataList.find((encounter) => (encounter.id === encounterData.id));
    if (matchingEncounter === undefined) {
      return;
    }

    // set the `activeData` to a clone
    this.setState({
      activeData: deepClone(matchingEncounter),
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
   * the ActiveEncounter data has changed
   *
   * @param {Object} newData
   */
  updateActiveData(newData) {
    const { activeData } = this.state;

    // this creates the formatted data
    const resultData = encounterDataUtils.updateEncounterData(activeData, newData);

    // update state
    this.setState({
      activeData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * deletes the currently viewed Encounter
   */
  deleteActiveData() {
    const {activeData} = this.state;
    this.deleteData(activeData);
  }
  /**
   * removes the `activeData` from the List
   *
   * @param {EncounterData} encounterData
   */
  deleteData(encounterData) {
    const {
      dataList,
    } = this.state;

    // find if activeEncounter is in list
    const matchingEncounterIdx = dataList.findIndex((encounter) => (encounter.id === encounterData.id));
    if (matchingEncounterIdx <= -1) {
      return;
    }

    NotificationManager.info(`Deleted "${encounterData.title}"`);

    // remove it from the list
    dataList.splice(matchingEncounterIdx, 1);

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

    NotificationManager.info(`Saved "${activeData.title}"`);

    // find if activeEncounter is in list
    const matchingEncounterIdx = dataList.findIndex((encounter) => (encounter.id === activeData.id));

    // if not, add it to the `dataList``
    if (matchingEncounterIdx <= -1) {
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
    dataList[matchingEncounterIdx] = activeData;
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
    return hasChanges && activeData.id !== 'ENCOUNTER_ID.NEW' && activeData.id !== '';
  }
  /**
   * set `activeEncounter` to a blank template
   */
  createNew() {
    if (this.state.hasChanges) {
      this.saveData();
    }

    this.setState({
      activeData: deepClone(encounterDataUtils.createEncounterData()),
      hasChanges: true,
    });
  }
  /**
   * adds a new Action to the active Encounter
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
   * adds a Tag to the active Encounter
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
   * adds a new Trigger to the active Encounter
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
   * copies a json of the `activeEncounter` to clipboard
   */
  copyActiveDataToClipboard() {
    const { activeData } = this.state;
    const cleanData = encounterDataUtils.formatEncounterData(activeData);
    NotificationManager.info('Copied Current Data', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanData));
  }
  /**
   * copies a json of the `dataList` to clipboard
   *  triggered after pressing "save" so work isn't lost if we forget to export
   */
  copyDataListToClipboard() {
    const { dataList } = this.state;
    const cleanList = encounterDataUtils.formatEncounterList(dataList);
    NotificationManager.info('Copied All Data', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanList));
  }
  /**
   * downloads a `encounterData.json` file
   */
  downloadDataList() {
    const { dataList } = this.state;
    const cleanList = encounterDataUtils.formatEncounterList(dataList);
    NotificationManager.info('Downloading', undefined, 1000);
    download(JSON.stringify(cleanList), 'encounterData.json', 'application/json');
  }
});
