import Point from '@studiomoniker/point';
import Model from 'models/Model';

import * as matrixUtils from 'utilities/matrixUtils';

/**
 * abstract helper for managing a 2D Array
 *
 * @typedef {Model} MatrixModel
 */
export class MatrixModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    this.set(Object.assign({
      // 2D array of data in the tiles
      matrix: [[]],
    }, newAttributes));
  }
  /**
   * returns the 2D array of tiles
   *
   * @returns {Matrix}
   */
  getMatrix() {
    return this.get('matrix');
  }
  /**
   * @returns {Number}
   */
  getHeight() {
    return this.getMatrix().length;
  }
  /**
   * @returns {Number}
   */
  getWidth() {
    return this.getMatrix()[0].length;
  }
  /**
   * gets the center of this Map
   *
   * @returns {Point}
   */
  getCenter() {
    return new Point(
      Math.floor(this.getWidth() / 2),
      Math.floor(this.getHeight() / 2),
    );
  }
  /**
   * returns the Tile located at a given Point
   *
   * @param {Point} point
   * @returns {Tile | null}
   */
  getTileAt(point) {
    const {x, y} = point;

    try {
      return this.getMatrix()[y][x];
    } catch (e) {
      return null;
    }
  }
  /**
   * replaces the data of a Tile at a given Point
   *
   * @param {Point} point
   * @param {*} tileData - what to update tile with
   */
  setTileAt(point, tileData) {
    const matrix = this.get('matrix');
    matrix[point.y][point.x] = tileData;
  }
  /**
   * updates the data of Tiles from an Array of Points
   *
   * @param {Array<Point>} pointList
   * @param {*} tileData - what to update tile with
   */
  setTileList(pointList, tileData) {
    pointList.forEach((point) => {
      this.setTileAt(point, tileData);
    });
  }
  /**
   * checks if given Point is a valid point
   *  and loops around if it was out of bounds
   *
   * @param {Point} point
   * @returns {Point}
   */
  getAvailablePoint(point) {
    let {x, y} = point;

    const leftBounds = 0;
    const rightBounds = this.getWidth() - 1;
    const topBounds = 0;
    const bottomBounds = this.getHeight() - 1;

    // handle loopable pathing
    if (this.get('isLoopable')) {
      if (x > rightBounds) {
        x = leftBounds;
      } else if (x < leftBounds) {
        x = rightBounds;
      }

      if (y > bottomBounds) {
        y = topBounds;
      } else if (y < topBounds) {
        y = bottomBounds;
      }

      return new Point(x, y);
    }

    // constrained pathing - return the boundary if the point is beyond it
    if (x > rightBounds) {
      x = rightBounds;
    } else if (x < leftBounds) {
      x = leftBounds;
    }

    if (y > bottomBounds) {
      y = bottomBounds;
    } else if (y < topBounds) {
      y = topBounds;
    }

    return new Point(x, y);
  }
  /**
   * compares a tile at a given point the same as a value
   *
   * @param {Point} point
   * @param {*} comparison - value to compare to
   * @returns {Boolean}
   */
  isTileEqualTo(point, comparison) {
    return this.getTileAt(point) === comparison;
  }
  // ---- matrix utilities
  /**
   * gets matrix of the matrix in given box boundary
   *
   * @param {Function} callback
   */
  forEach(callback) {
    matrixUtils.forEach(this.getMatrix(), callback);
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
  /**
   * finds if there are any tiles around a Point of given Type
   *
   * @param {Point} point
   * @returns {TypeCounts}
   */
  getTypeCountsAdjacentTo(point) {
    return matrixUtils.getTypeCountsAdjacentTo(this.getMatrix(), point);
  }
}

export default MatrixModel;
