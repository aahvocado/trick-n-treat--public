// import Point from '@studiomoniker/point';
import array2D from 'array2d';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import Model from 'models.shared/Model';

import * as mapUtils from 'utilities.shared/mapUtils';

/**
 * class for handling Map methods
 *
 * @typedef {Model} MapModel
 */
export default class MapModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Matrix} */
      matrix: undefined,
      /** @type {Number} */
      defaultWidth: 1,
      /** @type {Number} */
      defaultHeight: 1,
      /** @type {*} */
      defaultTileType: null,
      /** @type {Grid} */
      grid: undefined,

      /** @type {Array<Matrix>} */
      mapHistory: [],
      /** @type {Object} */
      ...newAttributes,
    });

    // if no `matrix` was given, then we'll make one automatically
    const hasDefinendGrid = !this.hasUndefinedGrid();
    if (!hasDefinendGrid) {
      this.resetMatrix();
    }

    // otherwise, we can set the base dimensions to our Matrix`
    if (hasDefinendGrid) {
      const matrix = this.get('matrix');
      this.set({
        defaultWidth: matrixUtils.getWidth(matrix),
        defaultHeight: matrixUtils.getHeight(matrix),
      });
    }

    // -- keep track of changes to the map
    // this.set({mapHistory: [this.get('matrix')]});
    this.onChange('matrix', (matrix) => {
      this.get('mapHistory').push(matrix);
    });
  }
  /**
   * replaces this matrix with another
   * use this to maintain the observable reference
   *
   * @param {Grid} newGrid
   */
  replace(newGrid) {
    this.get('grid').replace(newGrid);
  }
  // -- class methods
  /**
   * finds if the current matrix is not yet defined
   *
   * @returns {Boolean}
   */
  hasUndefinedGrid() {
    return this.get('matrix') === undefined || this.getMatrix().toString() === '' || (this.getWidth() === 0 && this.getHeight() === 0);
  }
  /**
   * creates a Matrix and sets the attribute,
   *  if no parameters are passed it will use base attributes
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @param {TileType} [tileType]
   */
  resetMatrix(width = this.get('defaultWidth'), height = this.get('defaultHeight'), tileType = this.get('defaultTileType')) {
    if (width * height > 1000) {
      console.error('Don\t do it bro!');
      return;
    }

    const baseMatrix = matrixUtils.createMatrix(width, height, tileType);
    this.get('matrix').clear();
    this.get('matrix').replace(baseMatrix);
    this.set({
      defaultWidth: width,
      defaultHeight: height,
      defaultTileType: tileType,
    });
  }
  /**
   * gets a shallow copy of this Matrix
   *
   * @returns {Matrix}
   */
  getMatrix() {
    return this.get('matrix').slice();
  }
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
  /**
   * gets unvisited cells in this maze
   *
   * @returns {Array<CellModel>}
   */
  getUnvisitedCells() {
    const cellList = [];
    this.forEach((cell) => {
      if (!cell.get('visited')) {
        cellList.push(cell);
      }
    })
    return cellList;
  }
  /**
   * returns neighboring cells that are not walled off
   *
   * @param  {Point} point
   * @returns {Array<CellModel>}
   */
  getNonWalledNeighbors(point) {
    const neighborCells = [];

    const cell = this.getTileAt(point);
    if (!cell.get('top')) {
      const cellAbove = this.getTileAbove(point);
      if (cellAbove !== undefined) {
        neighborCells.push(cellAbove);
      }
    }

    if (!cell.get('right')) {
      const cellRight = this.getTileRight(point);
      if (cellRight !== undefined) {
        neighborCells.push(cellRight);
      }
    }

    if (!cell.get('bottom')) {
      const cellBelow = this.getTileBelow(point);
      if (cellBelow !== undefined) {
        neighborCells.push(cellBelow);
      }
    }

    if (!cell.get('left')) {
      const cellLeft = this.getTileLeft(point);
      if (cellLeft !== undefined) {
        neighborCells.push(cellLeft);
      }
    }

    return neighborCells;
  }
  /**
   * gets number of unvisited cells in this maze
   *
   * @returns {Number}
   */
  getUnvisitedCount() {
    return this.getUnvisitedCells().length;
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
  /** @override */
  isWalkableAt(point) {
    return mapUtils.isWalkableAt(this.getMatrix(), point);
  }
  /** @override */
  getRandomDirection(point) {
    return mapUtils.getRandomDirection(this.getMatrix(), point);
  }
  /** @override */
  getRandomWeightedDirection(point) {
    return mapUtils.getRandomWeightedDirection(this.getMatrix(), point);
  }
  /** @override */
  getNonWallNeighboringPoints(point) {
    return mapUtils.getNonWallNeighboringPoints(this.getMatrix(), point);
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
   * @param {Number} [attempts]
   * @returns {Point}
   */
  getRandomEmptyLocation(width = 1, height = 1, attempts) {
    return mapUtils.getRandomEmptyLocation(this.getMatrix(), width, height, attempts);
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
