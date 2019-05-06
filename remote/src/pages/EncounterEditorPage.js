import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import { ENCOUNTER_ACTION_ID, ENCOUNTER_ACTION_ID_LIST } from 'constants.shared/encounterActions';
import { ENCOUNTER_TRIGGER_ID_LIST } from 'constants.shared/encounterTriggers';
import { TAG_ID_LIST } from 'constants.shared/tagConstants';

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';
import DropdownComponent from 'common-components/DropdownComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';
import ModalComponent from 'common-components/ModalComponent';
import RadioButtonComponent from 'common-components/RadioButtonComponent';
import TextInputComponent from 'common-components/TextInputComponent';

import EncounterModalComponent from 'components/EncounterModalComponent';

import ENCOUNTER_DATA from 'data.shared/encounterData.json';

import remoteAppState from 'state/remoteAppState';

// import debounce from 'utilities/debounce';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Encounter Editor page, this should handle all the state and data
 */
export default observer(
class EncounterEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.onClickOverlayHandler = this.onClickOverlayHandler.bind(this);
    this.togglePreviewModal = this.togglePreviewModal.bind(this);

    // -- Editor
    this.createNew = this.createNew.bind(this);
    this.deleteEncounter = this.deleteEncounter.bind(this);
    this.saveEncounter = this.saveEncounter.bind(this);
    this.setActiveEncounter = this.setActiveEncounter.bind(this);
    this.addTag = this.addTag.bind(this);
    this.removeTag = this.removeTag.bind(this);

    this.addAction = this.addAction.bind(this);
    this.updateAction = this.updateAction.bind(this);

    this.addTrigger = this.addTrigger.bind(this);
    this.removeTrigger = this.removeTrigger.bind(this);
    this.updateTrigger = this.updateTrigger.bind(this);

    // -- Viewer
    this.onBlurInputHandler = this.onBlurInputHandler.bind(this);
    this.onChangeInputHandler = this.onChangeInputHandler.bind(this);
    this.onChangeViewerActionHandler = this.onChangeViewerActionHandler.bind(this);
    this.onClickInputHandler = this.onClickInputHandler.bind(this);
    this.onClickViewerAddActionHandler = this.onClickViewerAddActionHandler.bind(this);
    this.onClickRemoveTagItemHandler = this.onClickRemoveTagItemHandler.bind(this);

    // -- Interface
    this.onChangeExportTypeHandler = this.onChangeExportTypeHandler.bind(this);
    this.onExportClickHandler = this.onExportClickHandler.bind(this);
    this.onClickCreateNewHandler = this.onClickCreateNewHandler.bind(this);
    this.onClickEncounterItemHandler = this.onClickEncounterItemHandler.bind(this);
    this.onClickInterfaceTagItemHandler = this.onClickInterfaceTagItemHandler.bind(this);

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
      /** @type {React.Element} */
      ModalContent: ExportModal,

      // -- Viewer state
      /** @type {String | null} */
      activeFieldKey: null,

      // -- Interface state
      /** @type {String} */
      selectedExportType: 'EXPORT_TYPE.ALL',
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
      activeFieldKey,
      activeEncounterData,
      encounterList,
      hasChanges,
      selectedExportType,
      showModal,
      showPreview,
      ModalContent,
    } = this.state;

    return (
      <div className='flex-center flex-col color-white bg-primary'>
        {/* Modal */}
        <ModalComponent
          className='flex-col-center color-black bg-white pad-2 mar-v-5'
          style={{
            width: '500px',
            height: '500px',
          }}
          active={showModal}
          onClickOverlay={this.onClickOverlayHandler}
        >
          <ModalContent />
        </ModalComponent>

        {/* Encounter Preview Modal */}
        <EncounterModalComponent
          active={showPreview}
          onClickOverlay={this.togglePreviewModal}
          {...activeEncounterData}
        />

        <h2 className='bg-secondary fsize-4 pad-v-1 width-full text-center'>Encounter Editor</h2>

        <div className='flex-row height-full bg-primary-darker'>
          {/* Interface menu */}
          <InterfacePanel
            activeEncounterData={activeEncounterData}
            encounterList={encounterList}
            hasChanges={hasChanges}

            onClickTogglePreviewModal={this.togglePreviewModal}
            onClickCreateNew={this.onClickCreateNewHandler}
            onClickDelete={this.deleteEncounter}
            onClickSave={this.saveEncounter}

            onClickEncounterItem={this.onClickEncounterItemHandler}

            selectedExportType={selectedExportType}
            onChangeExportType={this.onChangeExportTypeHandler}
            onExportClick={this.onExportClickHandler}
          />

          {/* Viewer */}
          <ViewerPanel
            activeEncounterData={activeEncounterData}
            encounterList={encounterList}
            activeFieldKey={activeFieldKey}

            onClickInput={this.onClickInputHandler}
            onChangeInput={this.onChangeInputHandler}
            onBlurInput={this.onBlurInputHandler}

            onChangeViewerAction={this.onChangeViewerActionHandler}
            onClickAddAction={this.onClickViewerAddActionHandler}

            onSelectNewTrigger={this.addTrigger}
            onChangeTriggerItem={this.updateTrigger}
            onRemoveTriggerItem={this.removeTrigger}

            onClickRemoveTagItem={this.onClickRemoveTagItemHandler}
            onSelectNewTag={this.addTag}
          />
        </div>
      </div>
    );
  }
  // -- Editor methods
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
      });
      return;
    }

    // replace data currently at the
    encounterList[matchingEncounterIdx] = activeEncounterData;
    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      encounterList: encounterList,
      hasChanges: false,
    });
  }
  /**
   * removes the `activeEncounterData` from the List
   */
  deleteEncounter() {
    const {
      encounterList,
      activeEncounterData,
    } = this.state;

    // find if activeEncounter is in list
    const matchingEncounterIdx = encounterList.findIndex((encounter) => (encounter.id === activeEncounterData.id));
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
   * set `activeEncounter` to a blank template
   */
  createNew() {
    const blankEncounterData = {
      id: `NEW_ENCOUNTER.${Date.now()}`,
      title: '',
      content: '',
      tagList: [],
      actionList: [],
      triggerList: [],
    };

    this.setState({
      activeEncounterData: deepClone(blankEncounterData),
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
   */
  addAction() {
    const { activeEncounterData } = this.state;
    const { actionList } = activeEncounterData;

    // add it
    actionList.push({
      actionId: undefined,
      label: '',
    });

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
      value: 0,
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
  // -- Viewer methods
  /**
   * @param {String} fieldKey
   */
  onClickInputHandler(fieldKey) {
    this.setState({activeFieldKey: fieldKey});
  }
  /**
   * @param {SyntheticEvent} e
   */
  onBlurInputHandler(e) {
    this.setState({activeFieldKey: null});
  }
  /**
   * @param {String} fieldKey
   * @param {SyntheticEvent} e
   */
  onChangeInputHandler(fieldKey, e) {
    const { activeEncounterData } = this.state;

    activeEncounterData[fieldKey] = e.target.value;

    this.setState({
      activeEncounterData: deepClone(activeEncounterData),
      hasChanges: true,
    });
  }
  /**
   * @param {String} action
   * @param {Number} idx
   */
  onChangeViewerActionHandler(action, idx) {
    this.updateAction(action, idx);
  }
  /**
   * clicked "Create New" in the Interface
   */
  onClickCreateNewHandler() {
    this.createNew();
  }
  /**
   * @param {String} tagId
   */
  onClickRemoveTagItemHandler(tagId) {
    this.removeTag(tagId);
  }
  /**
   *
   */
  onClickViewerAddActionHandler() {
    this.addAction();
  }
  // -- Interface methods
  /**
   * clicked "Export" in the Editor
   */
  onExportClickHandler() {
    const {
      activeEncounterData,
      encounterList,
      selectedExportType,
    } = this.state;

    const shouldExportAll = selectedExportType === 'EXPORT_TYPE.ALL';

    const formattedData = JSON.stringify(shouldExportAll ? encounterList : activeEncounterData);

    this.setState({
      showModal: true,
      ModalContent: () => <ExportModal title={shouldExportAll ? 'Export of All Encounters' : 'Export of Current Encounter'} value={formattedData} />,
    });
  }
  /**
   * clicked <ModalComponent /> overlay
   */
  onClickOverlayHandler() {
    this.setState({showModal: false});
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeExportTypeHandler(e) {
    this.setState({selectedExportType: e.target.value});
  }
  /**
   * @param {Object} encounterData
   */
  onClickEncounterItemHandler(encounterData) {
    this.setActiveEncounter(encounterData);
  }
  /**
   * @param {String} tagId
   */
  onClickInterfaceTagItemHandler(tagId) {
    this.addTag(tagId);
  }
})
/**
 * Interface with options
 */
class InterfacePanel extends Component {
  static defaultProps = {
    /** @type {EncounterData} */
    activeEncounterData: null,
    /** @type {Array<EncounterData>} */
    encounterList: [],

    /** @type {Function} */
    onClickCreateNew: () => {},
    /** @type {Function} */
    onClickEncounterItem: () => {},

    // - export
    /** @type {String} */
    selectedExportType: 'EXPORT_TYPE.ALL',
    /** @type {Function} */
    onChangeExportType: () => {},
    /** @type {Function} */
    onExportClick: () => {},
  };
  /** @override */
  render() {
    const {
      activeEncounterData,
      encounterList,
      hasChanges,
      selectedExportType,
      onChangeExportType,
      onClickCreateNew,
      onClickEncounterItem,
      onClickDelete,
      onClickSave,
      onClickTogglePreviewModal,
      onExportClick,
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
        <form
          className='sibling-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          {/* Create New Encounter */}
          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={onClickCreateNew}
          >
            Create New
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={onClickSave}
            disabled={!hasChanges}
          >
            {`Save ${isNewEncounter ? 'New' : ''}`}
          </ClassicButtonComponent>

          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={onClickDelete}
          >
            Delete
          </ClassicButtonComponent>

          <h3 className='text-center sibling-mar-t-2'>{`Encounters (${encounterList.length})`}</h3>

          {/* List of Encounters */}
          <DropdownComponent
            className='fsize-4'
            value={activeEncounterData}
            options={encounterList.map((item) => ({
              data: item,
              id: item.id,
              label: item.title,
            }))}
            onSelect={onClickEncounterItem}
          />
        </form>

        <FontAwesomeIcon className='sibling-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        <div className='sibling-mar-t-3 width-full flex-col'>
          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={onClickTogglePreviewModal}
          >
            Preview
          </ClassicButtonComponent>
        </div>

        <FontAwesomeIcon className='sibling-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Export options */}
        <form
          className='sibling-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <RadioButtonComponent
            className='fsize-3 sibling-mar-t-2'
            checked={selectedExportType === 'EXPORT_TYPE.ALL'}
            value='EXPORT_TYPE.ALL'
            onChange={onChangeExportType}
          >
            export all
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 sibling-mar-t-2'
            checked={selectedExportType === 'EXPORT_TYPE.ACTIVE'}
            value='EXPORT_TYPE.ACTIVE'
            onChange={onChangeExportType}
          >
            export current
          </RadioButtonComponent>

          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={onExportClick}
          >
            Export Encounter Data
          </ClassicButtonComponent>
        </form>
      </div>
    );
  }
}
/**
 *
 */
class ViewerPanel extends Component {
  render() {
    const {
      activeEncounterData,
      activeFieldKey,
      encounterList,
      onBlurInput,
      onChangeInput,
      onChangeViewerAction,
      onClickAddAction,

      onChangeTriggerItem,
      onSelectNewTrigger,
      onRemoveTriggerItem,

      onClickRemoveTagItem,
      onSelectNewTag,

      onClickInput,
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
            children='id'
            placeholder='Please enter a unique `id`'
            value={id}
            isEditing={activeFieldKey === 'id'}
            onClick={() => { onClickInput('id') }}
            onChange={(e) => { onChangeInput('id', e) }}
            onBlur={onBlurInput}
          />

          <TextInputComponent
            children='title'
            placeholder='Title of the encounter'
            value={title}
            isEditing={activeFieldKey === 'title'}
            onClick={() => { onClickInput('title') }}
            onChange={(e) => { onChangeInput('title', e) }}
            onBlur={onBlurInput}
          />

          <TextInputComponent
            children='content'
            placeholder='Content to display'
            value={content}
            isEditing={activeFieldKey === 'content'}
            onClick={() => { onClickInput('content') }}
            onChange={(e) => { onChangeInput('content', e) }}
            onBlur={onBlurInput}
          />
        </ViewerRow>

        <ViewerDivider />

        {/* Trigger List */}
        <ViewerRow>
          <ViewerHeader>Triggers</ViewerHeader>

          <DropdownComponent
            value={{id: undefined}}
            placeholder='New Trigger...'
            options={ENCOUNTER_TRIGGER_ID_LIST.map((item) => ({
              data: item,
              id: item,
              label: item,
            }))}
            onSelect={onSelectNewTrigger}
          />

          <div className='fsize-3 flex-row flex-wrap-yes sibling-mar-t-2'>
            { triggerList.map((trigger, idx) => (
              <ViewerTriggerItem
                key={`trigger-item-${trigger.triggerId}-${idx}-key`}
                label={trigger.triggerId}
                value={trigger.value}
                onRemoveClick={() => { onRemoveTriggerItem(trigger, idx) }}
                onChangeValue={(e) => {
                  onChangeTriggerItem({
                    ...trigger,
                    value: parseInt(e.target.value),
                  }, idx)
                }}
              />
            ))}
          </div>
        </ViewerRow>

        <ViewerDivider />

        {/* Action List */}
        <ViewerRow>
          <ViewerHeader>Actions</ViewerHeader>

          <ClassicButtonComponent
            className='fsize-3 aself-start sibling-mar-t-2'
            onClick={onClickAddAction}
          >
            Add Action
          </ClassicButtonComponent>

          <div className='flex-col sibling-mar-t-2'>
            { actionList.map((action, idx) => (
              <ViewerActionItem
                key={`action-item-${action.actionId}-${idx}-key`}
                label={action.label}
                actionId={action.actionId}
                gotoId={action.gotoId}
                options={encounterList.map((item) => ({
                  data: item.id,
                  id: item.id,
                  label: item.title,
                }))}
                onSelectAction={(actionId) => {
                  onChangeViewerAction({
                    ...action,
                    actionId: actionId,
                  }, idx);
                }}
                onSelectGoto={(gotoId) => {
                  onChangeViewerAction({
                    ...action,
                    gotoId: gotoId,
                  }, idx);
                }}
                onChangeName={(e) => {
                  onChangeViewerAction({
                    ...action,
                    label: e.target.value,
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

          <DropdownComponent
            value={{id: undefined}}
            placeholder='New Tag...'
            options={TAG_ID_LIST.map((item) => ({
              data: item,
              id: item,
              label: item,
            }))}
            onSelect={onSelectNewTag}
          />

          <div className='fsize-2 flex-row flex-wrap-yes sibling-mar-t-2'>
            { tagList.map((tagId, idx) => (
              <ViewerTagItem
                key={`viewer-tag-item-${tagId}-${idx}-key`}
                label={tagId}
                onRemoveClick={() => { onClickRemoveTagItem(tagId) }}
              />
            ))}
          </div>
        </ViewerRow>
      </div>
    )
  }
};
// -- Viewer
/**
 * section in the viewer
 */
const ViewerRow = (props) => (
  <div
    className='flex-col sibling-mar-t-2'
    {...props}
  />
)
/**
 * section in the viewer
 */
const ViewerHeader = (props) => (
  <h3
    className='fsize-3 color-grayest sibling-mar-t-2'
  >
    { props.children }
  </h3>
)
/**
 * divider
 */
const ViewerDivider = (props) => (
  <div className='bor-b-1-secondary sibling-mar-t-2'></div>
)
/**
 *
 */
const ViewerTagItem = (props) => (
  <div className='bg-white borradius-1 bor-1-gray sibling-mar-l-2'>
    <ClassicButtonComponent
      className='pad-1 bor-0-transparent'
      activeClassName='cursor-pointer color-grayer hover:color-tertiary'
      children={props.label}
    />
    <IconButtonComponent
      className='bor-0-transparent'
      icon={faTimes}
      onClick={props.onRemoveClick}
    />
  </div>
)
/**
 *
 */
const ViewerActionItem = (props) => (
  <div className='pad-2 borradius-1 bor-1-gray bg-white position-relative sibling-mar-t-2'>
    <div className='fsize-3 flex-col sibling-mar-t-2'>
      <div className='color-grayer mar-b-1'>action</div>
      {/* List of Actions */}
      <ActionListDropdown
        value={{id: props.actionId}}
        onSelect={props.onSelectAction}
      />
    </div>

    {/* Encounter to "go to" */}
    { props.actionId === ENCOUNTER_ACTION_ID.GOTO &&
      <div className='flex-col sibling-mar-t-2'>
        <div className='color-grayer mar-b-1'>go to</div>
        <DropdownComponent
          value={{id: props.gotoId}}
          options={props.options}
          onSelect={props.onSelectGoto}
        />
      </div>
    }

    <TextInputComponent
      children='label'
      value={props.label}
      onChange={props.onChangeName}
    />
  </div>
)
/**
 *
 */
const ViewerTriggerItem = (props) => (
  <div className='bg-white borradius-1 bor-1-gray sibling-mar-t-2 flex-row-center'>
    <ClassicButtonComponent
      className='pad-1 bor-0-transparent'
      activeClassName='cursor-pointer color-black hover:color-tertiary'
      children={props.label}
    />

    <input
      className='bor-h-1-gray pad-h-2'
      type='number'
      value={props.value}
      onChange={props.onChangeValue}
    />

    <IconButtonComponent
      className='bor-0-transparent'
      icon={faTimes}
      onClick={props.onRemoveClick}
    />
  </div>
)
/**
 *
 */
const ExportModal = (props) => (
  <Fragment>
    <span className='color-black fsize-4'>{props.title}</span>
    <textarea
      className='color-black pad-2 width-full height-full box-sizing-border bor-1-gray'
      style={{
        resize: 'none',
        whiteSpace: 'pre-line',
      }}
      readOnly
      defaultValue={props.value}
    />
  </Fragment>
)
/**
 *
 */
const ActionListDropdown = (props) => (
  <DropdownComponent
    className='fsize-3'
    value={props.value}
    options={ENCOUNTER_ACTION_ID_LIST.map((item) => ({
      data: item,
      id: item,
      label: item,
    }))}
    onSelect={props.onSelect}
  />
)

