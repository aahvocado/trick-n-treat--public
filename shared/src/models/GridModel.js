import Point from '@studiomoniker/point';
import array2d from 'array2d';
import {extendObservable} from 'mobx';

import {TILE_TYPES} from 'constants.shared/tileTypes';

import Model from 'models.shared/Model';
import ModelList from 'models.shared/ModelList';
import CellModel from 'models.shared/CellModel';

import * as mathUtils from 'utilities.shared/mathUtils';

/**
 * class for handling Map methods
 *
 * @typedef {Array<Array>} Grid
 * @typedef {Model} GridModel
 */
export default class GridModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Grid} */
      grid: [],
      /** @type {Number} */
      defaultWidth: 1,
      /** @type {Number} */
      defaultHeight: 1,
      /** @type {TileType} */
      defaultTile: null,

      /** @type {Array<Grid>} */
      regionList: new ModelList([], GridModel),

      /** @type {Array<Grid>} */
      history: [],
      /** @type {Object} */
      ...newAttributes,
    });

    // -- define computed attributes
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {Boolean} */
      get width() {
        return array2d.width(_this.get('grid'));
      },
      /** @type {Boolean} */
      get height() {
        return array2d.height(_this.get('grid'));
      },
      /** @type {Boolean} */
      get isDefined() {
        return _this.isDefined();
      },
    });

    // if no `grid` attribute was given, then we'll make one
    if (!this.get('isDefined')) {
      this.reset();
    }

    // if a `grid` was defined, make sure we have some default width/height values
    if (this.get('isDefined')) {
      this.set({
        defaultWidth: array2d.width(this.get('grid')),
        defaultHeight: array2d.height(this.get('grid')),
      });
    }
  }
  /**
   * replaces this grid with another
   * use this to maintain the observable reference
   *
   * @param {Grid} newGrid
   */
  replace(newGrid) {
    this.get('grid').replace(newGrid);
  }
  // -- unique model functions
  /**
   * creates a snapshot of the current grid and adds it to the history
   *
   * @returns {Grid}
   */
  snapshot() {
    const snapshotGrid = this.map((cell) => cell.export());

    this.get('history').push(snapshotGrid);
    return snapshotGrid;
  }
  // -- unique grid functions
  /**
   * @returns {Boolean}
   */
  isDefined() {
    return this.get('grid') !== undefined
      && this.get('grid').toString() !== ''
      && this.get('height') !== 0
      && this.get('width') !== 0;
  }
  /**
   * creates a completly new Grid and sets the attributes,
   *  if no parameters are passed it will use base attributes
   *
   * @param {Number} [width]
   * @param {Number} [height]
   * @param {TileType} [tileType]
   */
  reset(width = this.get('defaultWidth'), height = this.get('defaultHeight'), tileType = this.get('defaultTile')) {
    if (width * height > 1000) {
      console.error('Don\t do it bro!');
      return;
    }

    // create a new grid
    const baseGrid = array2d.buildWith(width, height, (r, c) => {
      return new CellModel({
        point: new Point(c, r),
        tileType: tileType,
      });
    });

    this.replace(baseGrid);
    this.set({
      defaultWidth: width,
      defaultHeight: height,
    });
  }
  /**
   * attempts to find the top-left point of the area where all cells pass true for the callback
   *
   * @param {Number} width
   * @param {Number} height
   * @param {Function} callback
   * @param {Number} maxAttempts
   * @returns {Point}
   */
  findFitPoint(width, height, callback, maxAttempts = 10) {
    const gridWidth = this.get('width');
    const gridHeight = this.get('height');

    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts ++;

      // randomly find a point that could fit the area
      const randomPoint = new Point(
        mathUtils.getRandomIntInclusive(0, gridWidth - width - 1),
        mathUtils.getRandomIntInclusive(0, gridHeight - height - 1),
      );

      // start by passing, but reject if anything in the given callback returns false
      let passes = true;
      this.forArea(randomPoint, width, height, (...args) => {
        if (!callback(...args)) {
          passes = false;
        }
      });

      // if it passes we can return the point used
      if (passes) {
        return randomPoint;
      }
    }
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getAbove(point, distance = 1) {
    return this.getAt(point.clone().subtractY(distance));
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getRight(point, distance = 1) {
    return this.getAt(point.clone().addX(distance));
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getBelow(point, distance = 1) {
    return this.getAt(point.clone().addY(distance));
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getLeft(point, distance = 1) {
    return this.getAt(point.clone().subtractX(distance));
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getAdjacent(point, distance = 1) {
    return [
      this.getAbove(point, distance),
      this.getRight(point, distance),
      this.getBelow(point, distance),
      this.getLeft(point, distance),
    ].filter(Boolean);
  }
  /**
   * @param {Point} point
   * @param {Number} [distance]
   * @returns {Cell}
   */
  getSurrounding(point, distance = 1) {
    return [
      this.getAbove(point, distance),
      this.getRight(point, distance),
      this.getBelow(point, distance),
      this.getLeft(point, distance),

      // diagonally
      this.getAt(point.clone().addX(distance).addY(distance)),
      this.getAt(point.clone().subtractX(distance).subtractY(distance)),
      this.getAt(point.clone().addX(distance).subtractY(distance)),
      this.getAt(point.clone().subtractX(distance).addY(distance)),
    ].filter(Boolean);
  }
  // -- Array2D.js implementations
  // --- https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md
  /**
   * #getgrid-r-c
   *
   * @param {Point} point
   * @returns {Cell}
   */
  getAt(point) {
    return array2d.get(this.get('grid').slice(), point.y, point.x);
  }
  /**
   * #setgrid-r-c-value
   *
   * @param {Point} point
   * @param {Cell} value
   * @returns {Grid}
   */
  setAt(point, value) {
    const modifiedGrid = array2d.set(this.get('grid').slice(), point.y, point.x, value);
    this.replace(modifiedGrid);
    return modifiedGrid;
  }
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#eachcellgrid-iterator
   *
   * @param {Function} callback
   */
  forEach(callback) {
    array2d.eachCell(this.get('grid').slice(), callback);
  }
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * #nthcellgrid-n-s-iterator
   *
   * @param {Number} nth
   * @param {Number} start
   * @param {Function} callback
   */
  nthCell(nth, start, callback) {
    array2d.nthCell(this.get('grid').slice(), nth, start, callback);
  }
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * #forareagrid-r-c-width-height-iterator
   *
   * @param {Point} point
   * @param {Number} width
   * @param {Number} height
   * @param {Function} callback
   */
  forArea(point, width, height, callback) {
    array2d.forArea(this.get('grid').slice(), point.y, point.x, width, height, callback);
  }
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#mapgrid-iterator
   *
   * @param {Function} callback
   * @returns {Grid}
   */
  map(callback) {
    return array2d.map(this.get('grid').slice(), callback);
  }
  /**
   * #pastegrid1-grid2-r-c
   *
   * @param {GridModel} otherGrid
   * @param {Point} point
   * @returns {Grid}
   */
  paste(otherGrid, point) {
    const modifiedGrid = array2d.paste(this.export().grid, otherGrid.export().grid, point.y, point.x);
    this.replace(modifiedGrid);
    return modifiedGrid;
  }
}
