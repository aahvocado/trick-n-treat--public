import Model from 'models/Model';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';

/*
  SUPER WARNING: `map` is an array function,
    it could potentially be confusing when used together so it might warrant a rename
*/

// temporary constants just for reference
const TILE_TYPE = {
  0: 'empty',
  1: 'path',
  2: 'stuff',
};

/**
 * class that handles the World Map
 *
 * @typedef {Model} MapModel
 */
export class MapModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    // create a map
    const generatedMap = mapGenerationUtils.generateMap({
      width: 21,
      height: 21,
    });

    // save map
    this.set(Object.assign({
      map: generatedMap,
    }, newAttributes));

    // create paths
    this.executeRandomWalk({
      start: this.getCenterPoint(),
      steps: 200,
    });
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
   * returns the tile located at a coordinate,
   *  will try to handle Points that are out of bounds by looping around
   *
   * @param {Point} coordinate
   * @returns {Tile}
   */
  getTileAt(coordinate) {
    const {x, y} = this.getAvailablePoint(coordinate);
    return this.get('map')[x][y];
  }
  /**
   * gets the center of this map
   *
   * @param {Point} x, y
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

    return { x, y };
  }
  /**
   * gets the center of this map
   *
   * @returns {Point}
   */
  getCenterPoint() {
    return {
      x: Math.floor(this.getWidth() / 2),
      y: Math.floor(this.getHeight() / 2),
    }
  }
  /**
   * uses the Random Walk process to create a map
   *  https://en.wikipedia.org/wiki/Random_walk
   *
   * @param {Object} options
   * @property {Point} options.start - coordinates to start
   * @property {Number} options.steps - how many steps to walk
   */
  executeRandomWalk({start, steps}) {
    const map = this.get('map');

    const height = map.length;
    const width = map[0].length;

    let currentPoint = start;
    for (var i = 0; i < steps; i++) {
      map[currentPoint.y][currentPoint.x] = 1;

      // pick a new random direction to go
      const directionalPoint = mapGenerationUtils.getRandomDirection();
      currentPoint = this.getAvailablePoint({
        x: currentPoint.x + directionalPoint.x,
        y: currentPoint.y + directionalPoint.y,
      });

      // test going in the same direction twice
      map[currentPoint.y][currentPoint.x] = 1;
      currentPoint = this.getAvailablePoint({
        x: currentPoint.x + directionalPoint.x,
        y: currentPoint.y + directionalPoint.y,
      });
    }

    return map;
  }
}

export default MapModel;
