import schema from 'js-schema';

import Model from '../models/Model';

// define attribute types
const itemSchema = schema({
  // id
  'typeId': String,
  // name
  'name': String,
  // what this item does when used (not certain how this works yet)
  '?actionId': String,
});

export const ITEM_TYPE_ID = {
  WEAPON: 'WEAPON-ITEM-TYPE',
  CONSUMABLE: 'CONSUMABLE-ITEM-TYPE',
};

/**
 * @typedef {Model} ItemModel
 */
export class ItemModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      name: 'undefined item',
      ...newAttributes,
    });

    // set schema and then validate
    this.schema = itemSchema;
    this.validate();
  }
}
/**
 * @typedef {ItemModel} WeaponModel
 */
export class WeaponModel extends ItemModel {
  /** @override */
  constructor(newAttributes = {}) {
    super(Object.assign({
      typeId: ITEM_TYPE_ID.WEAPON,
    }, newAttributes));
  }
}
/**
 * @typedef {ItemModel} ConsumableModel
 */
export class ConsumableModel extends ItemModel {
  /** @override */
  constructor(newAttributes = {}) {
    super(Object.assign({
      typeId: ITEM_TYPE_ID.CONSUMABLE,
    }, newAttributes));
  }
}

export default ItemModel;
