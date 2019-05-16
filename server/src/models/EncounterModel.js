import Point from '@studiomoniker/point';

import Model from 'models/Model';

/**
 * @typedef {Model} EncounterModel
 */
export default class EncounterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      // -- existing data
      /** @type {String} */
      id: '',
      /** @type {String} */
      title: '',
      /** @type {String} */
      content: '',
      /** @type {Array<ActionData>} */
      actionList: [],
      /** @type {Array<TagId>} */
      tagList: [],
      /** @type {Array<TriggerData>} */
      triggerList: [],

      // -- configured
      /** @type {Point} */
      location: new Point(),

      // -- instance data
      /** @type {Number} */
      triggerCount: 0,
      /** @type {Array<CharacterModel>} */
      visitors: [],
      //
      ...newAttributes,
    });
  }
  // -- instance methods
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
      actionList,
      id,
      content,
      location,
      tagList,
      title,
      triggerList,
    } = exportData;

    return {
      actionList,
      id,
      content,
      location,
      tagList,
      title,
      triggerList,
    };
  }
}
