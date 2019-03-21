import React, { PureComponent } from 'react';

import TileMapComponent from 'components/TileMapComponent';

/**
 * page to select the pieces
 */
class UserGamePage extends PureComponent {
  /** @override */
  render() {
    const {
      gamestate,
      myCharacter,
    } = this.props;

    if (gamestate === undefined) {
      return <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>(waiting for map data)</div>
    }

    return (
      <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>
        <TileMapComponent
          myCharacter={myCharacter}
          {...gamestate}
        />
      </div>
    )
  }
}

export default UserGamePage;
