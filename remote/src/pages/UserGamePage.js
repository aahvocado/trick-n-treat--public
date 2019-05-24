import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import Point from '@studiomoniker/point';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faBacon,
  faCircle,
  faDove,
  faHeart,
  faPause,
  faPlay,
  faRunning,
} from '@fortawesome/free-solid-svg-icons'

import {
  TILE_TYPES_NAME,
} from 'constants.shared/tileTypes';
import {
  TILE_SIZE,
} from 'constants/mapConstants';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import ModalComponent from 'common-components/ModalComponent';

import InventoryComponent from 'components/InventoryComponent';
import TileMapComponent from 'components/TileMapComponent';
import EncounterModalComponent from 'components/EncounterModalComponent';

import {MAP_CONTAINER_WIDTH} from 'constants/mapConstants';

import {CLIENT_ACTIONS} from 'constants.shared/clientActions';
import {SOCKET_EVENTS} from 'constants.shared/socketEvents';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

import * as remoteAppStateHelper from 'helpers/remoteAppStateHelper';
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
      this.handleTrickOnClick = this.handleTrickOnClick.bind(this);
      this.handleTreatOnClick = this.handleTreatOnClick.bind(this);
      this.onClickEncounterAction = this.onClickEncounterAction.bind(this);

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
      if (!remoteAppState.get('isConnected')) {
        remoteAppState.set({isInGame: false});
        return <Redirect to='/' />
      }
      const canUseActions = remoteAppStateHelper.canUseActions();
      const myCharacter = remoteAppState.get('myCharacter');

      const gamestate = remoteGameState.get('gamestate');
      const activeEncounter = remoteGameState.get('activeEncounter');
      const useZoomedOutMap = remoteGameState.get('useZoomedOutMap');
      const useFullyVisibleMap = remoteGameState.get('useFullyVisibleMap');

      const {
        selectedTilePos,
        selectedPath,
        showModal,
      } = this.state;

      if (gamestate === undefined) {
        return <div className='color-white bg-secondary flex-auto pad-v-2 flex-center flex-col width-full talign-center'>(waiting for map data)</div>
      }

      const hasActiveEncounter = activeEncounter !== null;

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
              inventory={myCharacter.inventory}
              onClickUseItem={this.onClickUseItem}
            />
          </ModalComponent>

          {/* Encounter Modal */}
          <EncounterModalComponent
            // -- modal props
            active={hasActiveEncounter}

            // -- encounter props
            {...activeEncounter}
            onClickAction={this.onClickEncounterAction}
          />

          {/* Stat Bar */}
          <div className='color-white flex-row-center pad-v-1'>
            <span className='adjacent-mar-l-2'>
              <FontAwesomeIcon icon={faHeart} />
              <span className='fsize-5 mar-l-1'>{myCharacter.health}</span>
            </span>

            <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

            <span className='adjacent-mar-l-2'>
              <FontAwesomeIcon icon={faRunning} />
              <span className='fsize-5 mar-l-1'>{myCharacter.movement}</span>
            </span>

            <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

            <span className='adjacent-mar-l-2'>
              <FontAwesomeIcon icon={faBacon} />
              <span className='fsize-5 mar-l-1'>{myCharacter.candies}</span>
            </span>

            <FontAwesomeIcon className='adjacent-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

            <span className='adjacent-mar-l-2'>
              <FontAwesomeIcon icon={faDove} />
              <span className='fsize-5 mar-l-1'>{myCharacter.sanity}</span>
            </span>
          </div>

          {/* Info Bar */}
          <div className='flex-row-center bg-primary pad-v-1 color-tertiary'>
            <div className='flex-none adjacent-mar-l-2'>
              <FontAwesomeIcon icon={canUseActions ? faPlay : faPause} />
            </div>

            <div className='flex-none adjacent-mar-l-2' >{`Round ${gamestate.round}`}</div>
          </div>

          {/* Map */}
          <TileMapComponent
            mapData={gamestate.mapData}
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
          { remoteAppState.get('isDevMode') &&
            <div className='color-white flex-row-center pad-2'>
              <span className='pad-h-2'>{`Selected Tile: (x: ${selectedTilePos.x}, y: ${selectedTilePos.y})`}</span>

              <span>{TILE_TYPES_NAME[gamestate.mapData[selectedTilePos.y][selectedTilePos.x].tileType]}</span>
            </div>
          }
        </div>
      )
    }
    /**
     * selection of a Tile
     */
    handleOnTileClick(tilePosition) {
      const myCharacter = remoteAppState.get('myCharacter');

      const aStarPath = mapUtils.getAStarPath(gamestateHelper.getVisibileTileMapData(), myCharacter.position, tilePosition);

      this.setState({
        selectedTilePos: tilePosition,
        selectedPath: aStarPath,
      });
    }
    /**
     * check if User can Move to a Tile
     */
    canMove() {
      if (!remoteAppStateHelper.canUseActions()) {
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
      const myCharacter = remoteAppState.get('myCharacter');
      const {selectedTilePos} = this.state;

      return myCharacter.position.equals(selectedTilePos);
    }
    /**
     * @returns {Boolean}
     */
    canTrick() {
      if (!remoteAppStateHelper.canUseActions()) {
        return false;
      }

      // can only action when on the Tile
      if (!this.isOnSelectedTile()) {
        return false;
      }

      return gamestateHelper.canMyUserTrick();
    }
    /**
     * @returns {Boolean}
     */
    canTreat() {
      if (!remoteAppStateHelper.canUseActions()) {
        return false;
      }

      // can only action when on the Tile
      if (!this.isOnSelectedTile()) {
        return false;
      }

      return gamestateHelper.canMyUserTreat();
    }
    /**
     * Move action
     */
    handleMoveToOnClick() {
      if (!remoteAppStateHelper.canUseActions()) {
        return;
      }

      const {selectedTilePos} = this.state;
      connectionManager.socket.emit(CLIENT_ACTIONS.MOVE.TO, selectedTilePos);

      this.setState({selectedPath: []});
    }
    /**
     * Trick
     */
    handleTrickOnClick() {
      if (this.canTrick()) {
        logger.user('user Tricked');
        connectionManager.socket.emit(SOCKET_EVENTS.GAME.ACTION, CLIENT_ACTIONS.TRICK);
      }
    }
    /**
     * Treat
     */
    handleTreatOnClick() {
      if (this.canTreat()) {
        logger.user('user Treated');
        connectionManager.socket.emit(SOCKET_EVENTS.GAME.ACTION, CLIENT_ACTIONS.TREAT);
      }
    }
    /**
     * selected an action from the Encounter
     *
     * @param {ActionId} actionId
     */
    onClickEncounterAction(actionData) {
      const activeEncounter = remoteGameState.get('activeEncounter');

      logger.user(`User selected "${actionData.actionId}" for encounter "${activeEncounter.id}"`);
      connectionManager.socket.emit(CLIENT_ACTIONS.CHOICE, activeEncounter.id, actionData);
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
      connectionManager.socket.emit(CLIENT_ACTIONS.USE_ITEM, itemData);
    }
  }
)
