import Point from '@studiomoniker/point';

import {ENCOUNTER_TYPES} from 'constants/encounterTypes';

import Model from 'models/Model';

/**
 * @typedef {Model} EncounterModel
 *
 * @typedef {Object} EncounterData
 * @property {String} EncounterData.id
 * @property {String} EncounterData.title
 * @property {String} EncounterData.content
 * @property {Array<EncounterAction>} EncounterData.actions
 *
 * @typedef {Object} EncounterAction
 * @property {String} EncounterAction.actionId
 * @property {String} EncounterAction.name
 */
export class EncounterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Point} */
      location: new Point(),
      /** @type {Array<CharacterModel>} */
      visitors: [],

      /** @type {EncounterType} */
      typeId: '',
      /** @type {EncounterData} */
      encounterData: {
        id: undefined,
        title: '',
        content: '',
        actions: [],
      },

      /** @type {Boolean} */
      isActionable: false,
      /** @type {Number} */
      triggerCount: 0,
      /** @type {Function} */
      onTrigger: () => {},
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
    const onTrigger = this.get('onTrigger');
    onTrigger(characterModel);

    // finally, update the count
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
}
export default EncounterModel;
