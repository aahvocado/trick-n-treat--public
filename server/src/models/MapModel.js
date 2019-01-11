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

    const generatedMap = mapGenerationUtils.generateMap({
      width: 20,
      height: 20,
      numSpecials: 10,
    });

    this.set(Object.assign({
      map: generatedMap,
    }, newAttributes));
  }
  /**
   * returns the tile located at a coordinate
   *
   * @param {Point} x, y
   * @returns {Tile}
   */
  getTileAt({x, y}) {
    return this.get('map')[x][y];
  }
}

export default MapModel;
