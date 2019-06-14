import Point from '@studiomoniker/point';

import Model from 'models.shared/Model';

import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * abstract helper for managing a 2D Array
 *
 * @typedef {Model} MatrixModel
 */
export class MatrixModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Matrix} */
      matrix: [[]],
      /** @type {Number} */
      defaultWidth: 1,
      /** @type {Number} */
      defaultHeight: 1,
      /** @type {*} */
      defaultTileType: null,
      // other
      ...newAttributes,
    });

    // if no `matrix` was given, then we'll make one automatically
    const hasDefaultMatrix = !this.hasUndefinedDefaultMatrix();
    if (!hasDefaultMatrix) {
      this.resetMatrix();
    }

    // otherwise, we can set the base dimensions to our Matrix`
    if (hasDefaultMatrix) {
      const matrix = this.get('matrix');
      this.set({
        defaultWidth: matrixUtils.getWidth(matrix),
        defaultHeight: matrixUtils.getHeight(matrix),
      });
    }
  }
  // -- unique class methods
  /**
   * replaces this matrix with another
   * use this to maintain the observable reference
   *
   * @param {Matrix} newMatrix
   */
  replace(newMatrix) {
    this.get('matrix').replace(newMatrix);
  }
  /**
   * finds if the current matrix is not yet defined
   *
   * @returns {Boolean}
   */
  hasUndefinedDefaultMatrix() {
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
   * replaces a portion of a matrix with another MatrixModel
   *
   * @param {Matrix} childMatrix - what's being merged onto this map
   * @param {Point} [point] - where to merge, by default at the top-left
   */
  mergeMatrix(childMatrix, point = new Point(0, 0)) {
    const myMatrix = this.get('matrix').slice();
    const resultMatrix = matrixUtils.mergeMatrices(myMatrix, childMatrix, point);
    this.get('matrix').replace(resultMatrix);
  }
  /**
   * replaces a portion of a matrix with another MatrixModel
   *
   * @param {MatrixModel} childMatrixModel - what's being merged onto this map
   * @param {Point} [point] - where to merge, by default at the top-left
   */
  mergeMatrixModel(childMatrixModel, point = new Point(0, 0)) {
    const childMatrix = childMatrixModel.get('matrix').slice();
    this.mergeMatrix(childMatrix, point);
  }
  // -- implements `matrixUtils.js`
  /**
   * @returns {Number}
   */
  getWidth() {
    return matrixUtils.getWidth(this.getMatrix());
  }
  /**
   * @returns {Number}
   */
  getHeight() {
    return matrixUtils.getHeight(this.getMatrix());
  }
  /**
   * gets the center Point of this Matrix
   *
   * @returns {Point}
   */
  getCenter() {
    return matrixUtils.getCenter(this.getMatrix());
  }
  /**
   * is X is out of bounds
   * - could be too far left or too far right
   *
   * @param {Number} x
   * @returns {Boolean}
   */
  isXOutOfBounds(x) {
    return matrixUtils.isXOutOfBounds(this.getMatrix(), x);
  }
  /**
   * is Y is out of bounds
   * - could be too far up or too far down
   *
   * @param {Number} y
   * @returns {Boolean}
   */
  isYOutOfBounds(y) {
    return matrixUtils.isYOutOfBounds(this.getMatrix(), y);
  }
  /**
   * is given point out of bounds
   *
   * @param {Point} point
   * @returns {Boolean}
   */
  isPointOutOfBounds(point) {
    return matrixUtils.isPointOutOfBounds(this.getMatrix(), point);
  }
  /**
   * @param {Function} callback
   */
  forEach(callback) {
    matrixUtils.forEach(this.getMatrix(), callback);
  }
  /**
   * @param {Function} callback
   * @returns {Matrix}
   */
  map(callback) {
    return matrixUtils.map(this.get('matrix'), callback);
  }
  /**
   * replaces the TileData at a given Point
   *
   * @param {Point} point
   * @param {TileData} newTileData
   * @returns {Boolean} - returns true if successfully set
   */
  setTileAt(point, newTileData) {
    if (this.isPointOutOfBounds(point)) {
      console.log(`error: setTileAt(${point.x}, ${point.y}) out of bounds`);
      return false;
    }

    this.get('matrix')[point.y][point.x] = newTileData;
  }
  /**
   * updates the value of Tiles from an Array of Points
   *
   * @param {Array<Point>} pointList
   * @param {TileType} tileType
   */
  setTileList(pointList, tileType) {
    const matrixClone = this.getMatrix();
    matrixUtils.setTileList(matrixClone, pointList, tileType);
    this.get('matrix').replace(matrixClone);
  }
  /** @override */
  createSubmatrixAt(point, width, height, tileType) {
    const mergedMatrix = matrixUtils.createSubmatrixAt(this.getMatrix(), point, width, height, tileType);
    this.get('matrix').replace(mergedMatrix);
  }
  /**
   * returns the Tile located at a given Point
   *
   * @param {Point} point
   * @returns {TileData | undefined}
   */
  getTileAt(point) {
    return matrixUtils.getTileAt(this.get('matrix'), point);
  }
  /**
   * @param {Point} point
   * @param {Point} [distance]
   * @returns {TileData | undefined}
   */
  getTileLeft(point, distance = 1) {
    return matrixUtils.getTileLeft(this.get('matrix'), point, distance);
  }
  /**
   * @param {Point} point
   * @param {Point} [distance]
   * @returns {TileData | undefined}
   */
  getTileRight(point, distance = 1) {
    return matrixUtils.getTileRight(this.get('matrix'), point, distance);
  }
  /**
   * @param {Point} point
   * @param {Point} [distance]
   * @returns {TileData | undefined}
   */
  getTileAbove(point, distance = 1) {
    return matrixUtils.getTileAbove(this.get('matrix'), point, distance);
  }
  /**
   * @param {Point} point
   * @param {Point} [distance]
   * @returns {TileData | undefined}
   */
  getTileBelow(point, distance = 1) {
    return matrixUtils.getTileBelow(this.get('matrix'), point, distance);
  }
  /**
   * compares a tile at a given point the same as a value
   *
   * @param {Point} point
   * @param {*} comparison - value to compare to
   * @returns {Boolean}
   */
  isTileEqualTo(point, comparison) {
    return matrixUtils.isTileEqualTo(this.getMatrix(), point, comparison);
  }
  /**
   * finds if Matrix has ANY instance of given TileData
   *
   * @param {TileType} tileType
   * @returns {Boolean}
   */
  containsTileType(tileType) {
    return matrixUtils.containsTileType(this.getMatrix(), tileType);
  }
  /**
   * finds if there are any tiles of given Type in a Matrix
   *
   * @param {TileType} tileType
   * @returns {Number}
   */
  getCountOfTileType(tileType) {
    return matrixUtils.getCountOfTileType(this.getMatrix(), tileType);
  }
  /**
   * gives back the number of each type of tile in a matrix
   *
   * @returns {TypeCounts}
   */
  getTypeCounts() {
    return matrixUtils.getTypeCounts(this.getMatrix());
  }
  /**
   * finds if there are any tiles around a Point of given Type
   *
   * @param {Point} point
   * @returns {TypeCounts}
   */
  getTypeCountsAdjacentTo(point) {
    return matrixUtils.getTypeCountsAdjacentTo(this.getMatrix(), point);
  }
  /**
   * gets matrix of the matrix in given box boundary
   *
   * @param {Number} topLeftX
   * @param {Number} topLeftY
   * @param {Number} bottomRightX
   * @param {Number} bottomRightY
   * @returns {Matrix}
   */
  getSubmatrixSquare(topLeftX, topLeftY, bottomRightX, bottomRightY) {
    return matrixUtils.getSubmatrixSquare(this.getMatrix(), topLeftX, topLeftY, bottomRightX, bottomRightY);
  }
  /**
   * calculates the appropriate coordinates given a point and distance
   *
   * @param {Point} point - where to look from
   * @param {Number} distance - how many tiles further to check
   * @returns {Submatrix}
   */
  getSubmatrixSquareByDistance(point, distance) {
    return matrixUtils.getSubmatrixSquareByDistance(this.getMatrix(), point, distance);
  }
  /**
   * calculates the appropriate coordinates given a point and distance
   *  but only by adjacent tiles (so diagonals are 2 spaces away)
   *
   * @param {Point} point - where to look from
   * @param {Number} distance - how many tiles further to check
   * @returns {Submatrix}
   */
  getSubmatrixByDistance(point, distance) {
    return matrixUtils.getSubmatrixByDistance(this.getMatrix(), point, distance);
  }
  /** @override */
  getNeighboringPoints(point) {
    return matrixUtils.getNeighboringPoints(this.getMatrix(), point);
  }
  /**
   * returns a LIST of Points within given distance away from a point
   *  but only by adjacent tiles (so diagonals are 2 spaces away)
   *
   * @param {Point} point - where to start looking from
   * @param {Number} distance - how many tiles further to check
   * @returns {Array<Point>}
   */
  getPointsListOfNearbyTiles(point, distance) {
    return matrixUtils.getPointsListOfNearbyTiles(this.getMatrix(), point, distance);
  }
  /**
   * returns a MATRIX of Points within given distance away from a point
   *  but only by adjacent tiles (so diagonals are 2 spaces away)
   *
   * @todo - not sure what the use is yet, this might get changed
   *
   * @param {Point} point - where to start looking from
   * @param {Number} distance - how many tiles further to check
   * @returns {Matrix}
   */
  getPointsMatrixOfNearbyTiles(point, distance) {
    return matrixUtils.getPointsMatrixOfNearbyTiles(this.getMatrix(), point, distance);
  }
  /**
   * returns adjacent cells in top, right, bottom, left order
   *
   * @param  {Point} point
   * @returns {Array<CellModel>}
   */
  getNeighborsAt(point) {
    return [
      this.getTileAbove(point),
      this.getTileRight(point),
      this.getTileBelow(point),
      this.getTileLeft(point),
    ].filter(Boolean);
  }
  /** @override */
  getAvailablePoint(point, canLoop) {
    return matrixUtils.getAvailablePoint(this.getMatrix(), point, canLoop);
  }
  /**
   * finds if there are any tiles around a Point of given Type
   *
   * @param {Point} point - where to look from
   * @param {Tile} type - what you're looking for
   * @param {Number} distance - how many tiles further to check
   * @returns {Boolean}
   */
  hasNearbyTileType(point, type, distance) {
    return matrixUtils.hasNearbyTileType(this.getMatrix(), point, type, distance);
  }
  /**
   * finds if there are any tiles directly adjacent to a Point of given Type
   *  meaning the immediate four cardinal directions from it
   *
   * @param {Point} point - where to look from
   * @param {Tile} type - what you're looking for
   * @returns {Boolean}
   */
  hasAdjacentTileType(point, type) {
    return matrixUtils.hasAdjacentTileType(this.getMatrix(), point, type);
  }
  /**
   * finds the closest point of the Tile that matches given point
   *
   * @param {Point} startPoint
   * @param {Tile} type - what you're looking for
   * @param {Number} distance - how many tiles further to check
   * @returns {Point}
   */
  getPointOfNearestTileType(startPoint, type, distance) {
    return matrixUtils.getPointOfNearestTileType(this.getMatrix(), startPoint, type, distance);
  }
  /**
   * gets how many tiles apart two points are
   * (only adjacently, so diagonals count as 2 tiles away)
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Number}
   */
  getDistanceBetween(pointA, pointB) {
    return matrixUtils.getDistanceBetween(pointA, pointB);
  }
  /**
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @param {Number} distance
   * @returns {Boolean}
   */
  isWithinDistance(pointA, pointB, distance) {
    return matrixUtils.isWithinDistance(this.getMatrix(), pointA, pointB);
  }
}

export default MatrixModel;
