import Point from '@studiomoniker/point';

import {STAT_ID} from 'constants.shared/statIds';

import Model from 'models.shared/Model';
import ItemModel from 'models.shared/ItemModel';
import ModelList from 'models.shared/ModelList';

import * as conditionUtils from 'utilities.shared/conditionUtils';

/**
 * Character data
 *
 * @typedef {Model} CharacterModel
 */
export default class CharacterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {String} */
      name: '',
      /** @type {String} */
      characterId: '',
      /** @type {String | undefined} */
      clientId: undefined,
      /** @type {Boolean} */
      isActiveCharacter: false,

      /** @type {Number} */
      health: 0,
      /** @type {Number} */
      movement: 0,
      /** @type {Number} */
      sanity: 0,
      /** @type {Number} */
      vision: 3,

      /** @type {Number} */
      candies: 0,
      /** @type {Number} */
      tricky: 0,
      /** @type {Number} */
      treaty: 0,
      /** @type {Number} */
      luck: 0,
      /** @type {Number} */
      greed: 0,

      /** @type {Point} */
      position: new Point(),
      /** @type {ModelList<ItemModel>} */
      inventory: new ModelList([], ItemModel),

      /** @type {Object} */
      ...newAttributes,
    });

    // define some base values based on what was given
    this.set({
      /** @type {Number} */
      baseHealth: this.get('health'),
      /** @type {Number} */
      baseMovement: this.get('movement'),
      /** @type {Number} */
      baseCandies: this.get('candies'),
    });
  }
  /**
   * moves this character's position by an amount
   *
   * @param {Point} directionPoint
   */
  addToPosition(directionPoint) {
    const nextPosition = this.get('position').clone().add(directionPoint);
    this.set({position: nextPosition});
  }
  /**
   * gets the point that this character could potentially when moved a given direction
   *
   * @param {Point} directionPoint
   * @returns {Point}
   */
  getPotentialPosition(directionPoint) {
    const currentPoint = this.get('position').clone();
    return currentPoint.add(directionPoint);
  }
  /**
   * @returns {Boolean}
   */
  canMove() {
    return this.get('movement') > 0;
  }
  // -- stats
  /**
   * @param {StatId} statId
   * @returns {*}
   */
  getStatById(statId) {
    if (statId === STAT_ID.HEALTH) {
      return this.get('health');
    }

    if (statId === STAT_ID.MOVEMENT) {
      return this.get('movement');
    }

    if (statId === STAT_ID.SANITY) {
      return this.get('sanity');
    }

    if (statId === STAT_ID.VISION) {
      return this.get('vision');
    }

    if (statId === STAT_ID.CANDIES) {
      return this.get('candies');
    }

    if (statId === STAT_ID.TRICKY) {
      return this.get('tricky');
    }

    if (statId === STAT_ID.TREATY) {
      return this.get('treaty');
    }

    if (statId === STAT_ID.LUCK) {
      return this.get('luck');
    }

    if (statId === STAT_ID.GREED) {
      return this.get('greed');
    }
  }
  /**
   * @param {StatId} statId
   * @param {Number} value
   * @returns {*}
   */
  setStatById(statId, value) {
    if (statId === STAT_ID.HEALTH) {
      return this.set({health: value});
    }

    if (statId === STAT_ID.MOVEMENT) {
      return this.set({movement: value});
    }

    if (statId === STAT_ID.SANITY) {
      return this.set({sanity: value});
    }

    if (statId === STAT_ID.VISION) {
      return this.set({vision: value});
    }

    if (statId === STAT_ID.CANDIES) {
      return this.set({candies: value});
    }

    if (statId === STAT_ID.TRICKY) {
      return this.set({tricky: value});
    }

    if (statId === STAT_ID.TREATY) {
      return this.set({treaty: value});
    }

    if (statId === STAT_ID.LUCK) {
      return this.set({luck: value});
    }

    if (statId === STAT_ID.GREED) {
      return this.set({greed: value});
    }
  }
  /**
   * changes a numerical stat
   *
   * @param {String} statName - name of the stat
   * @param {Number} modNum - number to change the stat by
   */
  modifyStat(statName, modNum) {
    const currentStatNum = this.get(statName);
    this.set({
      [statName]: currentStatNum + modNum,
    });
  }
  // -- items
  /**
   * finds if Character has an Item
   * - it could either be the exact item
   * - or just an item of the same `id`
   *
   * @param {ItemModel} itemModel
   * @returns {Boolean}
   */
  hasItem(itemModel) {
    const inventory = this.get('inventory');

    // "exact item" means the itemModel is from their inventory
    const foundExactItem = inventory.find((item) => (item.id === itemModel.id));
    if (foundExactItem !== undefined) {
      return true;
    }

    // "similar item" means it does the exact thing but is not the one we own
    const foundSimilarItem = inventory.find((item) => (item.get('id') === itemModel.get('id')));
    if (foundSimilarItem !== undefined) {
      return true;
    }

    // nope otherwise
    return false;
  }
  /**
   * Note: this does not check if Character has the item.
   *
   * @param {ItemModel} itemModel
   * @returns {Boolean}
   */
  canUseItem(itemModel) {
    const conditionList = itemModel.get('conditionList');
    const doesMeetAllConditions = conditionUtils.doesMeetAllConditions(conditionList, this);
    return doesMeetAllConditions;
  }
}
