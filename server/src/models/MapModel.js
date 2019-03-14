import Point from '@studiomoniker/point';
import MatrixModel from 'models/MatrixModel';

import TILE_TYPES from 'constants/tileTypes';

import * as mapGenerationUtils from 'utilities/mapGenerationUtils';
import * as matrixUtils from 'utilities/matrixUtils';

/**
 * abstract helper that organizes all the map generation utility functions
 *
 * @typedef {Model} MapModel
 */
export class MapModel extends MatrixModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      matrix: [[]],
      // rules for how this map should be generated
      mapConfig: {},
      // where the starting location of the map is made
      start: new Point(),
      // TODO - mapmodel does not need this, handle it differently - should probably be encounters
      specialPoints: [],
      ...newAttributes,
    });
  }
  /**
   * handles through the entire generation process
   *
   * @param {MapConfig} mapConfig
   */
  generateMap() {
    const mapConfig = this.get('mapConfig');

    // create an empty Matrix
    const emptyMatrix = matrixUtils.createMatrix(mapConfig.width, mapConfig.height, TILE_TYPES.EMPTY);
    this.set({matrix: emptyMatrix});

    // set our starting point Tile
    const startPoint = mapConfig.startPoint.clone();
    this.set({start: startPoint});
    this.setTileAt(startPoint, TILE_TYPES.START);

    // create special tiles on the Map
    mapGenerationUtils.generateSpecialTiles(this, mapConfig);

    // create paths on the Map
    mapGenerationUtils.executeRandomWalk(this, mapConfig);

    // generate tiles which are encounters
    mapGenerationUtils.generateEncounterTiles(this, mapConfig);

    // generate sectors of houses
    mapGenerationUtils.generateHouseSectors(this, mapConfig);
  }
}

export default MapModel;
