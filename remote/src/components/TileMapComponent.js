import React, { Component, PureComponent } from 'react';
import Point from '@studiomoniker/point';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faComment,
  // faCommentSlash,
  faHome,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import {
  MAP_CONTAINER_HEIGHT,
  MAP_CONTAINER_WIDTH,
  calculateMapXOffset,
  calculateMapYOffset,
} from 'constants/mapConstants';
import {TILE_STYLES, FOG_STYLES, createEntityIconStyles} from 'constants/tileStyles';
import {
  FOG_TYPES,
  TILE_TYPES,
  isPartiallyVisibleFog,
  isWalkableTile,
} from 'constants/tileTypes';

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

    /** @type {Boolean} */
    useFullyVisibleMap: false,
    /** @type {Boolean} */
    useZoomedOutMap: false,
  };
  /** @override */
  render() {
    const {
      useFullyVisibleMap,
      useZoomedOutMap,
      mapData,
      myCharacter,
      onTileClick,
      selectedTilePos,
      selectedPath,
      tileSize,
    } = this.props;

    // check if Map has no data yet
    if (mapData === undefined) {
      return <div className='width-full pad-2'>(waiting for map data)</div>
    }

    const mapContainerTransform = useZoomedOutMap ?
      `translate(-${(mapData[0].length * 39) / 2}px, -${(mapData.length * 39.5) / 2}px) scale(${0.2}, ${0.2})` :
      `translate(${calculateMapXOffset(myCharacter.position.x)}px, ${calculateMapYOffset(myCharacter.position.y)}px)`;

    return (
      <div
        className='flex-col-centered position-relative mar-v-2 mar-h-auto bor-4-primary'
        style={{
          overflow: 'hidden',
          backgroundColor: '#252525',
          height: `${MAP_CONTAINER_HEIGHT}px`,
          width: `${MAP_CONTAINER_WIDTH}px`,
          flex: '0 0 auto',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          transition: 'transform 400ms',
          transform: mapContainerTransform,
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
                      fogType={useFullyVisibleMap ? FOG_TYPES.VISIBLE : tileData.fogType}
                      tileSize={tileSize}
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
export class TileItemComponent extends Component {
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
    /** @type {Number} */
    tileSize: 15,

    /** @type {Boolean} */
    isSelected: false,
    /** @type {Boolean} */
    isTooFar: false,
    /** @type {Boolean} */
    isUserHere: false,
    /** @type {Function} */
    onTileClick: () => {},
    /** @type {Function} */
    onTileHover: () => {},
    /** @type {Function} */
    onTileLeave: () => {},
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
      tileSize,
      tileType,
    } = this.props;

    const isHidden = fogType === FOG_TYPES.HIDDEN;
    const isPartiallyVisible = isPartiallyVisibleFog(fogType);

    // border highlight
    const borderStyles = isSelected ?
      { border: (!isWalkableTile(tileType) || isTooFar) ? '1px solid #ff4747' : '2px solid #0cd2ff' } :
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
          width: `${tileSize}px`,
          height: `${tileSize}px`,
          boxSizing: 'border-box',
          ...modifierStyles,
        }}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        onClick={this.handleOnTileClick}
      >
        { isPartiallyVisible &&
          <div style={FOG_STYLES[fogType]}></div>
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
      encounterHere,
      houseHere,
    } = this.props;

    const renderedEntities = [];

     if (encounterHere !== undefined) {
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${renderedEntities.length}-key`}
          entityIdx={renderedEntities.length}
          icon={faComment}
        />
      )
    };

    if (houseHere !== undefined) {
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${renderedEntities.length}-key`}
          entityIdx={renderedEntities.length}
          icon={faHome}
        />
      )
    };

    charactersHere.forEach((character) => {
      renderedEntities.push(
        <MapEntityIconComponent
          key={`entity-icon-${character.characterId}-key`}
          entityIdx={renderedEntities.length}
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
    this.setState({ isFocused: true });

    const { position } = this.props;
    this.props.onTileHover(position);
  }
  /**
   *
   */
  handleOnMouseLeave() {
    this.setState({ isFocused: false });

    const { position } = this.props;
    this.props.onTileLeave(position);
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
