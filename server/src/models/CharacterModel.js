import Point from '@studiomoniker/point';
import Model from 'models/Model';

/**
 * character class
 *
 * @typedef {Model} CharacterModel
 */
export class CharacterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {String} */
      name: '',
      /** @type {String} */
      characterId: '',
      /** @type {String} */
      typeId: '',
      /** @type {Point} */
      position: new Point(),

      /** @type {Number} */
      health: 0,
      /** @type {Number} */
      movement: 0,
      /** @type {Number} */
      sanity: 0,
      /** @type {Number} */
      vision: 3,

      /** @type {Number} */
      candies: 0,
      /** @type {Number} */
      luck: 0,
      /** @type {Number} */
      greed: 0,
      //
      ...newAttributes,
    });

    // define some base values based on what was given
    this.set({
      /** @type {Number} */
      baseHealth: this.get('health'),
      /** @type {Number} */
      baseMovement: this.get('movement'),
      /** @type {Number} */
      baseCandies: this.get('candies'),
    });
  }
  /**
   * moves this character's position by an amount
   *
   * @param {Point} directionPoint
   */
  addToPosition(directionPoint) {
    const nextPosition = this.get('position').clone().add(directionPoint);
    this.set({position: nextPosition});
  }
  /**
   * gets the point that this character could potentially when moved a given direction
   *
   * @param {Point} directionPoint
   * @returns {Point}
   */
  getPotentialPosition(directionPoint) {
    const currentPoint = this.get('position').clone();
    return currentPoint.add(directionPoint);
  }
  /**
   * @returns {Boolean}
   */
  canMove() {
    return this.get('movement') > 0;
  }
}

export default CharacterModel;
