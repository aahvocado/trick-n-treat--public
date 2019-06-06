import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import Point from '@studiomoniker/point';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'

import {
  TILE_SIZE,
} from 'constants/mapConstants';

import {
  TILE_TYPES_NAME,
} from 'constants.shared/tileTypes';
import {STAT_ID} from 'constants.shared/statIds';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import ModalComponent from 'common-components/ModalComponent';

import EncounterModalComponent from 'components/EncounterModalComponent';
import GameIconComponent from 'components/GameIconComponent';
import InventoryComponent from 'components/InventoryComponent';
import TileMapComponent from 'components/TileMapComponent';

import {MAP_CONTAINER_WIDTH} from 'constants/mapConstants';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

import * as gamestateHelper from 'helpers/gamestateHelper.remote';

import * as connectionManager from 'managers/connectionManager';

import logger from 'utilities/logger.remote';
import * as mapUtils from 'utilities.shared/mapUtils';

/**
 * page for the game
 */
export default observer(
class UserGamePage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.toggleItemModal = this.toggleItemModal.bind(this);
    this.onClickUseItem = this.onClickUseItem.bind(this);

    this.handleOnTileClick = this.handleOnTileClick.bind(this);

    this.handleMoveToOnClick = this.handleMoveToOnClick.bind(this);
    this.onClickChoice = this.onClickChoice.bind(this);

    this.state = {
      /** @type {Point} */
      selectedTilePos: new Point(0, 0),
      /** @type {Path} */
      selectedPath: [],

      /** @type {Boolean} */
      showModal: false,
    }
  }
  // /** @override */
  // componentDidUpdate(prevProps, prevState) {
  //   const hasNewActiveEncounter = prevProps.activeEncounter === null && this.props.activeEncounter !== null;
  //   if (hasNewActiveEncounter && this.state.selectedTilePos !== this.props.myCharacter.position) {
  //     this.setState({
  //       selectedTilePos: this.props.myCharacter.position,
  //       selectedPath: [],
  //     });
  //   }
  // }
  /** @override */
  render() {
    // redirect to Home page if not connected
    if (!remoteAppState.get('isConnected')) {
      remoteAppState.set({isInGame: false});
      return <Redirect to='/' />
    }

    // represent "loading" for now
    if (!remoteGameState.isGameReady()) {
      return <div className='color-white bg-secondary flex-auto pad-v-2 flex-center flex-col width-full talign-center'>(waiting for map data)</div>
    }

    const myCharacter = remoteGameState.get('myCharacter');
    const showEncounterModal = remoteGameState.get('showEncounterModal');
    const useZoomedOutMap = remoteGameState.get('useZoomedOutMap');
    const useFullyVisibleMap = remoteGameState.get('useFullyVisibleMap');

    const {
      selectedTilePos,
      selectedPath,
      showModal,
    } = this.state;

    return (
      <div className='bg-secondary flex-auto flex-center flex-col width-full talign-center'>
        {/* Modal */}
        <ModalComponent
          className='flex-col-center color-black bg-white pad-2 mar-v-5'
          style={{
            width: `${MAP_CONTAINER_WIDTH}px`,
            height: '300px',
          }}
          active={showModal}
          onClickOverlay={() => { this.toggleItemModal(false); }}
        >
          <InventoryComponent
            inventory={remoteGameState.get('formattedInventoryList')}
            onClickUseItem={this.onClickUseItem}
          />
        </ModalComponent>

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

        {/* Info Bar */}
        <div className='flex-row-center bg-primary pad-v-1 color-tertiary'>
          <div className='flex-none adjacent-mar-l-2'>
            <FontAwesomeIcon icon={remoteGameState.get('isMyTurn') ? faPlay : faPause} />
          </div>

          <div className='flex-none adjacent-mar-l-2' >{`Round ${remoteGameState.get('round')}`}</div>
        </div>

        {/* Map */}
        <TileMapComponent
          isMyTurn={remoteGameState.get('isMyTurn')}
          mapData={remoteGameState.get('mapData')}
          myCharacter={myCharacter}
          onTileClick={this.handleOnTileClick}
          selectedTilePos={selectedTilePos}
          selectedPath={selectedPath}
          tileSize={TILE_SIZE}
          useFullyVisibleMap={useFullyVisibleMap}
          useZoomedOutMap={useZoomedOutMap}
        />

        {/* Action Menu */}
        <div className='flex-row-center'>
          <ButtonComponent
            className='adjacent-mar-l-2'
            theme={BUTTON_THEME.ORANGE}
            onClick={() => { this.toggleItemModal(true); }}
          >
            Items
          </ButtonComponent>

          <ButtonComponent
            className='adjacent-mar-l-2'
            theme={BUTTON_THEME.ORANGE}
            disabled={!this.canMove()}
            onClick={this.handleMoveToOnClick}
          >
            Move To
          </ButtonComponent>
        </div>

        {/* Debugging Tools */}
        { remoteAppState.get('isDevMode') && remoteGameState.get('mapData').length > 0 &&
          <div className='color-white flex-row-center pad-2'>
            <span className='pad-h-2'>{`Selected Tile: (x: ${selectedTilePos.x}, y: ${selectedTilePos.y})`}</span>

            <span>{TILE_TYPES_NAME[remoteGameState.get('mapData')[selectedTilePos.y][selectedTilePos.x].tileType]}</span>
          </div>
        }
      </div>
    )
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
   * check if User can Move to a Tile
   */
  canMove() {
    if (!remoteGameState.get('isMyTurn')) {
      return false;
    }

    // no need to move to same spot
    if (this.isOnSelectedTile()) {
      return false;
    }

    // if we are allowed to move, check if we can actually move to the location we selected
    const {selectedTilePos} = this.state;
    return gamestateHelper.canMyCharacterMoveTo(selectedTilePos);
  }
  /**
   * @returns {Boolean}
   */
  isOnSelectedTile() {
    const myCharacter = remoteGameState.get('myCharacter');
    const {selectedTilePos} = this.state;

    return myCharacter.get('position').equals(selectedTilePos);
  }
  /**
   * Move action
   */
  handleMoveToOnClick() {
    if (!remoteGameState.get('isMyTurn')) {
      return;
    }

    const {selectedTilePos} = this.state;
    connectionManager.socket.emit(SOCKET_EVENT.GAME.TO_SERVER.MOVE_TO, selectedTilePos);

    this.setState({selectedPath: []});
  }
  /**
   * selected an action from the Encounter
   *
   * @param {ChoiceId} choiceId
   */
  onClickChoice(actionData) {
    const activeEncounter = remoteGameState.get('activeEncounter');

    logger.user(`User selected "${actionData.choiceId}" for encounter "${activeEncounter.get('id')}"`);
    connectionManager.socket.emit(SOCKET_EVENT.GAME.TO_SERVER.CHOSE_ACTION, activeEncounter.get('id'), actionData);
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
})
