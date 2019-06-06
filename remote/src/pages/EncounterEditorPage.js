import React, { Component } from 'react';
import {NotificationManager} from 'react-notifications';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

// import {faBan} from '@fortawesome/free-solid-svg-icons'

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
// import IconButtonComponent from 'common-components/IconButtonComponent';
import ModalComponent from 'common-components/ModalComponent';
import TextAreaComponent from 'common-components/TextAreaComponent';
import TextInputComponent from 'common-components/TextInputComponent';

import ActionListDropdown from 'components/ActionListDropdown';
import ActionListEditorComponent from 'components/ActionListEditorComponent';
import ConditionListEditorComponent from 'components/ConditionListEditorComponent';
import ConditionLogicDropdown from 'components/ConditionLogicDropdown';
import EncounterModalComponent from 'components/EncounterModalComponent';
import TagListEditorComponent from 'components/TagListEditorComponent';
import TagListDropdown from 'components/TagListDropdown';
import TriggerListEditorComponent from 'components/TriggerListEditorComponent';
import TriggerLogicListDropdown from 'components/TriggerLogicListDropdown';

import {
  ENCOUNTER_DATA,
  createEncounterGroupingMap,
} from 'helpers.shared/encounterDataHelper';

import remoteAppState from 'state/remoteAppState';

import combineClassNames from 'utilities/combineClassNames';
import copyToClipboard from 'utilities/copyToClipboard';
import download from 'utilities/download';

import deepClone from 'utilities.shared/deepClone';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

/**
 * Encounter Editor page, this should handle all the state and data
 */
export default observer(
class EncounterEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.setActiveEncounter = this.setActiveEncounter.bind(this);
    this.setSelectedGroupId = this.setSelectedGroupId.bind(this);

    this.onClickModalOverlay = this.onClickModalOverlay.bind(this);
    this.togglePreviewModal = this.togglePreviewModal.bind(this);

    this.createNew = this.createNew.bind(this);
    this.onChangeEncounterData = this.onChangeEncounterData.bind(this);
    this.deleteActiveEncounter = this.deleteActiveEncounter.bind(this);
    this.deleteEncounter = this.deleteEncounter.bind(this);
    this.saveEncounter = this.saveEncounter.bind(this);

    this.addAction = this.addAction.bind(this);
    this.addCondition = this.addCondition.bind(this);
    this.addTag = this.addTag.bind(this);
    this.addTrigger = this.addTrigger.bind(this);

    this.copyActiveEncounterToClipboard = this.copyActiveEncounterToClipboard.bind(this);
    this.copyEncounterListToClipboard = this.copyEncounterListToClipboard.bind(this);
    this.downloadEncounterData = this.downloadEncounterData.bind(this);

    this.state = {
      // -- Editor
      /** @type {EncounterData} */
      activeEncounterData: deepClone(ENCOUNTER_DATA[0]),
      /** @type {Array<EncounterData>} */
      encounterList: ENCOUNTER_DATA,
      /** @type {GroupId} */
      selectedGroupId: undefined,

      /** @type {Boolean} */
      hasChanges: false,
      /** @type {Boolean} */
      showModal: false,
      /** @type {Boolean} */
      showPreview: false,
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
      activeEncounterData,
      encounterList,
      selectedGroupId,
      hasChanges,
      showModal,
      showPreview,
    } = this.state;

    return (
      <div
        className='flex-center flex-col color-white bg-primary fontfamily-secondary'
      >
        {/* Modal */}
        <ModalComponent
          className='flex-col-center color-black bg-white pad-2 mar-v-5'
          style={{
            width: '500px',
            height: '500px',
          }}
          active={showModal}
          onClickOverlay={this.onClickModalOverlay}
        >
          nothing here yet
        </ModalComponent>

        {/* Encounter Preview Modal */}
        <EncounterModalComponent
          active={showPreview}
          onClickOverlay={this.togglePreviewModal}
          encounterData={activeEncounterData}
        />

        <h2 className='bg-secondary fsize-4 pad-v-1 width-full talign-center'>
          Encounter Editor
        </h2>

        <div className='flex-col height-full bg-primary-darker'>
          {/* Menu */}
          <EncounterEditorMenu
            activeEncounterData={activeEncounterData}
            encounterList={encounterList}
            selectedGroupId={selectedGroupId}
            hasChanges={hasChanges}

            onClickTogglePreviewModal={this.togglePreviewModal}

            onClickCreateNew={this.createNew}
            onClickDelete={this.deleteActiveEncounter}
            onClickSave={this.saveEncounter}

            onSelectEncounterGroup={this.setSelectedGroupId}
            onSelectMenuEncounter={this.setActiveEncounter}

            onClickCopyCurrentData={this.copyActiveEncounterToClipboard}
            onClickCopyAllData={this.copyEncounterListToClipboard}
            onClickDownload={this.downloadEncounterData}
          />

          {/* Viewer */}
          <EncounterEditorViewer
            activeEncounterData={activeEncounterData}
            onChangeData={this.onChangeEncounterData}

            onSelectNewAction={this.addAction}
            onSelectNewCondition={this.addCondition}
            onSelectNewTrigger={this.addTrigger}
            onSelectNewTag={this.addTag}
          />
        </div>
      </div>
    );
  }
  /**
   * toggles visibility of the EncounterModal to preview the `activeEncounterData`
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
   * saves all the changes from the current `activeEncounterData`
   *  to the
   */
  saveEncounter() {
    const {
      encounterList,
      activeEncounterData,
    } = this.state;

    // find if activeEncounter is in list
    const matchingEncounterIdx = encounterList.findIndex((encounter) => (encounter.id === activeEncounterData.id));

    // if not, add it to the `encounterList``
    if (matchingEncounterIdx <= -1) {
      encounterList.push(activeEncounterData);
      this.setState({
        activeEncounterData: deepClone(activeEncounterData),
        encounterList: encounterList,
        hasChanges: false,
      }, () => {
        this.copyEncounterListToClipboard();
      });
      return;
    }

    // replace data currently at the
    encounterList[matchingEncounterIdx] = activeEncounterData;
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      encounterList: encounterList,
      hasChanges: false,
    }, () => {
      this.copyEncounterListToClipboard();
    });
  }
  /**
   * removes the `activeEncounterData` from the List
   *
   * @param {EncounterData} encounterData
   */
  deleteEncounter(encounterData) {
    const {
      encounterList,
    } = this.state;

    // find if activeEncounter is in list
    const matchingEncounterIdx = encounterList.findIndex((encounter) => (encounter.id === encounterData.id));
    if (matchingEncounterIdx <= -1) {
      return;
    }

    // remove it from the list
    encounterList.splice(matchingEncounterIdx, 1);

    // if there are no other items, create a new one
    if (encounterList.length <= 0) {
      this.onClickCreateNewHandler();
      this.setState({encounterList: []});
      return;
    }

    // setState to the first item in the list
    this.setState({
      activeEncounterData: deepClone(encounterList[0]),
      encounterList: encounterList,
      hasChanges: false,
    });
  }
  /**
   * copies a json of the `activeEncounter` to clipboard
   */
  copyActiveEncounterToClipboard() {
    const { activeEncounterData } = this.state;
    const cleanData = encounterDataUtils.formatEncounterData(activeEncounterData);
    NotificationManager.info('Copied', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanData));
  }
  /**
   * copies a json of the `encounterList` to clipboard
   *  triggered after pressing "save" so work isn't lost if we forget to export
   */
  copyEncounterListToClipboard() {
    const { encounterList } = this.state;
    const cleanList = encounterDataUtils.formatEncounterList(encounterList);
    NotificationManager.info('Copied', undefined, 1000);
    copyToClipboard(JSON.stringify(cleanList));
  }
  /**
   * downloads a `encounterData.json` file
   */
  downloadEncounterData() {
    const { encounterList } = this.state;
    const cleanList = encounterDataUtils.formatEncounterList(encounterList);
    NotificationManager.info('Downloading', undefined, 1000);
    download(JSON.stringify(cleanList), 'encounterData.json', 'application/json');
  }
  /**
   * set `activeEncounter` to a blank template
   */
  createNew() {
    this.setState({
      activeEncounterData: deepClone(encounterDataUtils.createEncounterData()),
      hasChanges: true,
    });
  }
  /**
   * the ActiveEncounter data has changed
   *
   * @param {Object} newData
   */
  onChangeEncounterData(newData) {
    const { activeEncounterData } = this.state;

    // this creates the formatted data
    const resultData = encounterDataUtils.updateEncounterData(activeEncounterData, newData);

    // update state
    this.setState({
      activeEncounterData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Action to the active Encounter
   *
   * @param {Object} [defaultData]
   */
  addAction(defaultData = {}) {
    const { activeEncounterData } = this.state;

    // create it
    const newAction = encounterDataUtils.createActionData(defaultData);

    // add it
    const resultData = encounterDataUtils.addActionToData(activeEncounterData, newAction);

    // update state
    this.setState({
      activeEncounterData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Condition to the active Data
   *
   * @param {Object} [defaultData]
   */
  addCondition(defaultData = {}) {
    const { activeEncounterData } = this.state;

    // create it
    const newCondition = encounterDataUtils.createConditionData(defaultData);

    // add it
    const resultData = encounterDataUtils.addConditionToData(activeEncounterData, newCondition);

    // update state
    this.setState({
      activeEncounterData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * adds a Tag to the active Encounter
   *
   * @param {String} tagId
   */
  addTag(tagId) {
    const { activeEncounterData } = this.state;

    // create array if it does not exist
    if (activeEncounterData.tagList === undefined) {
      activeEncounterData.tagList = [];
    }

    // check if it already already has the tag
    if (activeEncounterData.tagList.includes(tagId)) {
      return;
    }

    // add it
    activeEncounterData.tagList.push(tagId);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Trigger to the active Encounter
   *
   * @param {Object} [defaultData]
   */
  addTrigger(defaultData = {}) {
    const { activeEncounterData } = this.state;

    // create it
    const newTrigger = encounterDataUtils.createTriggerData(defaultData);

    // add it
    const resultData = encounterDataUtils.addTriggerToEncounter(activeEncounterData, newTrigger);

    // update state
    this.setState({
      activeEncounterData: deepClone(resultData),
      hasChanges: true,
    });
  }
  /**
   * set the active Encounter to one in the list
   *
   * @param {Object} encounterData
   */
  setActiveEncounter(encounterData) {
    const { encounterList } = this.state;

    const matchingEncounter = encounterList.find((encounter) => (encounter.id === encounterData.id));
    if (matchingEncounter === undefined) {
      return;
    }

    // set the `activeEncounterData` to a clone
    this.setState({
      activeEncounterData: deepClone(matchingEncounter),
      hasChanges: false,
    });
  }
  /**
   * @param {GroupId} groupId
   */
  setSelectedGroupId(groupId) {
    this.setState({selectedGroupId: groupId});
  }
  /**
   * deletes the currently viewed Encounter
   */
  deleteActiveEncounter() {
    const {activeEncounterData} = this.state;
    this.deleteEncounter(activeEncounterData);
  }
  /**
   * clicked <ModalComponent /> overlay
   */
  onClickModalOverlay() {
    this.setState({showModal: false});
  }
});
/**
 * Menu
 */
class EncounterEditorMenu extends Component {
  /** @override */
  render() {
    const {
      activeEncounterData,
      encounterList,
      selectedGroupId,
      hasChanges,
      onClickTogglePreviewModal,

      onClickCreateNew,
      onClickDelete,
      onClickSave,

      onSelectEncounterGroup,
      onSelectMenuEncounter,

      onClickCopyAllData,
      onClickCopyCurrentData,
      onClickDownload,
    } = this.props;

    const isNewEncounter = encounterList.find(encounter => encounter.id === activeEncounterData.id) === undefined;

    // create the List of Groups
    const groupedEncounterData = createEncounterGroupingMap(encounterList);
    const encounterDataIdList = Object.keys(groupedEncounterData);

    // see if we need to show only the Encounters that belong in the Group
    const isFilteringByGroups = selectedGroupId !== undefined;
    const filteredEncounterList = encounterList.filter((encounterData) => (encounterData.groupId === selectedGroupId));

    return (
      <div
        className='flex-col color-white bg-primary pad-2'
      >
        {/* Menu Row 1 */}
        <div className='flex-row aitems-center adjacent-mar-t-2'>
          <MenuSection className='flex-auto'>
            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickCreateNew}
            >
              Create New
            </ButtonComponent>

            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickSave}
              disabled={!hasChanges || activeEncounterData.id === 'ENCOUNTER_ID.NEW' || activeEncounterData.id === ''}
            >
              {`Save ${isNewEncounter ? 'New' : ''}`}
            </ButtonComponent>

            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickDelete}
              disabled={isNewEncounter}
            >
              Delete
            </ButtonComponent>
          </MenuSection>

          {/* Export options */}
          <MenuSection className='flex-none'>
            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickCopyCurrentData}
            >
              Copy Current Data
            </ButtonComponent>

            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickCopyAllData}
            >
              Copy All Data
            </ButtonComponent>

            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickDownload}
            >
              Download encounterData.json
            </ButtonComponent>
          </MenuSection>
        </div>

        {/* Menu Row 2 */}
        <div className='flex-row aitems-center adjacent-mar-t-2'>
          <MenuSection className='aitems-center flex-auto'>
            <h3 className='talign-center adjacent-mar-l-2'>{`Encounters (${encounterList.length})`}</h3>

            <div className='flex-auto adjacent-mar-l-2 flex-col'>
              {/* List of Groups */}
              <div className='flex-auto fsize-3 flex-row adjacent-mar-t-1'>
                <DropdownComponent
                  className='flex-auto adjacent-mar-t-1'
                  placeholder='Select Grouping...'
                  selectedOption={{id: selectedGroupId}}
                  options={encounterDataIdList.map((item) => ({
                    data: item,
                    id: item,
                    label: item,
                  }))}
                  onSelect={onSelectEncounterGroup}
                  showButton={false}
                  canSearch
                />

                <ButtonComponent
                  className='flex-none pad-v-1 pad-h-2 bor-1-gray'
                  style={{height: 'auto'}}
                  theme={BUTTON_THEME.WHITE}
                  onClick={() => { onSelectEncounterGroup(undefined) }}
                >
                  View All Encounters
                </ButtonComponent>
              </div>

              {/* Filtered Encounters */}
              { isFilteringByGroups &&
                <DropdownComponent
                  className='flex-auto fsize-4 adjacent-mar-t-1'
                  controlClassName='pad-2'
                  selectedOption={activeEncounterData}
                  options={filteredEncounterList.map((item) => ({
                    data: item,
                    id: item.id,
                    label: item.title,
                  }))}
                  onSelect={onSelectMenuEncounter}
                  canSearch
                />
              }

              {/* All Encounters */}
              { !isFilteringByGroups &&
                <DropdownComponent
                  className='flex-auto fsize-4 adjacent-mar-t-1'
                  controlClassName='pad-2'
                  selectedOption={activeEncounterData}
                  options={encounterList.map((item) => ({
                    data: item,
                    id: item.id,
                    label: item.title,
                  }))}
                  onSelect={onSelectMenuEncounter}
                  canSearch
                />
              }
            </div>
          </MenuSection>

          <MenuSection className='flex-none'>
            <ButtonComponent
              className='adjacent-mar-l-2'
              onClick={onClickTogglePreviewModal}
            >
              Preview Encounter
            </ButtonComponent>
          </MenuSection>
        </div>
      </div>
    );
  }
};
/**
 *
 */
class EncounterEditorViewer extends Component {
  render() {
    const {
      activeEncounterData,
      onChangeData,

      onSelectNewAction,
      onSelectNewCondition,
      onSelectNewTag,
      onSelectNewTrigger,
    } = this.props;

    const {
      id,
      groupId,
      title,
      content,
      actionList = [],
      conditionList = [],
      tagList = [],
      triggerList = [],
    } = activeEncounterData;

    return (
      <div
        className='mar-h-auto mar-v-2 flex-row fsize-3 color-black'
      >
        {/* Main pane */}
        <div className='flex-col flex-none'
          style={{minWidth: '575px'}}
        >
          {/* Basic Info */}
          <ViewerContainer className='adjacent-mar-t-1'>
            <ViewerHeader>Information</ViewerHeader>

            <TextInputComponent
              placeholder='Please enter a unique `id`'
              label='id'
              value={encounterDataUtils.snipIdPrefix(id)}
              onChange={(e) => { onChangeData({id: e.target.value}) }}
            />

            <TextInputComponent
              placeholder='Name of grouping (optional)'
              label='groupId'
              value={groupId || ''}
              onChange={(e) => { onChangeData({groupId: e.target.value}) }}
            />

            <TextInputComponent
              placeholder='Title of the encounter'
              label='title'
              value={title}
              onChange={(e) => { onChangeData({title: e.target.value}) }}
            />

            <TextAreaComponent
              className='resize-vertical adjacent-mar-t-2'
              style={{minHeight: '80px'}}
              placeholder='Content to display'
              label='content'
              value={content}
              onChange={(e) => { onChangeData({content: e.target.value}) }}
            />
          </ViewerContainer>

          {/* Condition List */}
          <ViewerContainer className='adjacent-mar-t-1'>
            <ViewerHeader>Trigger Condition</ViewerHeader>

            <ConditionLogicDropdown
              className='flex-auto bor-1-gray adjacent-mar-t-2'
              placeholder='New Trigger Condition...'
              onSelect={(conditionLogicId) => { onSelectNewCondition({conditionLogicId}); }}
            />

            { conditionList.length > 0 &&
              <ConditionListEditorComponent
                className='adjacent-mar-t-2'
                itemClassName='bor-1-gray adjacent-mar-t-2'
                dataList={conditionList}
                onEdit={(updatedData) => onChangeData({conditionList: updatedData})}
              />
            }
          </ViewerContainer>

          {/* Trigger List */}
          <ViewerContainer className='adjacent-mar-t-1'>
            <ViewerHeader>Triggers</ViewerHeader>

            <TriggerLogicListDropdown
              className='fsize-3 bor-1-gray adjacent-mar-t-2'
              placeholder='New Trigger...'
              canSearch={true}
              onSelect={onSelectNewTrigger}
            />

            { triggerList.length > 0 &&
              <TriggerListEditorComponent
                className='fsize-3 adjacent-mar-t-2'
                dataList={triggerList}
                onEdit={(updatedData) => onChangeData({triggerList: updatedData})}
              />
            }
          </ViewerContainer>

          {/* Action List */}
          <ViewerContainer className='adjacent-mar-t-1'>
            <ViewerHeader>Actions</ViewerHeader>

            <ActionListDropdown
              className='fsize-3 bor-1-gray adjacent-mar-t-2'
              placeholder='New Action...'
              canSearch={true}
              onSelect={onSelectNewAction}
            />

            { actionList.length > 0 &&
              <ActionListEditorComponent
                className='adjacent-mar-t-2'
                dataList={actionList}
                onEdit={(updatedData) => onChangeData({actionList: updatedData})}
              />
            }
          </ViewerContainer>
        </div>

        {/* Tag List */}
        <ViewerContainer className='aself-start mar-l-1'>
          <ViewerHeader>Tags</ViewerHeader>

          <TagListDropdown
            className='fsize-3 bor-1-gray adjacent-mar-t-2'
            placeholder='New Tag...'
            canSearch={true}
            onSelect={onSelectNewTag}
          />

          { tagList.length > 0 &&
            <TagListEditorComponent
              className='fsize-2 flex-col flexwrap-yes adjacent-mar-t-2'
              itemClassName='adjacent-mar-t-1'
              dataList={tagList}
              onEdit={(updatedData) => onChangeData({tagList: updatedData})}
            />
          }
        </ViewerContainer>
      </div>
    )
  }
};
// -- form organizational components
/**
 * section in the menu
 */
const MenuSection = (props) => (
  <div
    {...props}
    className={combineClassNames('adjacent-mar-l-3 flex-row', props.className)}
  />
)
/**
 * uniquely styled window container
 */
const ViewerContainer = (props) => (
  <section
    {...props}
    className={combineClassNames('pad-2 flex-col flex-none bor-3-tertiary borradius-2 bg-light-beige', props.className)}
  />
)
/**
 * section in the viewer
 */
const ViewerHeader = (props) => (
  <h3
    className='fsize-3 f-bold color-grayer adjacent-mar-t-2'
  >
    { props.children }
  </h3>
)
