import Point from '@studiomoniker/point';

import Model from 'models/Model';

/**
 * @typedef {Model} EncounterModel
 *
 * @typedef {Object} EncounterAction
 * @property {String} EncounterAction.actionId
 * @property {String} EncounterAction.name
 */
export default class EncounterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- will be shared
      /** @type {String} */
      id: '',
      /** @type {String} */
      title: '',
      /** @type {String} */
      content: '',
      /** @type {Array<EncounterAction>} */
      actions: [],

      // -- configure me
      /** @type {Point} */
      location: new Point(),
      /** @type {Array<EncounterTag>} */
      tagList: [],
      /** @type {Array<EncounterTriggerData>} */
      triggerList: [],

      // -- local data
      /** @type {Number} */
      triggerCount: 0,
       /** @type {Array<CharacterModel>} */
      visitors: [],
      //
      ...newAttributes,
    });
  }
  /**
   * base function that will be called when a character gets on this
   *
   * @param {CharacterModel} characterModel
   */
  trigger(characterModel) {
    this.set({triggerCount: this.attributes.triggerCount + 1});
    this.addToArray('visitors', characterModel);
  }
  /**
   * @abstract
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  canTrigger(characterModel) {
    return !this.hasVisitedAlready(characterModel);
  }
  /**
   * determines if character has done anything here
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  hasVisitedAlready(characterModel) {
    const visitors = this.get('visitors');
    if (visitors.includes(characterModel)) {
      return true;
    }

    return false;
  }
  /**
   * exports just the data that is relevant for the Remote/Screen
   *
   * @returns {Object}
   */
  exportEncounterData() {
    const exportData = this.export();
    const {
      id,
      location,
      title,
      content,
      actions,
    } = exportData;

    return {
      id,
      location,
      title,
      content,
      actions,
    };
  }
}
