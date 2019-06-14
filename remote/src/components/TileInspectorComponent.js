import React, {PureComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons'

import {TILE_TYPES_NAME} from 'constants.shared/tileTypes';

/**
 *
 */
export default class TileInspectorContainer extends PureComponent {
  render() {
    const {
      tileData,
      style,
    } = this.props;

    const {
      charactersHere = [],
      encounterHere,
      lightLevel,
      position,
      tileType,
    } = tileData;

    return (
      <div className='position-absolute zindex-1 pad-2 pevents-none flex-row-center color-white'
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          ...style,
        }}
      >
        <FontAwesomeIcon className='flex-none aself-start adjacent-mar-l-2' icon={faSearch} />

        <div className='flex-col flex-auto aitems-start adjacent-mar-l-2'>
          <div className='adjacent-mar-t-1'>{`Position: ${position.x}, ${position.y}`}</div>
          <div className='adjacent-mar-t-1'>{`Tile Type: ${TILE_TYPES_NAME[tileType]}`}</div>
          <div className='adjacent-mar-t-1'>{`Light Level: ${lightLevel}`}</div>
          <div className='adjacent-mar-t-1'>{`Characters: ${charactersHere.length}`}</div>
          <div className='adjacent-mar-t-1'>{`Has Encounter: ${encounterHere !== undefined}`}</div>
        </div>
      </div>
    )
  }
}
