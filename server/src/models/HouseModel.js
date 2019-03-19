import Point from '@studiomoniker/point';
import Model from 'models/Model';

/**
 * house class
 *
 * @typedef {Model} HouseModel
 */
export class HouseModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {Point} */
      position: new Point(),

      /**
       * @type {Function}
       * @returns {Boolean}
       */
      checkCanTrick: () => true,
      /** @type {Function} */
      onTrick: () => {},
      /**
       * @type {Function}
       * @returns {Boolean}
       */
      checkCanTreat: () => true,
      /** @type {Function} */
      onTreat: () => {},

      /** @type {Array<CharacterModel>} */
      visitors: [],
      /** @type {Array<CharacterModel>} */
      treaters: [],
      /** @type {Array<CharacterModel>} */
      trickers: [],
      //
      ...newAttributes,
    });

    // by default, a character can only Trick or Treat a house once
    //  and Tricking is mean so they'll be closed after
    this.set({
      checkCanTrick: (houseModel, characterModel) => {
        return !this.hasVisitedAlready(characterModel) && this.get('trickers').length <= 0;
      },
      checkCanTreat: (houseModel, characterModel) => {
        return !this.hasVisitedAlready(characterModel) && this.get('trickers').length <= 0;
      },
    });
  }
  /**
   * @param {CharacterModel} characterModel
   */
  addToVisitors(characterModel) {
    this.addToArray('visitors', characterModel);
  }
  /**
   * base function that will be called when a character Tricks here
   *
   * @param {CharacterModel} characterModel
   */
  triggerTrick(characterModel) {
    const onTrick = this.get('onTrick');
    onTrick(this, characterModel);

    this.addToArray('trickers', characterModel);
    this.addToVisitors(characterModel);
  }
  /**
   * base function that will be called when a character Treats here
   *
   * @param {CharacterModel} characterModel
   */
  triggerTreat(characterModel) {
    const onTreat = this.get('onTreat');
    onTreat(this, characterModel);

    this.addToArray('treaters', characterModel);
    this.addToVisitors(characterModel);
  }
  // --
  /**
   * determines if this house can be Trick'd by given character
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  isTrickable(characterModel) {
    const checkCanTrick = this.get('checkCanTrick');
    return checkCanTrick(this, characterModel);
  }
  /**
   * determines if this house can be Treat'd by given character
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  isTreatable(characterModel) {
    const checkCanTreat = this.get('checkCanTreat');
    return checkCanTreat(this, characterModel);
  }
  // --
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
   * determines if character already `tricked` here
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  hasTrickedAlready(characterModel) {
    const trickers = this.get('trickers');
    if (trickers.includes(characterModel)) {
      return true;
    }

    return false;
  }
  /**
   * determines if character already `treated` here
   *
   * @param {CharacterModel} characterModel
   * @returns {Boolean}
   */
  hasTreatedAlready(characterModel) {
    const treaters = this.get('treaters');
    if (treaters.includes(characterModel)) {
      return true;
    }

    return false;
  }
}

export default HouseModel;
