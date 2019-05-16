import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import { ENCOUNTER_ACTION_ID } from 'constants.shared/encounterActions';

import ClassicButtonComponent, { BUTTON_THEME } from 'common-components/ClassicButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';
import ModalComponent from 'common-components/ModalComponent';
import TextAreaComponent from 'common-components/TextAreaComponent';
import TextInputComponent from 'common-components/TextInputComponent';

import ActionListDropdown from 'components/ActionListDropdown';
import ConditionEditorComponent from 'components/ConditionEditorComponent';
import EncounterModalComponent from 'components/EncounterModalComponent';
import TagEditorComponent from 'components/TagEditorComponent';
import TagListDropdown from 'components/TagListDropdown';
import TriggerEditorComponent from 'components/TriggerEditorComponent';
import TriggerListDropdown from 'components/TriggerListDropdown';

import ENCOUNTER_DATA from 'data.shared/encounterData.json';

import remoteAppState from 'state/remoteAppState';

import copyToClipboard from 'utilities/copyToClipboard';
import download from 'utilities/download';

import deepClone from 'utilities.shared/deepClone';
import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';
import * as jsonDataUtils from 'utilities.shared/jsonDataUtils';

/**
 * Encounter Editor page, this should handle all the state and data
 */
export default observer(
class EncounterEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.onClickModalOverlay = this.onClickModalOverlay.bind(this);
    this.togglePreviewModal = this.togglePreviewModal.bind(this);

    // -- Editor
    this.copyActiveEncounterToClipboard = this.copyActiveEncounterToClipboard.bind(this);
    this.copyEncounterListToClipboard = this.copyEncounterListToClipboard.bind(this);
    this.downloadEncounterData = this.downloadEncounterData.bind(this);

    this.createNew = this.createNew.bind(this);
    this.deleteActiveEncounter = this.deleteActiveEncounter.bind(this);
    this.deleteEncounter = this.deleteEncounter.bind(this);
    this.saveEncounter = this.saveEncounter.bind(this);
    this.setActiveEncounter = this.setActiveEncounter.bind(this);

    this.onChangeId = this.onChangeId.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);

    this.addAction = this.addAction.bind(this);
    this.removeAction = this.removeAction.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.addConditionToAction = this.addConditionToAction.bind(this);

    this.addTrigger = this.addTrigger.bind(this);
    this.removeTrigger = this.removeTrigger.bind(this);
    this.updateTrigger = this.updateTrigger.bind(this);
    this.addConditionToTrigger = this.addConditionToTrigger.bind(this);

    this.addTag = this.addTag.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.updateTag = this.updateTag.bind(this);

    this.state = {
      // -- Editor
      /** @type {EncounterData} */
      activeEncounterData: deepClone(ENCOUNTER_DATA[0]),
      /** @type {Array<EncounterData>} */
      encounterList: ENCOUNTER_DATA,

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
          {...activeEncounterData}
        />

        <h2 className='bg-secondary fsize-4 pad-v-1 width-full talign-center'>
          Encounter Editor
        </h2>

        <div className='flex-row height-full bg-primary-darker'>
          {/* Menu */}
          <EncounterEditorMenu
            activeEncounterData={activeEncounterData}
            encounterList={encounterList}
            hasChanges={hasChanges}

            onClickTogglePreviewModal={this.togglePreviewModal}

            onClickCreateNew={this.createNew}
            onClickDelete={this.deleteActiveEncounter}
            onClickSave={this.saveEncounter}
            onSelectMenuEncounter={this.setActiveEncounter}

            onClickCopyCurrentData={this.copyActiveEncounterToClipboard}
            onClickCopyAllData={this.copyEncounterListToClipboard}
            onClickDownload={this.downloadEncounterData}
          />

          {/* Viewer */}
          <EncounterEditorViewer
            activeEncounterData={activeEncounterData}
            encounterList={encounterList}

            onChangeId={this.onChangeId}
            onChangeTitle={this.onChangeTitle}
            onChangeContent={this.onChangeContent}

            onChangeActionData={this.updateAction}
            onClickRemoveAction={this.removeAction}
            onSelectNewAction={this.addAction}
            onClickAddActionCondition={this.addConditionToAction}

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
    copyToClipboard(JSON.stringify(activeEncounterData));
  }
  /**
   * copies a json of the `encounterList` to clipboard
   *  triggered after pressing "save" so work isn't lost if we forget to export
   */
  copyEncounterListToClipboard() {
    const { encounterList } = this.state;
    copyToClipboard(JSON.stringify(encounterList));
  }
  /**
   * set `activeEncounter` to a blank template
   */
  createNew() {
    this.setState({
      activeEncounterData: deepClone(encounterDataUtils.getBlankTemplate()),
      hasChanges: true,
    });
  }
  /**
   * the `id` of the ActiveEncounter was changed
   *
   * @param {String} value
   */
  onChangeId(value) {
    const { activeEncounterData } = this.state;

    // change the data
    activeEncounterData.id = encounterDataUtils.formatId(value);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * the `title` of the ActiveEncounter was changed
   *
   * @param {String} value
   */
  onChangeTitle(value) {
    const { activeEncounterData } = this.state;

    // change the data
    activeEncounterData.title = value;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * the `content` of the ActiveEncounter was changed
   *
   * @param {String} value
   */
  onChangeContent(value) {
    const { activeEncounterData } = this.state;

    // change the data
    activeEncounterData.content = value;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
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
    const { tagList } = activeEncounterData;

    // check if it already already has the tag
    if (tagList.includes(tagId)) {
      return;
    }

    // add it
    tagList.push(tagId);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * removes a Tag from the active Encounter
   *
   * @param {String} tagId
   */
  removeTag(tagId) {
    const { activeEncounterData } = this.state;
    const { tagList } = activeEncounterData;

    // check if there actually is the tag
    const tagIdx = tagList.indexOf(tagId);
    if (tagIdx <= -1) {
      return;
    }

    // remove it
    tagList.splice(tagIdx, 1);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
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
    const { activeEncounterData } = this.state;
    const { tagList } = activeEncounterData;

    // set it to the new tagData
    tagList[idx] = tagId;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * changes the action of one in the list
   *
   * @param {ActionData} actionData
   * @param {Number} idx
   */
  updateAction(actionData, idx) {
    const { activeEncounterData } = this.state;
    const { actionList } = activeEncounterData;

    // set it to the new actionData
    actionList[idx] = actionData;

    // if it is no longer a "go to" action, then clear out the id
    if (actionData.actionId !== ENCOUNTER_ACTION_ID.GOTO) {
      actionData.gotoId = undefined;
    }

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Action to the active Encounter
   *
   * @param {ActionId} [actionId]
   */
  addAction(actionId) {
    const { activeEncounterData } = this.state;
    const { actionList } = activeEncounterData;

    // add it
    actionList.push({
      actionId: actionId,
      label: '',
    });

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * remove Action
   *
   * @param {ActionId} actionId
   * @param {Number} idx
   */
  removeAction(actionId, idx) {
    const { activeEncounterData } = this.state;
    const { actionList } = activeEncounterData;

    // remove it
    actionList.splice(idx, 1);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Condition to given Action data
   *
   * @param {ActionData} actionData
   * @param {Number} idx
   */
  addConditionToAction(actionData, idx) {
    const { activeEncounterData } = this.state;
    const { actionList } = activeEncounterData;

    // add a new blank condition
    const conditionList = jsonDataUtils.getConditionList(actionData);
    conditionList.push({
      conditionId: undefined,
      conditionTargetId: undefined,
      value: 1,
    });

    // update the `conditionList` in the trigger
    actionData.conditionList = conditionList;
    actionList[idx] = actionData;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * adds a new Trigger to the active Encounter
   *
   * @param {TriggerId} triggerId
   */
  addTrigger(triggerId) {
    const { activeEncounterData } = this.state;
    const { triggerList } = activeEncounterData;

    // do not add duplicates
    if (triggerList.find(t => t.triggerId === triggerId)) {
      return;
    }

    // add it
    triggerList.push({
      triggerId: triggerId,
      value: 1,
    });

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * remove Trigger
   *
   * @param {TriggerId} triggerId
   * @param {Number} idx
   */
  removeTrigger(triggerId, idx) {
    const { activeEncounterData } = this.state;
    const { triggerList } = activeEncounterData;

    // remove it
    triggerList.splice(idx, 1);

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
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
    const { activeEncounterData } = this.state;
    const { triggerList } = activeEncounterData;

    //
    triggerList[idx] = triggerData;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
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
    const { activeEncounterData } = this.state;
    const { triggerList } = activeEncounterData;

    // add a new blank condition
    const conditionList = jsonDataUtils.getConditionList(triggerData);
    conditionList.push({
      conditionId: undefined,
      conditionTargetId: undefined,
      value: 1,
    });

    // update the `conditionList` in the trigger
    triggerData.conditionList = conditionList;
    triggerList[idx] = triggerData;

    // update the data
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
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
  /**
   * downloads a `encounterData.json` file
   */
  downloadEncounterData() {
    const { encounterList } = this.state;
    download(JSON.stringify(encounterList), 'encounterData.json', 'application/json');
  }
})
/**
 * Menu
 */
class EncounterEditorMenu extends Component {
  /** @override */
  render() {
    const {
      activeEncounterData,
      encounterList,
      hasChanges,
      onClickCreateNew,
      onSelectMenuEncounter,
      onClickCopyAllData,
      onClickCopyCurrentData,
      onClickDelete,
      onClickDownload,
      onClickSave,
      onClickTogglePreviewModal,
    } = this.props;

    const isNewEncounter = encounterList.find(encounter => encounter.id === activeEncounterData.id) === undefined;

    return (
      <div
        className='flex-col aitems-center color-white bg-primary pad-2'
        style={{
          width: '300px',
        }}
      >
        {/* Encounters */}
        <MenuRow>
          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCreateNew}
          >
            Create New
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickSave}
            disabled={!hasChanges || activeEncounterData.id === 'ENCOUNTER_ID.NEW' || activeEncounterData.id === ''}
          >
            {`Save ${isNewEncounter ? 'New' : ''}`}
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickDelete}
            disabled={isNewEncounter}
          >
            Delete
          </ClassicButtonComponent>

          <h3 className='talign-center adjacent-mar-t-2'>{`Encounters (${encounterList.length})`}</h3>

          {/* List of Encounters */}
          <DropdownComponent
            className='fsize-4 adjacent-mar-t-2'
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
        </MenuRow>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        <MenuRow>
          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickTogglePreviewModal}
          >
            Preview Encounter
          </ClassicButtonComponent>
        </MenuRow>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Export options */}
        <MenuRow>
          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCopyCurrentData}
          >
            Copy Current Data
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickCopyAllData}
          >
            Copy All Data
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='adjacent-mar-t-2'
            onClick={onClickDownload}
          >
            Download encounterData.json
          </ClassicButtonComponent>
        </MenuRow>
      </div>
    );
  }
}
/**
 *
 */
class EncounterEditorViewer extends Component {
  render() {
    const {
      activeEncounterData,
      encounterList,

      onChangeId,
      onChangeTitle,
      onChangeContent,

      onChangeActionData,
      onClickRemoveAction,
      onSelectNewAction,
      onClickAddActionCondition,

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
      title,
      content,
      actionList,
      tagList,
      triggerList,
    } = activeEncounterData;

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
            value={encounterDataUtils.snipIdPrefix(id)}
            onChange={(e) => { onChangeId(e.target.value) }}
          />

          <TextInputComponent
            placeholder='Title of the encounter'
            label='title'
            value={title}
            onChange={(e) => { onChangeTitle(e.target.value) }}
          />

          <TextAreaComponent
            className='resize-vertical adjacent-mar-t-2'
            placeholder='Content to display'
            label='content'
            value={content}
            onChange={(e) => { onChangeContent(e.target.value) }}
          />
        </ViewerRow>

        <ViewerDivider />

        {/* Trigger List */}
        <ViewerRow>
          <ViewerHeader>Triggers</ViewerHeader>

          <TriggerListDropdown
            className='fsize-3 bor-1-gray adjacent-mar-t-2'
            placeholder='New Trigger...'
            canSearch={true}
            onSelect={onSelectNewTrigger}
          />

          <div className='fsize-3 flex-col adjacent-mar-t-2'>
            { triggerList.map((triggerData, idx) => (
              <TriggerEditorComponent
                key={`trigger-item-${triggerData.triggerId}-${idx}-key`}
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

        {/* Action List */}
        <ViewerRow>
          <ViewerHeader>Actions</ViewerHeader>

          <ActionListDropdown
            className='fsize-3 bor-1-gray adjacent-mar-t-2'
            placeholder='New Action...'
            canSearch={true}
            onSelect={onSelectNewAction}
          />

          <div className='flex-col adjacent-mar-t-2'>
            { actionList.map((actionData, idx) => (
              <ViewerActionItem
                key={`action-item-${actionData.actionId}-${idx}-key`}
                label={actionData.label}
                actionId={actionData.actionId}
                gotoId={actionData.gotoId}
                options={encounterList.map((item) => ({
                  data: item.id,
                  id: item.id,
                  label: item.title,
                }))}
                onSelectAction={(actionId) => {
                  onChangeActionData({
                    ...actionData,
                    actionId: actionId,
                  }, idx);
                }}
                onSelectGoto={(gotoId) => {
                  onChangeActionData({
                    ...actionData,
                    gotoId: gotoId,
                  }, idx);
                }}
                onChangeName={(e) => {
                  onChangeActionData({
                    ...actionData,
                    label: e.target.value,
                  }, idx);
                }}
                onClickRemove={() => { onClickRemoveAction(actionData, idx) }}

                conditionList={actionData.conditionList || []}
                onClickAddCondition={() => { onClickAddActionCondition(actionData, idx); }}
                onChangeConditionData={(conditionData, conditionIdx) => {
                  actionData.conditionList[conditionIdx] = conditionData;

                  onChangeActionData({
                    ...actionData,
                    conditionList: actionData.conditionList,
                  })
                }}
                onClickRemoveCondition={() => {
                  const conditionList = actionData.conditionList || [];
                  conditionList.splice(idx, 1);

                  onChangeActionData({
                    ...actionData,
                    conditionList: conditionList,
                  }, idx);
                }}
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
              <TagEditorComponent
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
// -- Menu
/**
 * section in the menu
 */
const MenuRow = (props) => (
  <div
    className='adjacent-mar-t-3 width-full flex-col'
    {...props}
  />
)
// -- Viewer
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
/**
 *
 */
const ViewerActionItem = (props) => (
  <div className='adjacent-mar-t-2 flex-col'>
    {/* Basic Information row */}
    <div className='bor-1-gray bg-white flex-row'>
      <ActionListDropdown
        className='bor-0-transparent adjacent-mar-t-2'
        showButton={false}
        selectedOption={{id: props.actionId}}
        onSelect={props.onSelectAction}
      />

      <input
        className='flex-auto bor-h-1-gray pad-h-2'
        type='text'
        placeholder='Label for the button...'
        value={props.label}
        onChange={props.onChangeName}
      />

      <IconButtonComponent
        className='flex-none bor-0-transparent'
        icon={faTimes}
        onClick={props.onClickRemove}
      />
    </div>

    {/* Encounter to "go to" */}
    { props.actionId === ENCOUNTER_ACTION_ID.GOTO &&
      <div className='bg-white flex-row-center bor-h-1-gray bor-b-1-gray'>
        <div className='flex-none pad-1 bor-r-1-gray color-grayer'>Goes to Encounter</div>
        <DropdownComponent
          className='flex-auto borcolor-transparent adjacent-mar-t-2'
          selectedOption={{id: props.gotoId}}
          options={props.options}
          onSelect={props.onSelectGoto}
        />
      </div>
    }

    {/* Condition List */}
    { props.conditionList.map((conditionData, idx) => (
      <ConditionEditorComponent
        key={`viewer-action-item-condition-row-${idx}-key`}
        data={conditionData}
        onEdit={(updatedData) => {
          props.onChangeConditionData(updatedData, idx);
        }}
        onClickRemove={() => {
          props.onClickRemoveCondition(idx);
        }}
      />
    ))}

    <ClassicButtonComponent
      className='fsize-2 aself-start flex-none borradius-b-2 bor-b-1-gray bor-h-1-gray'
      theme={BUTTON_THEME.WHITE}
      onClick={props.onClickAddCondition}
    >
      Add Condition
    </ClassicButtonComponent>
  </div>
)
