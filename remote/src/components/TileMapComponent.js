import React, { Component, PureComponent } from 'react';
import Point from '@studiomoniker/point';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faComment,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import {
  MAP_CONTAINER_HEIGHT,
  MAP_CONTAINER_WIDTH,
  calculateMapXOffset,
  calculateMapYOffset,
} from 'constants/mapConstants';

import * as tileStyleUtils from 'utilities/tileStyleUtils';
import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';

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
    isMyTurn: false,

    /** @type {Boolean} */
    useFullyVisibleMap: false,
    /** @type {Boolean} */
    useZoomedOutMap: false,
  };
  /** @override */
  render() {
    const {
      isMyTurn,
      mapData,
      myCharacter,
      onTileClick,
      selectedTilePos,
      selectedPath,
      tileSize,
      useFullyVisibleMap,
      useZoomedOutMap,
    } = this.props;

    const charPosition = myCharacter.get('position');
    const mapContainerTransform = useZoomedOutMap ?
      `translate(-${(mapData[0].length * 39) / 2}px, -${(mapData.length * 39.5) / 2}px) scale(${0.2}, ${0.2})` :
      `translate(${calculateMapXOffset(charPosition.x)}px, ${calculateMapYOffset(charPosition.y)}px)`;

    return (
      <div
        className='overflow-hidden flex-none flex-col-center position-relative mar-v-2 mar-h-auto'
        style={{
          backgroundColor: '#252525',
          border: isMyTurn ? '5px solid #33487b' : '5px solid #c17e36',
          height: `${MAP_CONTAINER_HEIGHT}px`,
          width: `${MAP_CONTAINER_WIDTH}px`,
        }}
      >
        {/** inner container */}
        <div
          className='position-absolute'
          style={{
            top: '0',
            left: '0',
            transition: 'transform 400ms',
            transform: mapContainerTransform,
          }}
        >
          { mapData.map((mapRowData, rowIdx) => {
            return (
              <div className='flex-row' key={`tile-map-row-${rowIdx}-key`} >
                { mapRowData.map((tileData, colIdx) => {
                  // is `myCharacter` one of the characters on this tile`
                  const isUserHere = tileData.charactersHere.some((character) => (character.position.x === charPosition.x && character.position.y === charPosition.y))

                  // assuming the path is in order, finding the index of this point on the path will tell us how far it is
                  const distanceFromMyCharacter = selectedPath.findIndex((pathPoint) => (pathPoint.equals(tileData.position)));

                  // tile is considered selected if it is the `selectedTilePos`, or is in the path
                  const isSelected = (selectedTilePos !== null && selectedTilePos.equals(tileData.position)) || distanceFromMyCharacter >= 0;

                  return (
                    <TileItemComponent
                      key={`tile-item-${colIdx}-${rowIdx}-key`}
                      {...tileData}
                      lightLevel={useFullyVisibleMap ? 10 : tileData.lightLevel}
                      tileSize={tileSize}
                      position={tileData.position}
                      isSelected={isSelected}
                      isTooFar={distanceFromMyCharacter > myCharacter.get('movement') || (!isUserHere && selectedPath.length === 0)}
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
    /** @type {Point} */
    position: new Point(),

    /** @type {LightLevel} */
    lightLevel: undefined,
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
      lightLevel,
      isTooFar,
      isSelected,
      isUserHere,
      tileSize,
      tileType,
    } = this.props;

    const isMostlyHidden = lightLevelUtils.isMostlyHidden(lightLevel);

    // make hidden tiles just look like empty tiles
    const tileStyles = tileStyleUtils.createTileStyles({
      lightLevel,
      isTooFar,
      isSelected,
      isUserHere,
      tileSize,
      tileType,
    });

    return (
      <div
        className='position-relative boxsizing-border'
        style={tileStyles}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        onClick={this.handleOnTileClick}
      >
        { !isMostlyHidden &&
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
        style={tileStyleUtils.createEntityIconStyles(entityIdx)}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
    )
  }
}
