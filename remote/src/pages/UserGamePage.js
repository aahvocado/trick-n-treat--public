import React, { PureComponent } from 'react';

import {BasicButtonComponent} from 'components/ButtonComponent';
import TileMapComponent from 'components/TileMapComponent';

import {SOCKET_EVENTS} from 'constants/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import * as matrixUtils from 'utilities/matrixUtils.remote';

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

    return (
      <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>
        <TileMapComponent
          myCharacter={myCharacter}
          onTileClick={this.handleOnTileClick}
          selectedTilePos={selectedTilePos}
          {...gamestate}
        />

        <div className='flex-row-center mar-b-2'>
          <BasicButtonComponent
            disabled={!this.canMove(selectedTilePos)}
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
   * determines if user can move to given position
   */
  canMove(position) {
    if (position === null) {
      return false;
    }

    const {
      myCharacter,
    } = this.props;

    const mapMatrix = this.props.gamestate.tileMapModel.matrix;
    const tileDistance = matrixUtils.getDistanceBetween(mapMatrix, myCharacter.position, position);

    if (tileDistance > myCharacter.movement) {
      return false;
    }

    return true;
  }
  /**
   * Move action
   */
  handleOnTileClick(tilePosition) {
    this.setState({selectedTilePos: tilePosition});
  }
  /**
   * Move action
   */
  handleMoveToOnClick() {
    const {selectedTilePos} = this.state;
    const canMove = this.canMove(selectedTilePos);
    if (!canMove) {
      return;
    }

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
