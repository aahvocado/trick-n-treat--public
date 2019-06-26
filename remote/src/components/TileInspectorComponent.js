import React, {PureComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons'

import {TILE_ID_MAP} from 'constants.shared/tileIds';

/**
 *
 */
export default class TileInspectorComponent extends PureComponent {
  render() {
    const {
      tileData = {},
      style,
    } = this.props;

    if (tileData === null) {
      return (
        <div className='position-absolute zindex-1 pad-2 pevents-none flex-row-center color-white'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            ...style,
          }}
        >
          null data
        </div>
      )
    }

    const {
      charactersHere = [],
      encounterHere,
      lightLevel,
      point,
      region,
      tile,
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
          <div className='adjacent-mar-t-1'>{`Position: ${point.x}, ${point.y}`}</div>
          <div className='adjacent-mar-t-1'>{`Tile Type: ${TILE_ID_MAP[tile]}`}</div>
          <div className='adjacent-mar-t-1'>{`Region: ${region}`}</div>
          <div className='adjacent-mar-t-1'>{`Light Level: ${lightLevel}`}</div>
          <div className='adjacent-mar-t-1'>{`Characters: ${charactersHere.length}`}</div>
          <div className='adjacent-mar-t-1'>{`Has Encounter: ${encounterHere !== undefined}`}</div>
        </div>
      </div>
    )
  }
}
