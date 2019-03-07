import schema from 'js-schema';

import Point from '@studiomoniker/point';
import Model from 'models/Model';
import StatModel, {HealthModel, MovementModel} from 'models/StatModel';

// define attribute types
const characterSchema = schema({
  // character's name
  'name': String,
  //
  'characterId': String,
  // id of character type
  'typeId': String,
  //
  'candies': Number,
  // health
  'health': StatModel,
  // spaces character and explore
  'movement': StatModel,
  // where the character is on the world
  'position': Point,
  // if this is computer controlled
  '?isCPU': Boolean,
});

/**
 * character class
 *
 * @typedef {Model} CharacterModel
 */
export class CharacterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      candies: 0,
      health: new HealthModel({value: 5}),
      movement: new MovementModel({value: 2}),
    }, newAttributes));

    // set schema and then validate
    this.schema = characterSchema;
    this.validate();
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
}
/**
 * model for a computer controlled character
 */
export class CPUCharacterModel extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);
    this.set(Object.assign({
      isCPU: true,
    }, newAttributes));
  }
}

export default CharacterModel;
