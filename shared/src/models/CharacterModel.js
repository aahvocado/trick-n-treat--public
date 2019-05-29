import Point from '@studiomoniker/point';

import Model from 'models.shared/Model';

import * as conditionHandlerUtils from 'utilities/conditionHandlerUtils';

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
      luck: 0,
      /** @type {Number} */
      greed: 0,

      /** @type {Point} */
      position: new Point(),
      /** @type {Array<ItemModel>} */
      inventory: [],

      //
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
    const doesMeetAllConditions = conditionHandlerUtils.doesMeetAllConditions(this, conditionList);
    return doesMeetAllConditions;
  }
  /**
   * Uses an Item by resolvi all triggers in an Item
   *  the Character must have the Item in `inventory`.
   *
   * @param {ItemModel} itemModel
   */
  useItem(itemModel) {
    // character must have it
    if (!this.hasItem(itemModel)) {
      logger.warning(`"${this.get('name')}" tried to use "${itemModel.get('name')}" but does not have it.`);
      return;
    }

    // check if character was allowed to use this item
    if (!characterModel.canUseItem(itemModel)) {
      logger.warning(`"${characterModel.get('name')}" tried to use "${itemModel.get('name')}" but does not meet use conditions.`);
      return;
    }

    // find the Exact Matching Item type in our inventory and find out how to consume it
    if (itemModel.get('isConsumable')) {
      this.consumeItem(itemModel);
    }

    // resolve triggers
    const triggerList = itemModel.get('triggerList');
    triggerList.forEach((triggerData) => {
      triggerHandlerUtil.resolveTrigger(triggerData, characterModel);
    });
  }
  /**
   * handles removing an item from Character's inventory or using one quantity of it
   *
   * @param {ItemModel} itemModel
   */
  consumeItem(itemModel) {
    // find the "exact match" item in Character's inventory
    // (using index in case we want to remove it completely)
    const inventory = this.get('inventory');
    const foundItemIdx = inventory.findIndex((inventoryItem) => (inventoryItem.get('id') === itemModel.get('id')));

    // not found
    if (foundItemIdx <= 0) {
      logger.warning(`"${this.get('name')}" does not have "${itemModel.get('name')}" to remove.`);
      return;
    }

    // grab the actual ItemModel and its quantity
    const exactItemModel = inventory[foundItemIdx];
    const itemQuantity = exactItemModel.get('quantity');

    // if there will be none left, remove it
    if (itemQuantity <= 1) {
      inventory.splice(foundItemIdx, 1);
      this.set({inventory: inventory});
      return;
    }

    // otherwise we can just subtract one from the item's quantity
    if (itemQuantity > 1) {
      exactItemModel.set({quantity: itemQuantity - 1});
    }
  }
}
