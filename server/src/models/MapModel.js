import Point from '@studiomoniker/point';

import MatrixModel from 'models/MatrixModel';

/**
 * abstract helper that organizes all the map generation utility functions
 *
 * @typedef {Model} MapModel
 */
export class MapModel extends MatrixModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Matrix} */
      matrix: undefined,
      /** @type {Object} */
      mapSettings: undefined,
      /** @type {Point} */
      start: new Point(),
      /** @type {Array} */
      specialPoints: [],
      // other
      ...newAttributes,
    });
  }
}

export default MapModel;
