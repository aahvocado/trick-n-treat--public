import React, { PureComponent } from 'react';

import TileMapComponent from 'components/TileMapComponent';

/**
 * page to select the pieces
 */
class UserGamePage extends PureComponent {
  /** @override */
  render() {
    const {gamestate} = this.props;

    if (gamestate === undefined) {
      return <div>no game has started</div>
    }

    return (
      <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>
        <TileMapComponent
          mapMatrix={gamestate.tileMapModel.matrix}
          fogMatrix={gamestate.fogMapModel.matrix}
        />
      </div>
    )
  }
}

export default UserGamePage;
