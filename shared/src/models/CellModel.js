import {extendObservable} from 'mobx';

import Model from 'models.shared/Model';

/**
 * represents a Cell in a matrix
 */
export default class CellModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Point} */
      point: undefined,
      /** @type {Boolean} */
      visited: false,

      /** @type {Boolean} */
      top: true,
      /** @type {Boolean} */
      left: true,
      /** @type {Boolean} */
      bottom: true,
      /** @type {Boolean} */
      right: true,

      /** @type {Boolean} */
      filled: false,
      /** @type {TileType} */
      tileType: undefined,
      /** @type {Object} */
      ...newAttributes,
    });

    // computed attributes
    const _this = this;
    extendObservable(this.attributes, {
      /** @type {Array<ClientModel>} */
      get wallCount() {
        return _this.getWallCount();
      },
    });
  }
  /**
   * @returns {Number}
   */
  getWallCount() {
    return [
      this.get('top'),
      this.get('left'),
      this.get('bottom'),
      this.get('right'),
    ].filter(Boolean).length;
  }
}
