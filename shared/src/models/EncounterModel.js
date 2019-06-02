import Point from '@studiomoniker/point';

import Model from 'models.shared/Model';

import * as conditionUtils from 'utilities.shared/conditionUtils';

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
      /** @type {Array<ConditionData>} */
      conditionList: [],
      /** @type {Array<TagId>} */
      tagList: [],
      /** @type {Array<TriggerData>} */
      triggerList: [],

      // -- configured
      /** @type {Point} */
      location: new Point(),

      // -- instance data
      /** @type {Array<CharacterModel>} */
      visitors: [],
      /** @type {Array<CharacterModel>} */
      trickers: [],
      /** @type {Array<CharacterModel>} */
      treaters: [],
      /** @type {Object} */
      ...newAttributes,
    });
  }
  /**
   * called when Character triggers this
   *
   * @param {CharacterModel} characterModel
   */
  addVisit(characterModel) {
    this.addToArray('visitors', characterModel);
  }
  /**
   * get number of times a Character has visited
   *
   * @param {CharacterModel} characterModel
   * @returns {Number}
   */
  getVisitsBy(characterModel) {
    const visitors = this.get('visitors');
    return visitors.reduce((count, character) => {
      if (character.get('id') === characterModel.get('id')) {
        count += 1;
      }

      return count;
    }, 0);
  }
  /**
   * get number of times a Character has Trick'd here
   *
   * @param {CharacterModel} characterModel
   * @returns {Number}
   */
  getTricksBy(characterModel) {
    const trickers = this.get('trickers');
    return trickers.reduce((count, character) => {
      if (character.get('id') === characterModel.get('id')) {
        count += 1;
      }

      return count;
    }, 0);
  }
  /**
   * get number of times a Character has Treat'd here
   *
   * @param {CharacterModel} characterModel
   * @returns {Number}
   */
  getTreatsBy(characterModel) {
    const treaters = this.get('treaters');
    return treaters.reduce((count, character) => {
      if (character.get('id') === characterModel.get('id')) {
        count += 1;
      }

      return count;
    }, 0);
  }
  /**
   * get Set of unique visitors
   *
   * @returns {Set}
   */
  getUniqueVisitors() {
    const visitors = this.get('visitors');
    return new Set(visitors);
  }
  /**
   * get Set of unique trickers
   *
   * @returns {Set}
   */
  getUniqueTrickers() {
    const trickers = this.get('trickers');
    return new Set(trickers);
  }
  /**
   * get Set of unique treaters
   *
   * @returns {Set}
   */
  getUniqueTreaters() {
    const treaters = this.get('treaters');
    return new Set(treaters);
  }
  /**
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  canBeEncounteredBy(characterModel) {
    const conditionList = this.get('conditionList');
    const doesMeetAllConditions = conditionUtils.doesMeetAllConditions(conditionList, characterModel, this);
    return doesMeetAllConditions;
  }
}
