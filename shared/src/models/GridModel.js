import Pathfinding from 'pathfinding';
import Point from '@studiomoniker/point';
import array2d from 'array2d';
import {extendObservable, toJS} from 'mobx';

import Model from 'models.shared/Model';
import ModelList from 'models.shared/ModelList';
import CellModel from 'models.shared/CellModel';

import * as gridUtils from 'utilities.shared/gridUtils';
import * as mathUtils from 'utilities.shared/mathUtils';
import * as tileUtils from 'utilities.shared/tileUtils';

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
      /** @type {TileId} */
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
    // have to update their individual point references
    const updatedGrid = array2d.map(newGrid, (cell, r, c) => {
      if (cell == null || cell === undefined) {
        return cell;
      }

      if (cell.set !== undefined) {
        return new CellModel({
          ...cell.attributes,
          point: new Point(c, r),
        });
      }

      return cell;
    });

    this.get('grid').replace(updatedGrid);
  }
  // -- unique model functions
  /**
   * creates a snapshot of the current grid and adds it to the history
   *
   * @returns {Grid}
   */
  snapshot() {
    const snapshotGrid = this.map((cell) => {
      if (cell === null || cell === undefined) {
        return cell;
      }

      return cell.export();
    });

    this.get('history').push(snapshotGrid);
    return snapshotGrid;
  }
  /**
   * creates non-mobx observed copy of the grid array
   *
   * @returns {Grid}
   */
  copyGrid() {
    return toJS(this.get('grid'));
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
   * @param {TileId} [tile]
   */
  reset(width = this.get('defaultWidth'), height = this.get('defaultHeight'), tile = this.get('defaultTile')) {
    if (width * height > 1000) {
      console.error('Don\t do it bro!');
      return;
    }

    // create a new grid
    const baseGrid = array2d.buildWith(width, height, (r, c) => {
      return new CellModel({
        point: new Point(c, r),
        tile: tile,
        region: tile,
      });
    });

    this.replace(baseGrid);
    this.set({
      defaultWidth: width,
      defaultHeight: height,
    });
  }
  /**
   * finds the a* path from given pointA to pointB
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Array<Point>}
   */
  findPath(pointA, pointB) {
    // create a Pathfinding Grid which is just 0s and 1s
    const pathingGrid = new Pathfinding.Grid(this.map((cell) => {
      const cellTile = cell.get('tile');
      return tileUtils.isWallTile(cellTile) ? 1 : 0;
    }));

    // find the path
    const finder = new Pathfinding.AStarFinder();
    const coordinatePath = finder.findPath(pointA.x, pointA.y, pointB.x, pointB.y, pathingGrid);

    // finder gives us Array of coordinates [x, y] - we'll convert it to a more convenient Array<Point>
    const pointPath = coordinatePath.map((coordinate) => (new Point(coordinate[0], coordinate[1])));
    return pointPath;
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
        mathUtils.getRandomInt(0, gridWidth - width - 1),
        mathUtils.getRandomInt(0, gridHeight - height - 1),
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
   * @returns {Boolean}
   */
  isWallAt(point) {
    const cell = this.getAt(point);
    if (cell === undefined) {
      return true;
    }

    return tileUtils.isWallTile(cell.get('tile'));
  }
  /**
   * basically just makes it easier to understand which "distance" method we are using
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Number}
   */
  distance(pointA, pointB) {
    return this.manhattan(pointA, pointB);
  }
  /**
   * similar to `crop()` except the given point will be the center
   *
   * @param {Point} point
   * @param {Number} width
   * @param {Number} height
   * @param {Function} callback
   * @returns {Grid}
   */
  cropAround(point, width, height, callback) {
    const topLeftPoint = new Point(
      point.x - Math.floor(width / 2),
      point.y - Math.floor(height / 2),
    );

    if (gridUtils.isPointOutOfBounds(this.copyGrid(), topLeftPoint)) {
      console.warn(`cropAround() ${point.toString()} is out of bounds.`);
      // return;
    }

    return this.crop(topLeftPoint, width, height);
  }
  /**
   * similar to `forArea()` except the given point will be the center
   *
   * @param {Point} point
   * @param {Number} width
   * @param {Number} height
   * @param {Function} callback
   */
  forAround(point, width, height, callback) {
    const topLeftPoint = new Point(
      point.x - Math.floor(width / 2),
      point.y - Math.floor(height / 2),
    );

    if (gridUtils.isPointOutOfBounds(this.copyGrid(), topLeftPoint)) {
      console.warn(`forAround() ${point.toString()} is out of bounds.`);
      // return;
    }

    this.forArea(topLeftPoint, width, height, callback);
  }
  /**
   * pads all four sides of the grid
   *
   * @param {Number} times
   * @param {CellModel} value
   */
  padding(times = 1, value) {
    this.upad(times, value);
    this.dpad(times, value);
    this.rpad(times, value);
    this.lpad(times, value);
  }
  // -- Array2D.js implementations
  // --- https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md
  // -- basic
  /**
   * #getgrid-r-c
   *
   * @param {Point} point
   * @returns {Cell}
   */
  getAt(point) {
    if (gridUtils.isPointOutOfBounds(this.copyGrid(), point)) {
      // console.warn(`getAt() ${point.toString()} is out of bounds.`);
      return;
    }

    return array2d.get(this.copyGrid(), point.y, point.x);
  }
  /**
   * #setgrid-r-c-value
   *
   * @param {Point} point
   * @param {Cell} value
   * @returns {Grid}
   */
  setAt(point, value) {
    if (gridUtils.isPointOutOfBounds(this.copyGrid(), point)) {
      // console.warn(`setAt() ${point.toString()} is out of bounds.`);
      return;
    }

    const modifiedGrid = array2d.set(this.copyGrid(), point.y, point.x, value);
    this.replace(modifiedGrid);
    return modifiedGrid;
  }
  // -- essentials
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * #forareagrid-r-c-width-height-iterator
   *
   * @param {Point} point
   * @param {Number} width
   * @param {Number} height
   * @returns {Grid}
   */
  crop(point, width, height) {
    return array2d.crop(this.copyGrid(), point.y, point.x, width, height);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#upadgrid-times-value
   *
   * @param {Number} times
   * @param {CellModel} value
   */
  upad(times = 1, value) {
    const resultingGrid = array2d.upad(this.copyGrid(), times, value);
    this.replace(resultingGrid);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#dpadgrid-times-value
   *
   * @param {Number} times
   * @param {CellModel} value
   */
  dpad(times = 1, value) {
    const resultingGrid = array2d.dpad(this.copyGrid(), times, value);
    this.replace(resultingGrid);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#rpadgrid-times-value
   *
   * @param {Number} times
   * @param {CellModel} value
   */
  rpad(times = 1, value) {
    const resultingGrid = array2d.rpad(this.copyGrid(), times, value);
    this.replace(resultingGrid);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#lpadgrid-times-value
   *
   * @param {Number} times
   * @param {CellModel} value
   */
  lpad(times = 1, value) {
    const resultingGrid = array2d.lpad(this.copyGrid(), times, value);
    this.replace(resultingGrid);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#fillareagrid-r-c-width-height-value
   *
   * @param {Point} point
   * @param {Number} width
   * @param {Number} height
   * @param {CellModel} value
   */
  fillArea(point, width, height, value) {
    const resultingGrid = array2d.fillArea(this.copyGrid(), point.y, point.x, width, height, value);
    this.replace(resultingGrid);
  }
  // -- iteration
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#eachcellgrid-iterator
   *
   * @param {Function} callback
   */
  forEach(callback) {
    array2d.eachCell(this.copyGrid(), callback);
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
    array2d.nthCell(this.copyGrid(), nth, start, callback);
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
    array2d.forArea(this.copyGrid(), point.y, point.x, width, height, callback);
  }
  /**
   * iterator has signature of `callback(value, row, column, grid)`
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#mapgrid-iterator
   *
   * @param {Function} callback
   * @returns {Grid}
   */
  map(callback) {
    return array2d.map(this.copyGrid(), callback);
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
  /**
   * [north, west, east, south]
   *
   * @param {Point} point
   * @returns {Array<Cell>}
   */
  orthogonals(point) {
    return array2d.orthogonals(this.copyGrid(), point.y, point.x);
  }
  /**
   * [northwest, northeast, southwest, southeast]
   *
   * @param {Point} point
   * @returns {Array<Cell>}
   */
  diagonals(point) {
    return array2d.diagonals(this.copyGrid(), point.y, point.x);
  }
  /**
   * [northwest, north, northeast, west, east, southwest, south, southeast]
   *
   * @param {Point} point
   * @returns {Array<Cell>}
   */
  neighbors(point) {
    return array2d.neighbors(this.copyGrid(), point.y, point.x);
  }
  /**
   * [northwest, north, northeast, west, east, southwest, south, southeast]
   *
   * @param {Point} point
   * @returns {Array<Cell>}
   */
  neighborhood(point) {
    return array2d.neighborhood(this.copyGrid(), point.y, point.x);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#euclideangrid-r1-c1-r2-c2
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Number}
   */
  euclidean(pointA, pointB) {
    return array2d.euclidean(this.copyGrid(), pointA.y, pointA.x, pointB.y, pointB.x);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#chebyshevgrid-r1-c1-r2-c2
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Number}
   */
  chebyshev(pointA, pointB) {
    return array2d.chebyshev(this.copyGrid(), pointA.y, pointA.x, pointB.y, pointB.x);
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md##manhattangrid-r1-c1-r2-c2
   *
   * @param {Point} pointA
   * @param {Point} pointB
   * @returns {Number}
   */
  manhattan(pointA, pointB) {
    return array2d.manhattan(this.copyGrid(), pointA.y, pointA.x, pointB.y, pointB.x);
  }
  // -- location/relationships
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#edgegrid-r-c
   *
   * @param {Point} point
   * @returns {Boolean}
   */
  edge(point) {
    return array2d.edge(this.copyGrid(), point.y, point.x);
  }
  // -- coordinates
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#findgrid-finder
   *
   * @param {Function} finder
   * @returns {Array<Array<Point>>}
   */
  find(finder) {
    const coordinateList = array2d.find(this.copyGrid(), finder);
    const pointList = coordinateList.map((coordinate) => {
      return new Point(coordinate[1], coordinate[0]);
    });

    return pointList;
  }
  /**
   * https://github.com/matthewtoast/Array2D.js/blob/master/REFERENCE.md#contiguousgrid-finder
   *
   * @param {Function} finder
   * @returns {Array<Array<Point>>}
   */
  contiguous(finder) {
    const coordinateList = array2d.contiguous(this.copyGrid(), finder);
    const pointList = array2d.map(coordinateList, (coordinate) => {
      return new Point(coordinate[1], coordinate[0]);
    });

    return pointList;
  }
}
