import Point from '@studiomoniker/point';

import Model from 'models/Model';

import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

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
      /** @type {Array<EncounterActionData>} */
      actionList: [],
      /** @type {Array<TagId>} */
      tagList: [],
      /** @type {Array<EncounterTriggerData>} */
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
  // -- utilities
  /**
   * @returns {String}
   */
  getId() {
    return encounterDataUtils.getId(this.attributes);
  }
  /**
   * @returns {Array<EncounterActionData>}
   */
  getActionList() {
    return encounterDataUtils.getActionList(this.attributes);
  }
  /**
   * @param {Number} idx
   * @returns {EncounterActionData}
   */
  getActionAt(idx) {
    return encounterDataUtils.getActionAt(this.attributes, idx);
  }
  /**
   * @returns {Array<EncounterTriggerData>}
   */
  getTriggerList() {
    return encounterDataUtils.getTriggerList(this.attributes);
  }
  /**
   * @param {Number} idx
   * @returns {EncounterTriggerData}
   */
  getTriggerAt(idx) {
    return encounterDataUtils.getTriggerAt(this.attributes);
  }
  /**
   * @param {EncounterTriggerData} encounterTriggerData
   * @returns {TriggerId}
   */
  getTriggerId(encounterTriggerData) {
    return encounterDataUtils.getTriggerAt(encounterTriggerData);
  }
  /**
   * @param {EncounterTriggerData} encounterTriggerData
   * @returns {Array<ConditionData>}
   */
  getTriggerConditionList(encounterTriggerData) {
    return encounterDataUtils.getTriggerAt(encounterTriggerData);
  }
  /**
   * @param {EncounterTriggerData} encounterTriggerData
   * @param {Number} idx
   * @returns {Array<ConditionData>}
   */
  getTriggerConditionAt(encounterTriggerData, idx) {
    return encounterDataUtils.getTriggerAt(encounterTriggerData, idx);
  }
  /**
   * @param {ConditionData} conditionData
   * @returns {ConditionId}
   */
  getTriggerConditionId(conditionData) {
    return encounterDataUtils.getTriggerAt(conditionData);
  }
  /**
   * @param {ConditionData} conditionData
   * @returns {ConditionId}
   */
  getTriggerConditionTargetId(conditionData) {
    return encounterDataUtils.getTriggerAt(conditionData);
  }
}
