import React, { PureComponent } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPause, faRunning} from '@fortawesome/free-solid-svg-icons'

import {BasicButtonComponent} from 'components/ButtonComponent';
import TileMapComponent from 'components/TileMapComponent';

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
      myUser,
    } = this.props;
    const {
      selectedTilePos,
    } = this.state;

    if (gamestate === undefined) {
      return <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>(waiting for map data)</div>
    }

    const isMyTurn = remoteAppStateUtils.isMyTurn();

    return (
      <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>
        <TileMapComponent
          myCharacter={myCharacter}
          onTileClick={this.handleOnTileClick}
          selectedTilePos={selectedTilePos}
          {...gamestate}
        />

        <div className='flex-row-centered mar-b-2'>
          <div className={`fsize-5 flex-none pad-2 sibling-mar-l-1 ${isMyTurn ? 'color-white' : 'color-tertiary'}`}>
            <FontAwesomeIcon icon={isMyTurn ? faRunning : faPause} />
          </div>

          <BasicButtonComponent
            disabled={!this.canMove()}
            onClick={this.handleMoveToOnClick}
          >
            Move To
          </BasicButtonComponent>

          <BasicButtonComponent
            disabled={!myUser.canTrick}
            onClick={this.handleTrickOnClick}
          >
            Trick
          </BasicButtonComponent>

          <BasicButtonComponent
            disabled={!myUser.canTreat}
            onClick={this.handleTreatOnClick}
          >
            Treat
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

  }
  /**
   * Treat
   */
  handleTreatOnClick() {

  }
}

export default UserGamePage;
