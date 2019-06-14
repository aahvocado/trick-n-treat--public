import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

// import Point from '@studiomoniker/point';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'

import {
  TILE_SIZE,
} from 'constants/styleConstants';

import {STAT_ID} from 'constants.shared/statIds';

import ButtonComponent, {BUTTON_THEME} from 'common-components/ButtonComponent';
import SpinnerComponent from 'common-components/SpinnerComponent';

import EncounterModalComponent from 'components/EncounterModalComponent';
import GameIconComponent from 'components/GameIconComponent';
import InventoryComponent from 'components/InventoryComponent';
import TileInspectorComponent from 'components/TileInspectorComponent';
import TileMapComponent from 'components/TileMapComponent';

import keycodes from 'constants.shared/keycodes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

import * as gamestateHelper from 'helpers/gamestateHelper.remote';

import * as connectionManager from 'managers/connectionManager';

import logger from 'utilities/logger.remote';
import * as mapUtils from 'utilities.shared/mapUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * page for the game
 */
export default observer(
class UserGamePage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.toggleItemModal = this.toggleItemModal.bind(this);

    this.onTileHoverHandler = this.onTileHoverHandler.bind(this);
    this.handleOnTileClick = this.handleOnTileClick.bind(this);
    this.handleMoveToOnClick = this.handleMoveToOnClick.bind(this);
    this.onClickChoice = this.onClickChoice.bind(this);
    this.onClickUseItem = this.onClickUseItem.bind(this);

    this.state = {
      /** @type {Point} */
      hoveredTilePos: null,
      /** @type {Point} */
      selectedTilePos: null,
      /** @type {Path} */
      selectedPath: [],

      /** @type {Boolean} */
      showModal: false,
      /** @type {Boolean} */
      isFullyVisibleMap: false,
      /** @type {Boolean} */
      isTileInspecting: remoteAppState.get('isDevMode'),
      /** @type {Boolean} */
      isZoomedOut: false,
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
    // redirect to Home page if not connected
    if (!remoteAppState.get('isConnected')) {
      remoteAppState.set({isInGame: false});
      return <Redirect to='/' />
    }

    // show loading
    if (!remoteGameState.get('isGameReady')) {
      return <div className='color-white bg-secondary flex-auto pad-v-2 flex-col-center width-full'>
        (waiting for map data)
        <SpinnerComponent className='mar-v-3' />
      </div>
    }

    const mapData = remoteGameState.get('mapData');
    const myCharacter = remoteGameState.get('myCharacter');
    const showEncounterModal = remoteGameState.get('showEncounterModal');

    const {
      hoveredTilePos,
      selectedTilePos,
      selectedPath,
      showModal,
      isFullyVisibleMap,
      isTileInspecting,
      isZoomedOut,
    } = this.state;


    return (
      <div className='bg-secondary flex-auto flex-center flex-col width-full talign-center position-relative'>
        {/* Inventory Modal */}
        <InventoryComponent
          active={showModal}
          inventoryList={remoteGameState.get('formattedInventoryList')}
          onClickUseItem={this.onClickUseItem}
        />

        {/* Encounter Modal */}
        <EncounterModalComponent
          active={showEncounterModal}
          encounterData={remoteGameState.get('formattedEncounterData')}
          onClickAction={this.onClickChoice}
        />

        {/* Stat Bar */}
        <div className='color-white flex-row-center pad-v-1'>
          <span className='adjacent-mar-l-2'>
            <span className='fsize-5 mar-r-1'>{myCharacter.get('health')}</span>
            <GameIconComponent statId={STAT_ID.HEALTH} />
          </span>

          <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='adjacent-mar-l-2'>
            <span className='fsize-5 mar-r-1'>{myCharacter.get('movement')}</span>
            <GameIconComponent statId={STAT_ID.MOVEMENT} />
          </span>

          <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='adjacent-mar-l-2'>
            <span className='fsize-5 mar-r-1'>{myCharacter.get('candies')}</span>
            <GameIconComponent statId={STAT_ID.CANDIES} />
          </span>

          <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='adjacent-mar-l-2'>
            <span className='fsize-5 mar-r-1'>{myCharacter.get('sanity')}</span>
            <GameIconComponent statId={STAT_ID.SANITY} />
          </span>
        </div>

        {/* Tile Inspection */}
        { isTileInspecting && hoveredTilePos !== null &&
          <TileInspectorComponent
            style={{left: '10px', top: '70px'}}
            tileData={matrixUtils.getTileAt(mapData, hoveredTilePos)}
          />
        }

        {/* Info Bar */}
        <div className='bg-primary pad-v-1 flex-row-center color-tertiary'>
          <FontAwesomeIcon className='flex-none adjacent-mar-l-2' icon={remoteGameState.get('isMyTurn') ? faPlay : faPause} />
          <div className='flex-none adjacent-mar-l-2' >{`Round ${remoteGameState.get('round')}`}</div>
        </div>

        {/* Map */}
        <TileMapComponent
          className={remoteGameState.get('isMyTurn') ? 'bor-5-fourth' : 'bor-5-primary-darker'}
          mapData={mapData}
          myPosition={myCharacter.get('position')}
          myRange={myCharacter.get('movement')}
          focalPoint={myCharacter.get('position')}
          selectedTilePos={selectedTilePos}
          selectedPath={selectedPath}
          tileSize={TILE_SIZE}
          isFullyVisibleMap={isFullyVisibleMap}
          isZoomedOut={isZoomedOut}
          onTileClick={this.handleOnTileClick}
          onTileHover={this.onTileHoverHandler}
        />

        {/* Action Buttons */}
        <ButtonComponent
          className='position-fixed fsize-5 f-bold adjacent-mar-l-2'
          style={{
            top: '515px',
            left: '35px',
            width: '90px',
            height: '90px',
          }}
          theme={BUTTON_THEME.ORANGE_CIRCLE}
          onClick={() => { this.toggleItemModal()}}
        >
          Items
        </ButtonComponent>

        <ButtonComponent
          className='position-fixed fsize-5 f-bold adjacent-mar-l-2'
          style={{
            top: '515px',
            right: '35px',
            width: '100px',
            height: '100px',
          }}
          theme={BUTTON_THEME.ORANGE_CIRCLE}
          disabled={!this.canMove()}
          onClick={this.handleMoveToOnClick}
        >
          Move
        </ButtonComponent>
      </div>
    )
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

    // spacebar - confirm move
    if (evt.keyCode === keycodes.space) {
      if (this.canMove()) {
        this.handleMoveToOnClick();
      }
    }

    // f - focus `selectedTilePos` onto character
    if (evt.keyCode === keycodes.f) {
      this.setState({selectedTilePos: remoteGameState.get('myCharacter').get('position').clone()});
    }
    // i - toggle inventory
    if (evt.keyCode === keycodes.i) {
      this.toggleItemModal();
    }
    // t - toggle tile inspection
    if (evt.keyCode === keycodes.t) {
      this.setState({isTileInspecting: !this.state.isTileInspecting});
    }
    // v - toggle lighting levels
    if (evt.keyCode === keycodes.v) {
      this.setState({isFullyVisibleMap: !this.state.isFullyVisibleMap});
    }
    // z - zoom out
    if (evt.keyCode === keycodes.z) {
      this.setState({isZoomedOut: !this.state.isZoomedOut});
    }

    // arrow keys to nav
    const {selectedTilePos} = this.state;
    if (selectedTilePos === null) {
      return;
    }

    if (evt.keyCode === keycodes.arrowup) {
      this.handleOnTileClick(selectedTilePos.clone().subtractY(1));
    }
    if (evt.keyCode === keycodes.arrowdown) {
      this.handleOnTileClick(selectedTilePos.clone().addY(1));
    }
    if (evt.keyCode === keycodes.arrowright) {
      this.handleOnTileClick(selectedTilePos.clone().addX(1));
    }
    if (evt.keyCode === keycodes.arrowleft) {
      this.handleOnTileClick(selectedTilePos.clone().subtractX(1));
    }
  }
  /**
   * selection of a Tile
   */
  handleOnTileClick(tilePosition) {
    const myCharacter = remoteGameState.get('myCharacter');

    const grid = mapUtils.createGridForPathfinding(gamestateHelper.getVisibileTileMapData());
    const aStarPath = mapUtils.getAStarPath(grid, myCharacter.get('position'), tilePosition);

    this.setState({
      selectedTilePos: tilePosition,
      selectedPath: aStarPath,
    });
  }
  /**
   * hovered over a Tile
   */
  onTileHoverHandler(tilePosition) {
    this.setState({hoveredTilePos: tilePosition});
  }
  /**
   * check if User can Move to a Tile
   */
  canMove() {
    if (!remoteGameState.get('isMyTurn')) {
      return false;
    }

    // can't move if a modal is open,
    //  most likely there's an encounter you have to address
    if (this.state.showModal) {
      return false;
    }

    // selected tile is not defined
    const {selectedTilePos, selectedPath} = this.state;
    if (selectedTilePos === null) {
      return false;
    }

    // no need to move to same spot
    if (selectedTilePos.equals(remoteGameState.get('myCharacter').get('position'))) {
      return false;
    }

    // as long as the selectedPath is long enough
    //  we will allow User to request this movement
    if(selectedPath.length > 0) {
      return true;
    }

    return false;
  }
  /**
   * Move action
   */
  handleMoveToOnClick() {
    if (!remoteGameState.get('isMyTurn')) {
      return;
    }

    // we'll use the `selectedPath` to determine what point we're going to request to try to move to
    //  we'll find the point that is within range since that path can be longer than character's movement
    const {selectedPath} = this.state;
    const movement = remoteGameState.get('myCharacter').get('movement');

    const pathEndPoint = selectedPath[selectedPath.length - 1];
    const chosenPoint = (selectedPath.length - 1) < movement ? pathEndPoint : selectedPath[movement];

    connectionManager.socket.emit(SOCKET_EVENT.GAME.TO_SERVER.MOVE_TO, chosenPoint);

    // reset selections
    this.setState({
      selectedTilePos: null,
      selectedPath: [],
    });
  }
  /**
   * selected an action from the Encounter
   *
   * @param {ChoiceId} choiceId
   */
  onClickChoice(actionData) {
    if (!remoteGameState.get('isMyTurn')) {
      return;
    }

    const activeEncounter = remoteGameState.get('activeEncounter');

    logger.user(`User selected "${actionData.choiceId}" for encounter "${activeEncounter.get('id')}"`);
    connectionManager.socket.emit(SOCKET_EVENT.GAME.TO_SERVER.CHOSE_ACTION, activeEncounter.get('id'), actionData);

    this.setState({
      selectedTilePos: null,
      selectedPath: [],
    });
  }
  /**
   * toggles visibility of the Modal
   *
   * @param {Boolean} [shouldShow]
   */
  toggleItemModal(shouldShow) {
    if (shouldShow !== undefined) {
      this.setState({showModal: shouldShow});
      return;
    }

    this.setState({showModal: !this.state.showModal});
  }
  /**
   * use item
   *
   * @param {ItemData} itemData
   */
  onClickUseItem(itemData) {
    this.setState({showModal: false});

    logger.user(`user used ${itemData.name}`);
    connectionManager.socket.emit(SOCKET_EVENT.GAME.TO_SERVER.USE_ITEM, itemData);
  }
});
