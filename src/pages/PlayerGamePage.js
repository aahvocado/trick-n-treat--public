import React, { PureComponent } from 'react';

import PieceSelectionButton from 'components/PieceSelectionButton';

/**
 * page to select the pieces
 */
class PlayerGamePage extends PureComponent {
  render() {
    return (
      <div className='bg-secondary flex-grow pad-2 flex-centered flex-col width-full text-center'>
        <h2 className='fsize-5 color-white sibling-mar-t-2'>select your piece</h2>

        <div className='bg-tertiary pad-2 flex-centered flex-col sibling-mar-t-2'>
          <PieceSelectionButton />
          <PieceSelectionButton />
          <PieceSelectionButton />
        </div>
      </div>
    )
  }
}

export default PlayerGamePage;
