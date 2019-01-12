import React, { PureComponent } from 'react';

import CharacterComponent from '../components/CharacterComponent';

/**
 * page to select the pieces
 */
export class PlayerGamePage extends PureComponent {
  render() {
    return (
      <div className='bg-secondary flex-grow pad-v-2 flex-centered flex-col width-full text-center'>
        <CharacterComponent />
      </div>
    )
  }
}


export default PlayerGamePage;
