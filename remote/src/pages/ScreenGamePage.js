import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

import {
  TILE_SIZE,
  SCREEN_MAP_CONTAINER_WIDTH,
  SCREEN_MAP_CONTAINER_HEIGHT,
} from 'constants/styleConstants';

// import ButtonComponent, {BUTTON_THEME} from 'common-components/ButtonComponent';
import SpinnerComponent from 'common-components/SpinnerComponent';

// import EncounterModalComponent from 'components/EncounterModalComponent';
// import GameIconComponent from 'components/GameIconComponent';
import TileInspectorComponent from 'components/TileInspectorComponent';
import TileMapComponent from 'components/TileMapComponent';

import keycodes from 'constants.shared/keycodes';
import {CLIENT_TYPE} from 'constants.shared/clientTypes';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

// import * as connectionManager from 'managers/connectionManager';

// import logger from 'utilities/logger.remote';

/**
 * page for the game
 */
export default observer(
class UserGamePage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.onTileHoverHandler = this.onTileHoverHandler.bind(this);

    this.state = {
      /** @type {Point} */
      hoveredTilePos: null,

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
      return <Redirect to='/home' />
    }

    // if client is a remote, redirect to their appropriate page
    if (remoteAppState.get('isInGame') && remoteAppState.get('clientType') === CLIENT_TYPE.REMOTE) {
      return <Redirect to='/game' />
    }

    // redirect to game complete
    if (remoteGameState.get('isGameComplete') && remoteAppState.get('isInGame')) {
      return <Redirect to='/complete' />
    }

    // show loading
    if (!remoteGameState.get('isActive')) {
      return <div className='color-white bg-secondary flex-auto pad-v-2 flex-col-center width-full'>
        (waiting for map data)
        <SpinnerComponent className='mar-v-3' />
      </div>
    }

    const mapGridModel = remoteGameState.get('mapGridModel');
    const myCharacter = remoteGameState.get('myCharacter');

    const {
      hoveredTilePos,
      isFullyVisibleMap,
      isTileInspecting,
      isZoomedOut,
    } = this.state;

    // const myLocation = remoteGameState.get('myLocation');

    return (
      <div className='bg-secondary flex-auto flex-center flex-col width-full talign-center position-relative'>
        {/* Tile Inspection */}
        { isTileInspecting && hoveredTilePos !== null &&
          <TileInspectorComponent
            style={{left: '10px', top: '70px'}}
            tileData={mapGridModel.getAt(hoveredTilePos).export()}
          />
        }

        {/* Info Bar */}
        <div className='bg-primary pad-v-1 flex-col-center'>
          <div className='flex-none color-tertiary adjacent-mar-t-1' >{`Round ${remoteGameState.get('round')}`}</div>
          <div className='flex-none color-white adjacent-mar-t-1' >{`watching: ${myCharacter.get('name')}`}</div>
        </div>

        {/* Map */}
        <TileMapComponent
          className='bor-5-primary-darker'
          mapGridData={mapGridModel.export().grid}
          myPosition={myCharacter.get('position')}
          myRange={myCharacter.get('movement')}
          focalPoint={myCharacter.get('position')}

          tileSize={TILE_SIZE}
          containerWidth={SCREEN_MAP_CONTAINER_WIDTH}
          containerHeight={SCREEN_MAP_CONTAINER_HEIGHT}
          isFullyVisibleMap={isFullyVisibleMap}
          isZoomedOut={isZoomedOut}
          onTileHover={this.onTileHoverHandler}
        />
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

  }
  /**
   * hovered over a Tile
   */
  onTileHoverHandler(tilePosition) {
    this.setState({hoveredTilePos: tilePosition});
  }
});

