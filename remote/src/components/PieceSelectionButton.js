import React, { PureComponent } from 'react';

/**
 * page to select the pieces
 */
class PieceSelectionButton extends PureComponent {
  render() {
    return (
      <button
        className='flex-centered pad-2 bor-1 sibling-mar-t-1 bor-1 borcolor-fourth bg-fifth color-white'
        style={{
          width: '150px',
          height: '90px',
        }}
      >
        pick me
      </button>
    )
  }
}

export default PieceSelectionButton;
