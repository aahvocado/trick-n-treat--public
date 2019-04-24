import React, { PureComponent } from 'react';

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
} from 'constants/tileTypes';
import {
  TILE_SIZE,
} from 'constants/mapConstants';

import ButtonComponent from 'common-components/ButtonComponent';

import TileMapComponent from 'components/TileMapComponent';
import EncounterModalComponent from 'components/EncounterModalComponent';

import {CLIENT_ACTIONS} from 'constants/clientActions';
import {SOCKET_EVENTS} from 'constants/socketEvents';

import remoteAppState from 'data/remoteAppState';

import * as gamestateHelper from 'helpers/gamestateHelper.remote';

import * as connectionManager from 'managers/connectionManager';

import * as mapUtils from 'utilities/mapUtils.remote';

/**
 * remote page for the game
 */
class UserGamePage extends PureComponent {
  static defaultProps = {
    /** @type {Boolean} */
    canUseActions: false,

    // -- from appState
    /** @type {GamestateObject | undefined} */
    gamestate: undefined,
    /** @type {Object | undefined} */
    myCharacter: undefined,
    /** @type {Object | undefined} */
    myUser: undefined,
    /** @type {EncounterData | null} */
    activeEncounter: null,
  };
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnTileClick = this.handleOnTileClick.bind(this);

    this.handleMoveToOnClick = this.handleMoveToOnClick.bind(this);
    this.handleTrickOnClick = this.handleTrickOnClick.bind(this);
    this.handleTreatOnClick = this.handleTreatOnClick.bind(this);
    this.onClickEncounterAction = this.onClickEncounterAction.bind(this);

    this.onClickToggleZoom = this.onClickToggleZoom.bind(this);
    this.onClickToggleVisibility = this.onClickToggleVisibility.bind(this);

    this.state = {
      /** @type {Boolean} */
      showModal: false,

      /** @type {Boolean} */
      isFullyVisible: false,
      /** @type {Boolean} */
      isZoomedOut: false,

      /** @type {Point} */
      selectedTilePos: props.myCharacter.position,
      /** @type {Path} */
      selectedPath: [],
    }
  }
  /** @override */
  componentDidUpdate(prevProps, prevState) {
    const hasNewActiveEncounter = prevProps.activeEncounter === null && this.props.activeEncounter !== null;
    if (hasNewActiveEncounter && this.state.selectedTilePos !== this.props.myCharacter.position) {
      this.setState({
        selectedTilePos: this.props.myCharacter.position,
        selectedPath: [],
      });
    }
  }
  /** @override */
  render() {
    const {
      activeEncounter,
      canUseActions,
      gamestate,
      myCharacter,
    } = this.props;

    const {
      isFullyVisible,
      isZoomedOut,
      selectedTilePos,
      selectedPath,
    } = this.state;

    if (gamestate === undefined) {
      return <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>(waiting for map data)</div>
    }

    const hasActiveEncounter = activeEncounter !== null;

    return (
      <div className='bg-secondary flex-grow flex-centered flex-col width-full text-center'>
        {/* Modal */}
        <EncounterModalComponent
          // -- modal props
          active={hasActiveEncounter}

          // -- encounter props
          {...activeEncounter}
          onClickAction={this.onClickEncounterAction}
        />

        {/* Stat Bar */}
        <div className='flex-row-centered pad-v-1'>
          <span className='sibling-mar-l-2'>
            <FontAwesomeIcon icon={faHeart} />
            <span className='fsize-5 mar-l-1'>{myCharacter.health}</span>
          </span>

          <FontAwesomeIcon className='sibling-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='sibling-mar-l-2'>
            <FontAwesomeIcon icon={faRunning} />
            <span className='fsize-5 mar-l-1'>{myCharacter.movement}</span>
          </span>

          <FontAwesomeIcon className='sibling-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='sibling-mar-l-2'>
            <FontAwesomeIcon icon={faBacon} />
            <span className='fsize-5 mar-l-1'>{myCharacter.candies}</span>
          </span>

          <FontAwesomeIcon className='sibling-mar-l-2 fsize-1 color-tertiary' icon={faCircle} />

          <span className='sibling-mar-l-2'>
            <FontAwesomeIcon icon={faDove} />
            <span className='fsize-5 mar-l-1'>{myCharacter.sanity}</span>
          </span>
        </div>

        {/* Info Bar */}
        <div className='flex-row-centered bg-primary pad-v-1 color-tertiary'>
          <div className='flex-none sibling-mar-l-2'>
            <FontAwesomeIcon icon={canUseActions ? faPlay : faPause} />
          </div>

          <div className='flex-none sibling-mar-l-2' >{`Round ${gamestate.round}`}</div>
        </div>

        {/* Map */}
        <TileMapComponent
          isFullyVisible={isFullyVisible}
          isZoomedOut={isZoomedOut}
          mapData={gamestate.mapData}
          myCharacter={myCharacter}
          onTileClick={this.handleOnTileClick}
          selectedTilePos={selectedTilePos}
          selectedPath={selectedPath}
          tileSize={TILE_SIZE}
        />

        {/* Action Menu */}
        <div className='flex-row-centered mar-b-4'>
          <FontAwesomeIcon className='sibling-mar-l-1 fsize-2 color-tertiary' icon={faCircle} />

          <ButtonComponent
            disabled={!this.canMove()}
            onClick={this.handleMoveToOnClick}
          >
            Move To
          </ButtonComponent>
        </div>

        {/* Debugging Tools */}
        { remoteAppState.get('isDevMode') &&
          <div className='flex-col-centered'>
            <span>Dev Tools</span>

            <div className='flex-row-centered pad-2'>
              <span>Selected Tile: </span>

              <span className='pad-h-2'>{`( x: ${selectedTilePos.x}, y: ${selectedTilePos.y} )`}</span>

              <span>{TILE_TYPES_NAME[gamestate.mapData[selectedTilePos.y][selectedTilePos.x].tileType]}</span>
            </div>

            <div className='flex-row-centered mar-b-4'>
              <ButtonComponent
                className='fsize-3 pad-2 sibling-mar-l-1'
                onClick={this.onClickToggleZoom}
              >
                Toggle Zoom
              </ButtonComponent>

              <ButtonComponent
                className='fsize-3 pad-2 sibling-mar-l-1'
                onClick={this.onClickToggleVisibility}
              >
                Toggle Visibility
              </ButtonComponent>

              <ButtonComponent
                className='fsize-3 pad-2 sibling-mar-l-1'
                onClick={this.onClickSwitchToEditor}
              >
                Switch To Editor
              </ButtonComponent>
            </div>
          </div>
        }
      </div>
    )
  }
  /**
   * selection of a Tile
   */
  handleOnTileClick(tilePosition) {
    const { myCharacter } = this.props;

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
    const {canUseActions} = this.props;
    if (!canUseActions) {
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
    const {myCharacter} = this.props;
    const {selectedTilePos} = this.state;

    return myCharacter.position.equals(selectedTilePos);
  }
  /**
   * @returns {Boolean}
   */
  canTrick() {
    const {canUseActions} = this.props;
    if (!canUseActions) {
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
    const {canUseActions} = this.props;
    if (!canUseActions) {
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
    const {canUseActions} = this.props;
    if (!canUseActions) {
      return;
    }

    const {selectedTilePos} = this.state;
    connectionManager.socket.emit(SOCKET_EVENTS.GAME.MOVE_TO, selectedTilePos);

    this.setState({selectedPath: []});
  }
  /**
   * Trick
   */
  handleTrickOnClick() {
    if (this.canTrick()) {
      connectionManager.socket.emit(SOCKET_EVENTS.GAME.ACTION, CLIENT_ACTIONS.TRICK);
    }
  }
  /**
   * Treat
   */
  handleTreatOnClick() {
    if (this.canTreat()) {
      connectionManager.socket.emit(SOCKET_EVENTS.GAME.ACTION, CLIENT_ACTIONS.TREAT);
    }
  }
  /**
   *
   */
  onClickToggleZoom() {
    const { isZoomedOut } = this.state;
    this.setState({isZoomedOut: !isZoomedOut});
  }
  /**
   *
   */
  onClickSwitchToEditor() {
    remoteAppState.set({isDebugMode: true});
  }
  /**
   *
   */
  onClickToggleVisibility() {
    const { isFullyVisible } = this.state;
    this.setState({isFullyVisible: !isFullyVisible});
  }
  /**
   * selected an action from the Encounter
   *
   * @param {ActionId} actionId
   */
  onClickEncounterAction(actionId) {
    connectionManager.socket.emit(SOCKET_EVENTS.GAME.ENCOUNTER_ACTION_CHOICE, actionId);
  }
}

export default UserGamePage;
