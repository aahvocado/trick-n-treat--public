import React, { Component } from 'react';

import {TILE_SIZE, TILE_STYLES, FOG_STYLES} from 'constants/tileStyles';
import {FOG_TYPES, TILE_TYPES} from 'constants/tileTypes';

/**
 * 2D matrix visualizer
 */
export class TileMapComponent extends Component {
  /** @override */
  render() {
    const {
      mapMatrix,
      fogMatrix,
    } = this.props;

    // check if Map has no data yet
    const isEmpty = mapMatrix.length <= 0 || mapMatrix[0].length <= 0;
    if (isEmpty) {
      return <div className='pad-2'>(waiting for map data)</div>
    }

    return (
      <div className='flex-col-centered position-relative mar-v-2 mar-h-auto bor-4-primary'>
        { mapMatrix.map((innerMatrix, row) => {
          return (
            <div className='flex-row' key={`tile-map-row-${row}-key`} >
              { innerMatrix.map((tileType, col) => {
                return (
                  <TileItemComponent
                    key={`tile-item-${col}-${row}-key`}
                    tileType={tileType}
                    fogType={fogMatrix[row][col]}
                    pos={{row, col}}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }
}

/**
 * a single cell in the Matrix
 */
class TileItemComponent extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
    this.handleOnMouseLeave = this.handleOnMouseLeave.bind(this)

    this.state = {
      isFocused: false,
    }
  }
  /** @override */
  render() {
    const { fogType, tileType, pos } = this.props;
    const { isFocused } = this.state;

    // make hidden tiles just look like empty tiles
    const isHidden = fogType === FOG_TYPES.HIDDEN;
    const modifierStyles = isHidden ? TILE_STYLES[TILE_TYPES.EMPTY] : {
      ...TILE_STYLES[tileType],
      ...FOG_STYLES[fogType],
    }

    return (
      <div
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          boxSizing: 'border-box',
          ...modifierStyles,
        }}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
      >
        { isFocused &&
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              pointerEncounters: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '4px',
              color: 'white',
            }}
          >
            {`${pos.col}, ${pos.row}`}
          </span>
        }
      </div>
    )
  }
  /**
   *
   */
  handleOnMouseEnter() {
    this.setState({ isFocused: true })
  }
  /**
   *
   */
  handleOnMouseLeave() {
    this.setState({ isFocused: false })
  }
}

export default TileMapComponent;
