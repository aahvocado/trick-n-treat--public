import React, { Component, PureComponent } from 'react';
import array2d from 'array2d';
import Point from '@studiomoniker/point';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faExclamation,
  faQuestion,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import combineClassNames from 'utilities/combineClassNames';
import * as tileStyleUtils from 'utilities/tileStyleUtils';

import * as lightLevelUtils from 'utilities.shared/lightLevelUtils';

/**
 * 2D matrix visualizer
 */
export default class TileMapComponent extends Component {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'overflow-hidden bg-grayest flex-none flex-col-center position-relative mar-v-2 mar-h-auto',
    /** @type {String} */
    className: '',

    /** @type {Grid} */
    mapGridData: undefined,
    /** @type {Point} */
    myPosition: new Point(),
    /** @type {Number} */
    myRange: 0,

    /** @type {Function} */
    onTileClick: () => {},
    /** @type {Point} */
    focalPoint: new Point(),
    /** @type {Point} */
    selectedTilePos: null,
    /** @type {Path} */
    selectedPath: [],

    /** @type {Number} */
    tileSize: 15,
    /** @type {Number} */
    containerWidth: 15,
    /** @type {Number} */
    containerHeight: 15,
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
      mapGridData,
      myPosition,
      myRange,
      onTileClick,
      onTileHover,
      selectedTilePos,
      selectedPath,
      tileSize,
      containerWidth,
      containerHeight,
      isFullyVisibleMap,
      isZoomedOut,
    } = this.props;

    const scale = isZoomedOut ? 0.2 : 1;
    const mapWidth = array2d.width(mapGridData);
    const mapHeight = array2d.height(mapGridData);

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
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
        }}
      >
        {/** inner container - this will move around, so it's effectively the "camera" */}
        <div
          style={{
            transform: transformStyle,
            transition: 'transform 400ms',
          }}
        >
          { mapGridData.map((mapRowData, rowIdx) => {
            return (
              <div className='flex-row' key={`tile-map-row-${rowIdx}-key`} >
                { mapRowData.map((cellData, colIdx) => {
                  const cellPoint = cellData.get('point');

                  // assuming the path is in order, finding the index of this point on the path will tell us how far it is
                  const pathIdx = selectedPath.findIndex((pathPoint) => pathPoint.equals(cellPoint));
                  const tileDistance = pathIdx;

                  const isMyPosition = myPosition.equals(cellPoint);

                  const isOnPath = pathIdx >= 0;
                  const isSelected = (selectedTilePos !== null && selectedTilePos.equals(cellPoint));
                  const isTooFar = (tileDistance > myRange) || !isOnPath;

                  return (
                    <TileItemComponent
                      key={`tile-item-${colIdx}-${rowIdx}-key`}
                      // -- props already in data
                      charactersHere={cellData.get('charactersHere')}
                      encounterHere={cellData.get('encounterHere')}
                      tile={cellData.get('tile')}
                      position={cellPoint}
                      lightLevel={isFullyVisibleMap ? 10 : cellData.get('lightLevel')}

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
 * a single cell in the Grid
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
    /** @type {TileId} */
    tile: undefined,
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
      tile,
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
      tile,
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
          icon={encounterHere.isImmediate ? faExclamation : faQuestion}
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
