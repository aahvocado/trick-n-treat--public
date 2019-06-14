import React, { Component, PureComponent } from 'react';
import Point from '@studiomoniker/point';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faComment,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import {
  MAP_CONTAINER_WIDTH,
  MAP_CONTAINER_HEIGHT,
} from 'constants/styleConstants';

import combineClassNames from 'utilities/combineClassNames';
import * as tileStyleUtils from 'utilities/tileStyleUtils';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';
import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * 2D matrix visualizer
 */
export default class TileMapComponent extends Component {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'overflow-hidden bg-grayest flex-none flex-col-center position-relative mar-v-2 mar-h-auto',
    /** @type {String} */
    className: '',

    /** @type {Matrix} */
    mapData: undefined,
    /** @type {Point} */
    myPosition: new Point(),
    /** @type {Number} */
    myRange: 0,

    /** @type {Function} */
    onTileClick: () => {},
    /** @type {Point} */
    focalPoint: new Point(),
    /** @type {Point} */
    selectedTilePos: undefined,
    /** @type {Path} */
    selectedPath: [],

    /** @type {Number} */
    tileSize: 15,
    /** @type {Boolean} */
    isFullyVisibleMap: false,
    /** @type {Boolean} */
    isZoomedOut: false,
  };
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      focalPoint,
      mapData,
      myPosition,
      myRange,
      onTileClick,
      onTileHover,
      selectedTilePos,
      selectedPath,
      tileSize,
      isFullyVisibleMap,
      isZoomedOut,
    } = this.props;

    const scale = isZoomedOut ? 0.35 : 1;
    const mapWidth = matrixUtils.getWidth(mapData);
    const mapHeight = matrixUtils.getHeight(mapData);

    const xDistanceFromMiddle = focalPoint.x - mapWidth / 2;
    const yDistanceFromMiddle = focalPoint.y - mapHeight / 2;

    const xAdjust = xDistanceFromMiddle < 0 ? 1 : -1;
    const yAdjust = yDistanceFromMiddle < 0 ? 1 : -1;

    const baseOffsetX = ((tileSize * Math.abs(xDistanceFromMiddle)) + ((tileSize / 2) * -xAdjust)) * xAdjust;
    const baseOffsetY = ((tileSize * Math.abs(yDistanceFromMiddle)) + ((tileSize / 2) * -yAdjust)) * yAdjust;

    // create `transform` styles
    const transformStyle = `translate(${baseOffsetX * scale}px, ${baseOffsetY * scale}px) scale(${scale})`;

    return (
      <div
        className={combineClassNames(baseClassName, className)}
        style={{
          width: `${MAP_CONTAINER_WIDTH}px`,
          height: `${MAP_CONTAINER_HEIGHT}px`,
        }}
      >
        {/** inner container - this will move around, so it's effectively the "camera" */}
        <div
          style={{
            transform: transformStyle,
            transition: 'transform 400ms',
          }}
        >
          { mapData.map((mapRowData, rowIdx) => {
            return (
              <div className='flex-row' key={`tile-map-row-${rowIdx}-key`} >
                { mapRowData.map((tileData, colIdx) => {
                  const tilePosition = tileData.position;

                  // assuming the path is in order, finding the index of this point on the path will tell us how far it is
                  const pathIdx = selectedPath.findIndex((pathPoint) => pathPoint.equals(tilePosition));
                  const tileDistance = pathIdx;

                  const isMyPosition = myPosition.equals(tileData.position);

                  const isOnPath = pathIdx >= 0;
                  const isSelected = (selectedTilePos !== null && selectedTilePos.equals(tilePosition));
                  const isTooFar = (tileDistance > myRange) || !isOnPath;

                  return (
                    <TileItemComponent
                      key={`tile-item-${colIdx}-${rowIdx}-key`}
                      // -- props already in data
                      charactersHere={tileData.charactersHere}
                      encounterHere={tileData.encounterHere}
                      tileType={tileData.tileType}
                      position={tileData.position}
                      lightLevel={isFullyVisibleMap ? 10 : tileData.lightLevel}

                      // -- props from parent
                      tileSize={tileSize}
                      onTileClick={onTileClick}
                      onTileHover={onTileHover}

                      // -- computed props
                      tileDistance={tileDistance}
                      isHighlighted={isOnPath}
                      isSelected={isSelected}
                      isTooFar={isTooFar}
                      isMyPosition={isMyPosition}
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
    /** @type {Number} */
    tileDistance: 0,

    /** @type {LightLevel} */
    lightLevel: undefined,
    /** @type {TileType} */
    tileType: undefined,
    /** @type {Number} */
    tileSize: 15,

    /** @type {Boolean} */
    isHighlighted: false,
    /** @type {Boolean} */
    isSelected: false,
    /** @type {Boolean} */
    isTooFar: false,
    /** @type {Boolean} */
    isMyPosition: false,
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
      isHighlighted,
      isTooFar,
      isSelected,
      isMyPosition,
      tileSize,
      tileType,
    } = this.props;

    const isMostlyHidden = lightLevelUtils.isMostlyHidden(lightLevel);

    // make hidden tiles just look like empty tiles
    const tileStyles = tileStyleUtils.createTileStyles({
      lightLevel,
      isHighlighted,
      isTooFar,
      isSelected,
      isMyPosition,
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
          isCharacter
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
      isCharacter,
    } = this.props;

    const styleOptions = {
      opacity: isCharacter ? 1 : 0.7
    };

    return (
      <div
        className='color-black'
        style={tileStyleUtils.createEntityIconStyles(entityIdx, styleOptions)}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
    )
  }
}
