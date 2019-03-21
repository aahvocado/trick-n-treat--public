import React, { Component, PureComponent } from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser, faHome} from '@fortawesome/free-solid-svg-icons'

import {TILE_SIZE, TILE_STYLES, FOG_STYLES} from 'constants/tileStyles';
import {FOG_TYPES, TILE_TYPES} from 'constants/tileTypes';

/**
 * 2D matrix visualizer
 */
export class TileMapComponent extends Component {
  /** @override */
  render() {
    const {
      characters,
      houses,
      fogMapModel,
      tileMapModel,
      myCharacter,
    } = this.props;

    const fogMatrix = fogMapModel.matrix;
    const mapMatrix = tileMapModel.matrix;

    // check if Map has no data yet
    const isEmpty = mapMatrix.length <= 0 || mapMatrix[0].length <= 0;
    if (isEmpty) {
      return <div className='width-full pad-2'>(waiting for map data)</div>
    }

    return (
      <div className='flex-col-centered position-relative mar-v-2 mar-h-auto bor-4-primary'>
        { mapMatrix.map((innerMatrix, row) => {
          return (
            <div className='flex-row' key={`tile-map-row-${row}-key`} >
              { innerMatrix.map((tileType, col) => {
                const charactersHere = characters.filter((character) => (character.position.x === col && character.position.y === row));
                const isUserHere = charactersHere.some((character) => (character.position.x === myCharacter.position.x && character.position.y === myCharacter.position.y))
                const housesHere = houses.filter((house) => (house.position.x === col && house.position.y === row));

                return (
                  <TileItemComponent
                    key={`tile-item-${col}-${row}-key`}
                    tileType={tileType}
                    fogType={fogMatrix[row][col]}
                    position={{x: col, y: row}}
                    charactersHere={charactersHere}
                    housesHere={housesHere}
                    isUserHere={isUserHere}
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
export default TileMapComponent;
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
    const {
      charactersHere,
      housesHere,
      fogType,
      isUserHere,
      tileType,
      position,
    } = this.props;
    const { isFocused } = this.state;

    const isHidden = fogType === FOG_TYPES.HIDDEN;
    const isObscured = fogType === FOG_TYPES.PARTIAL;

    const borderStyles = isFocused ?
      { border: '2px solid white' } :
      { border: isUserHere ? '2px solid black' : '' };

    // make hidden tiles just look like empty tiles
    const modifierStyles = {
      ...TILE_STYLES[isHidden ? TILE_TYPES.EMPTY : tileType],
      ...borderStyles,
    };

    const renderedEntities = [];
    housesHere.forEach((house) => {
      const entityIdx = renderedEntities.length;
      renderedEntities.push(
        <HouseMapIconComponent
          key={`entity-icon-${entityIdx}-key`}
          entityIdx={entityIdx}
        />
      )
    });
    charactersHere.forEach((character) => {
      const entityIdx = renderedEntities.length;
      renderedEntities.push(
        <CharacterMapIconComponent
          key={`entity-icon-${character.characterId}-key`}
          entityIdx={entityIdx}
        />
      )
    })

    return (
      <div
        className='position-relative'
        style={{
          width: `${TILE_SIZE}px`,
          height: `${TILE_SIZE}px`,
          boxSizing: 'border-box',
          ...modifierStyles,
        }}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
      >
        { isFocused &&
          <div
            className='flex-col position-absolute pevents-none pad-1 color-white'
          >
            <span>{`x: ${position.x}`}</span>
            <span>{`y: ${position.y}`}</span>
          </div>
        }

        { isObscured &&
          <div style={FOG_STYLES[FOG_TYPES.PARTIAL]}></div>
        }

        { !isHidden && renderedEntities }
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
/**
 * represents a character on the map
 */
class CharacterMapIconComponent extends PureComponent {
  /** @override */
  render() {
    const {
      entityIdx,
    } = this.props;

    const oddOrEven = entityIdx % 2;
    const iconOffsetX = 5 + (TILE_SIZE / 2.2) * oddOrEven;
    const iconOffsetY = 5 + (TILE_SIZE / 2.2) * Math.floor(entityIdx / 2);

    return (
      <div
        className='color-primary'
        style={{
          position: 'absolute',
          left: `${iconOffsetX}px`,
          top: `${iconOffsetY}px`,
        }}
      >
        <FontAwesomeIcon icon={faUser} />
      </div>
    )
  }
}
/**
 * represents a house on the map
 */
class HouseMapIconComponent extends PureComponent {
  /** @override */
  render() {
    const {
      entityIdx,
    } = this.props;

    const oddOrEven = entityIdx % 2;
    const iconOffsetX = 5 + (TILE_SIZE / 2.2) * oddOrEven;
    const iconOffsetY = 5 + (TILE_SIZE / 2.2) * Math.floor(entityIdx / 2);

    return (
      <div
        className='color-primary'
        style={{
          position: 'absolute',
          left: `${iconOffsetX}px`,
          top: `${iconOffsetY}px`,
        }}
      >
        <FontAwesomeIcon icon={faHome} />
      </div>
    )
  }
}
