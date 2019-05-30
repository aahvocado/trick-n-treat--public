import Model from 'models.shared/Model';

import * as conditionUtils from 'utilities.shared/conditionUtils';

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
      conditionList: [],
      /** @type {Array<TriggerData>} */
      triggerList: [],

      /** @type {Boolean} */
      isConsumable: false,
      /** @type {Number} */
      quantity: 1,

      /** @type {Array<TagId>} */
      tagList: [],

      /** @type {SourceId} */
      attributeSource: undefined,
      /** @type {Object} */
      ...newAttributes,
    });
  }
  /**
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  canBeUsedBy(characterModel) {
    const conditionList = this.get('conditionList');
    const doesMeetAllConditions = conditionUtils.doesMeetAllConditions(characterModel, conditionList);
    return doesMeetAllConditions;
  }
}
