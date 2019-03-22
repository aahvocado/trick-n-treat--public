import React, { Component, PureComponent } from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser, faHome} from '@fortawesome/free-solid-svg-icons'

import {TILE_SIZE, MAP_HEIGHT, MAP_WIDTH, calculateMapXOffset, calculateMapYOffset} from 'constants/mapConstants';
import {TILE_STYLES, FOG_STYLES, createEntityIconStyles} from 'constants/tileStyles';
import {FOG_TYPES, TILE_TYPES} from 'constants/tileTypes';

/**
 * 2D matrix visualizer
 */
export class TileMapComponent extends Component {
  static defaultProps = {
    /** @type {Point} */
    selectedTilePos: null,
    /** @type {Function} */
    onTileClick: () => {},
  };
  /** @override */
  render() {
    const {
      characters,
      houses,
      fogMapModel,
      tileMapModel,
      myCharacter,
      onTileClick,
      selectedTilePos,
    } = this.props;

    const fogMatrix = fogMapModel.matrix.slice();
    const mapMatrix = tileMapModel.matrix.slice();

    // check if Map has no data yet
    const isEmpty = mapMatrix.length <= 0 || mapMatrix[0].length <= 0;
    if (isEmpty) {
      return <div className='width-full pad-2'>(waiting for map data)</div>
    }

    return (
      <div
        className='flex-col-centered position-relative mar-v-2 mar-h-auto bor-4-primary'
        style={{
          overflow: 'hidden',
          backgroundColor: '#252525',
          height: `${MAP_HEIGHT}px`,
          width: `${MAP_WIDTH}px`,
        }}
      >
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          transition: 'transform 400ms',
          transform: `translate(${calculateMapXOffset(myCharacter.position.x)}px, ${calculateMapYOffset(myCharacter.position.y)}px)`,
        }}>
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
                      isSelected={selectedTilePos !== null && (selectedTilePos.x === col && selectedTilePos.y === row)}
                      isUserHere={isUserHere}
                      onTileClick={onTileClick}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
export default TileMapComponent;
/**
 * a single cell in the Matrix
 */
class TileItemComponent extends Component {
  static defaultProps = {
    /** @type {Array<Character.Object>} */
    charactersHere: [],
    /** @type {Array<House.Object>} */
    housesHere: [],
    /** @type {Boolean} */
    isSelected: false,
    /** @type {Boolean} */
    isUserHere: false,

    /** @type {FogType} */
    fogType: undefined,
    /** @type {TileType} */
    tileType: undefined,

    /** @type {Function} */
    onTileClick: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
    this.handleOnMouseLeave = this.handleOnMouseLeave.bind(this);

    this.handleOnTileClick = this.handleOnTileClick.bind(this);

    this.state = {
      isFocused: false,
    }
  }
  /** @override */
  render() {
    const {
      fogType,
      isSelected,
      isUserHere,
      tileType,
    } = this.props;

    const isHidden = fogType === FOG_TYPES.HIDDEN;
    const isObscured = fogType === FOG_TYPES.PARTIAL;

    // border highlight
    const borderStyles = isSelected ?
      { border: '2px solid white' } :
      { border: isUserHere ? '2px solid black' : '' };

    // make hidden tiles just look like empty tiles
    const modifierStyles = {
      ...TILE_STYLES[isHidden ? TILE_TYPES.EMPTY : tileType],
      ...borderStyles,
    };

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
        onClick={this.handleOnTileClick}
      >
        { isObscured &&
          <div style={FOG_STYLES[FOG_TYPES.PARTIAL]}></div>
        }

        { !isHidden &&
          this.renderEntityIcons()
        }
      </div>
    )
  }
  /**
   * @returns {Array<React.Component>}
   */
  renderEntityIcons() {
    const {
      charactersHere,
      housesHere,
    } = this.props;

    const renderedEntities = [];
    housesHere.forEach((house) => {
      const entityIdx = renderedEntities.length;
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${entityIdx}-key`}
          entityIdx={entityIdx}
          icon={faHome}
        />
      )
    });
    charactersHere.forEach((character) => {
      const entityIdx = renderedEntities.length;
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${character.characterId}-key`}
          entityIdx={entityIdx}
          icon={faUser}
        />
      )
    });

    return renderedEntities;
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
  /**
   *
   */
  handleOnTileClick() {
    const { position } = this.props;
    this.props.onTileClick(position);
  }
}
/**
 * represents an entity that fits on a tile
 */
class MapEntityIconComponent extends PureComponent {
  /** @override */
  render() {
    const {
      entityIdx,
      icon,
    } = this.props;

    return (
      <div
        className='color-primary'
        style={createEntityIconStyles(entityIdx)}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
    )
  }
}
