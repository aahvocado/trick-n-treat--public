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

import {BasicButtonComponent} from 'components/ButtonComponent';
import TileMapComponent from 'components/TileMapComponent';

import {CLIENT_ACTIONS} from 'constants/clientActions';
import {SOCKET_EVENTS} from 'constants/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import * as gamestateUtils from 'utilities/gamestateUtils.remote';
import * as remoteAppStateUtils from 'utilities/remoteAppStateUtils';

/**
 * page to select the pieces
 */
class UserGamePage extends PureComponent {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnTileClick = this.handleOnTileClick.bind(this);

    this.handleMoveToOnClick = this.handleMoveToOnClick.bind(this);
    this.handleTrickOnClick = this.handleTrickOnClick.bind(this);
    this.handleTreatOnClick = this.handleTreatOnClick.bind(this);

    this.state = {
      selectedTilePos: null,
    }
  }
  /** @override */
  render() {
    const {
      gamestate,
      myCharacter,
    } = this.props;
    const {
      selectedTilePos,
    } = this.state;

    if (gamestate === undefined) {
      return <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>(waiting for map data)</div>
    }

    const isMyTurn = remoteAppStateUtils.isMyTurn();

    return (
      <div className='bg-secondary flex-grow flex-centered flex-col width-full text-center'>
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

        <div className='flex-row-centered bg-primary pad-v-1'>
          <div className='flex-none sibling-mar-l-2 color-tertiary'>
            <FontAwesomeIcon icon={isMyTurn ? faPlay : faPause} />
          </div>

          <div className='flex-none sibling-mar-l-2 color-tertiary' >{`Round ${gamestate.round}`}</div>
        </div>

        <TileMapComponent
          myCharacter={myCharacter}
          onTileClick={this.handleOnTileClick}
          selectedTilePos={selectedTilePos}
          {...gamestate}
        />

        <div className='flex-row-centered mar-b-4'>
          <BasicButtonComponent
            disabled={!this.canTrick()}
            onClick={this.handleTrickOnClick}
          >
            Trick
          </BasicButtonComponent>

          <BasicButtonComponent
            disabled={!this.canTreat()}
            onClick={this.handleTreatOnClick}
          >
            Treat
          </BasicButtonComponent>

          <FontAwesomeIcon className='sibling-mar-l-1 fsize-2 color-tertiary' icon={faCircle} />

          <BasicButtonComponent
            disabled={!this.canMove()}
            onClick={this.handleMoveToOnClick}
          >
            Move To
          </BasicButtonComponent>
        </div>
      </div>
    )
  }
  /**
   * selection of a Tile
   */
  handleOnTileClick(tilePosition) {
    this.setState({selectedTilePos: tilePosition});
  }
  /**
   * check if User can Move to a Tile
   */
  canMove() {
    const {selectedTilePos} = this.state;
    if (selectedTilePos === null) {
      return false;
    }

    if (!remoteAppStateUtils.isMyTurn()) {
      return false;
    }

    return gamestateUtils.canMyCharacterMoveTo(selectedTilePos);
  }
  /**
   * @returns {Boolean}
   */
  isOnSelectedTile() {
    const {selectedTilePos} = this.state;
    if (selectedTilePos === null) {
      return false;
    }

    const {myCharacter} = this.props;
    const position = myCharacter.position;
    return position.x === selectedTilePos.x && position.y === selectedTilePos.y;
  }
  /**
   * @returns {Boolean}
   */
  canTrick() {
    if (!this.isOnSelectedTile()) {
      return false;
    }

    if (!remoteAppStateUtils.isMyTurn()) {
      return false;
    }

    return gamestateUtils.canMyUserTrick();
  }
  /**
   * @returns {Boolean}
   */
  canTreat() {
    if (!this.isOnSelectedTile()) {
      return false;
    }

    if (!remoteAppStateUtils.isMyTurn()) {
      return false;
    }

    return gamestateUtils.canMyUserTreat();
  }
  /**
   * Move action
   */
  handleMoveToOnClick() {
    if (!this.canMove()) {
      return;
    }

    const {selectedTilePos} = this.state;
    connectionManager.socket.emit(SOCKET_EVENTS.GAME.MOVE_TO, selectedTilePos);
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
}

export default UserGamePage;
