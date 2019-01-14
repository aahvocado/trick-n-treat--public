import Point from '@studiomoniker/point';
import Model from 'models/Model';

import * as matrixUtils from 'utilities/matrixUtils';

/*
  SUPER WARNING: `map` is an array function,
    it could potentially be confusing when used together so it might warrant a rename
*/

/**
 * class that handles the World Map
 *
 * @typedef {Model} MapModel
 */
export class MapModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    this.set(Object.assign({
      map: [[]],

      start: new Point(),
      // list of Points where "special" tiles are located - maybe starting spots?
      specialPoints: [],
    }, newAttributes));
  }
  /**
   * @returns {Number}
   */
  getHeight() {
    return this.get('map').length;
  }
  /**
   * @returns {Number}
   */
  getWidth() {
    return this.get('map')[0].length;
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
      return this.get('map')[y][x];
    } catch (e) {
      return null;
    }
  }
  /**
   * gets matrix of the tiles in given box boundary
   *
   * @param {Number} topLeftX
   * @param {Number} topLeftY
   * @param {Number} bottomRightX
   * @param {Number} bottomRightY
   * @returns {Matrix}
   */
  getMapSubmatrix(topLeftX, topLeftY, bottomRightX, bottomRightY) {
    const map = this.get('map');
    return matrixUtils.getSubmatrix(map, topLeftX, topLeftY, bottomRightX, bottomRightY);
  }
  /**
   * replaces the data of a Tile at a given Point
   *
   * @param {Point} point
   * @param {*} tileData - what to update tile with
   */
  setTileAt(point, tileData) {
    const map = this.get('map');
    map[point.y][point.x] = tileData;
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
    })
  }
  /**
   * checks if given Point is a valid point
   *  and loops around if it was out of bounds
   *
   * @param {Point} point
   * @returns {Point}
   */
  getAvailablePoint(point) {
    let { x, y } = point;

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
   * gets the center of this Map
   *
   * @returns {Point}
   */
  getCenter() {
    return new Point(
      Math.floor(this.getWidth() / 2),
      Math.floor(this.getHeight() / 2),
    )
  }
}

export default MapModel;
