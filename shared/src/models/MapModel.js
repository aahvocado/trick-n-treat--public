import Point from '@studiomoniker/point';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import MatrixModel from 'models.shared/MatrixModel';

import * as mapUtils from 'utilities.shared/mapUtils';

/**
 * class for handling Map methods
 *
 * @typedef {Model} MapModel
 */
export class MapModel extends MatrixModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Matrix} */
      matrix: [[]],
      /** @type {Object} */
      mapSettings: undefined,
      /** @type {Point} */
      start: new Point(),
      /** @type {Array<Matrix>} */
      mapHistory: [],
      // other
      ...newAttributes,
    });

    // -- keep track of changes to the map
    this.onChange('matrix', (matrix) => {
      this.addToArray('mapHistory', matrix);
    });
  }
  // -- class methods
  /**
   * finds if a matrix contains a type
   *
   * @param {Point} startPoint
   * @param {Point} endPoint
   * @returns {Path}
   */
  findPath(startPoint, endPoint) {
    const grid = mapUtils.createGridForPathfinding(this.getMatrix());
    return mapUtils.getAStarPath(grid, startPoint, endPoint);
  }
  /**
   * finds if there is a TileType that is within path distance
   *
   * @param {Point} startPoint
   * @param {TileType} tileType
   * @param {Number} distance
   * @returns {Boolean}
   */
  hasTypeNearbyOnPath(startPoint, tileType, distance) {
    return mapUtils.hasTypeNearbyOnPath(this.getMatrix(), startPoint, tileType, distance);
  }
  /**
   * creates a path and then applies it using given `tileType`
   *
   * @param {Point} startPoint
   * @param {Point} endPoint
   * @param {TileType} [tileType]
   */
  generatePath(startPoint, endPoint, tileType = TILE_TYPES.NULL) {
    const grid = mapUtils.createGridForConnecting(this.getMatrix());
    const newPath = mapUtils.getAStarPath(grid, startPoint, endPoint);
    this.setTileList(newPath, tileType);
  }
  // -- implements `mapUtils.js`
  /**
   * @param {Point} startPoint
   * @param {Point} endPoint
   * @param {Number} distance
   * @returns {Boolean}
   */
  isWithinPathDistance(startPoint, endPoint, distance) {
    return mapUtils.isWithinPathDistance(this.getMatrix(), startPoint, endPoint, distance);
  }
  /**
   * @param {Point} startPoint
   * @param {Number} distance
   * @returns {Array<Points>}
   */
  getPointsWithinPathDistance(startPoint, distance) {
    return mapUtils.getPointsWithinPathDistance(this.getMatrix(), startPoint, distance);
  }
  /**
   * finds the closest point of the Tile that is walkable
   *
   * @param {Point} startPoint
   * @param {Number} distance
   * @returns {Point}
   */
  getPointOfNearestWalkableType(startPoint, distance) {
    return mapUtils.getPointOfNearestWalkableType(this.getMatrix(), startPoint, distance);
  }
  /**
   * gets all locations that a given dimension will fit into
   *  if you pass in width and height it will make sure there is enough space with given dimensions
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @returns {Array<Point>}
   */
  getValidEmptyLocations(width = 1, height = 1) {
    return mapUtils.getValidEmptyLocations(this.getMatrix(), width, height);
  }
  /**
   * we want to pick a good location to place something
   *  if you pass in width and height it will make sure there is enough space with given dimensions
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @returns {Point}
   */
  getRandomEmptyLocation(width = 1, height = 1) {
    return mapUtils.getRandomEmptyLocation(this.getMatrix(), width, height);
  }
  /**
   * tries to finds a random location and near a given TileType
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @param {Number} [distance]
   * @returns {Point}
   */
  getPointsAdjacentToWalkableTile(width = 1, height = 1, distance = 3) {
    return mapUtils.getPointsAdjacentToWalkableTile(this.getMatrix(), width, height, distance);
  }
  /**
   * tries to finds a random location and near a given TileType
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @param {Number} [distance]
   * @returns {Point}
   */
  getRandomEmptyLocationNearWalkableTile(width = 1, height = 1, distance = 3) {
    return mapUtils.getRandomEmptyLocationNearWalkableTile(this.getMatrix(), width, height, distance);
  }
  /**
   * checks if given point is the border in a map
   *
   * @param {Point} point
   * @returns {Boolean}
   */
  isBorderPoint(point) {
    return mapUtils.isBorderPoint(this.getMatrix(), point);
  }
  /**
   * finds Path points that surround the map
   *
   * determined by looking at each tile's neighbor,
   *  if they are surrounded by all walkable tiles, then it is not walkable
   *
   * @returns {Array<Point>}
   */
  getBorderPoints() {
    return mapUtils.getBorderPoints(this.getMatrix());
  }
}

export default MapModel;
