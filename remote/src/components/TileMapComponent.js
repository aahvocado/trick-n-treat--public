import React, { Component, PureComponent } from 'react';
import Point from '@studiomoniker/point';

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
    /** @type {Matrix} */
    mapData: undefined,
    /** @type {CharacterModel.export} */
    myCharacter: undefined,
    /** @type {Function} */
    onTileClick: () => {},
    /** @type {Point} */
    selectedTilePos: undefined,
    /** @type {Path} */
    selectedPath: [],
  };
  /** @override */
  render() {
    const {
      mapData,
      myCharacter,
      onTileClick,
      selectedTilePos,
      selectedPath,
    } = this.props;

    // check if Map has no data yet
    if (mapData === undefined) {
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
          { mapData.map((mapRowData, rowIdx) => {
            return (
              <div className='flex-row' key={`tile-map-row-${rowIdx}-key`} >
                { mapRowData.map((tileData, colIdx) => {
                  // is `myCharacter` one of the characters on this tile`
                  const isUserHere = tileData.charactersHere.some((character) => (character.position.x === myCharacter.position.x && character.position.y === myCharacter.position.y))

                  // assuming the path is in order, finding the index of this point on the path will tell us how far it is
                  const distanceFromMyCharacter = selectedPath.findIndex((pathPoint) => (pathPoint.equals(tileData.position)));

                  // tile is considered selected if it is the `selectedTilePos`, or is in the path
                  const isSelected = (selectedTilePos !== null && selectedTilePos.equals(tileData.position)) || distanceFromMyCharacter >= 0;

                  return (
                    <TileItemComponent
                      key={`tile-item-${colIdx}-${rowIdx}-key`}
                      {...tileData}
                      position={tileData.position}
                      isSelected={isSelected}
                      isTooFar={distanceFromMyCharacter > myCharacter.movement || (!isUserHere && selectedPath.length === 0)}
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
    /** @type {Array<CharacterModel.export>} */
    charactersHere: [],
    /** @type {EncounterModel.export} */
    encounterHere: undefined,
    /** @type {HouseModel.export} */
    houseHere: undefined,
    /** @type {Point} */
    position: new Point(),
    /** @type {FogType} */
    fogType: undefined,
    /** @type {TileType} */
    tileType: undefined,

    /** @type {Boolean} */
    isSelected: false,
    /** @type {Boolean} */
    isTooFar: false,
    /** @type {Boolean} */
    isUserHere: false,
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
      isTooFar,
      isSelected,
      isUserHere,
      tileType,
    } = this.props;

    const isHidden = fogType === FOG_TYPES.HIDDEN;
    const isObscured = fogType === FOG_TYPES.PARTIAL;

    // border highlight
    const borderStyles = isSelected ?
      { border: isTooFar ? '1px solid #ff4747' : '2px solid #0cd2ff' } :
      { border: isUserHere ? '2px solid yellow' : '' };

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
      houseHere,
    } = this.props;

    const renderedEntities = [];
    if (houseHere !== undefined) {
      const entityIdx = renderedEntities.length;
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${entityIdx}-key`}
          entityIdx={entityIdx}
          icon={faHome}
        />
      )
    };

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
