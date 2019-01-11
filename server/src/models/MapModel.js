import Point from '@studiomoniker/point';
import Model from 'models/Model';

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
   * @returns {Tile}
   */
  getTileAt(point) {
    const {x, y} = this.getAvailablePoint(point);
    return this.get('map')[x][y];
  }
  /**
   * replaces the data of a Tile at a given Point
   *
   * @param {Point} point
   * @param {*} tileData - what to update tile with
   */
  setTileAt(point, tileData) {
    const map = this.get('map');
    map[point.x][point.y] = tileData;
  }
  /**
   * updates the data of Tiles from an Array of Points
   *
   * @param {Array<Point>} pointList
   * @param {*} tileData - what to update tile with
   */
  setTileGroup(pointList, tileData) {
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
  getAvailablePoint({x, y}) {
    if (x > this.getWidth() - 1) {
      x = 0;
    } else if (x < 0) {
      x = this.getWidth() - 1;
    }

    if (y > this.getHeight() - 1) {
      y = 0;
    } else if (y < 0) {
      y = this.getHeight() - 1;
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
