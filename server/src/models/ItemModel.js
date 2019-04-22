import Model from '../models/Model';

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
