import Model from 'models.shared/Model';

/**
 * Item
 *
 * @typedef {Model} ItemModel
 */
export default class ItemModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {String} */
      id: '',
      /** @type {String} */
      name: '',
      /** @type {String} */
      description: '',
      /** @type {Array<TriggerData>} */
      triggerList: [],

      /** @type {Boolean} */
      isConsumable: false,
      /** @type {Number} */
      quantity: 1,

      /** @type {Array<TagId>} */
      tagList: [],

      //
      ...newAttributes,
    });
  }
}
