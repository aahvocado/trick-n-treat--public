import schema from 'js-schema';

import Point from '@studiomoniker/point';
import Model from 'models/Model';
import StatModel, {HealthModel, MovementModel} from 'models/StatModel';

// define attribute types
const characterSchema = schema({
  // character's name
  'name': String,
  // unique id of Character, used to match with User
  'characterId': String,
  // id of character type
  'typeId': String,

  // health
  'health': StatModel,
  // spaces character can move
  'movement': StatModel,
  // mental toughness
  'sanity': StatModel,
  // how far character can see
  'vision': StatModel,

  // currency?
  'candies': Number,
  // fun times
  'luck': StatModel,
  // take everything
  'greed': StatModel,

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
    super({
      candies: 0,
      health: new HealthModel({value: 5}),
      movement: new MovementModel({value: 2}),

      luck: new StatModel({base: 0}),
      greed: new StatModel({base: 0}),
      ...newAttributes,
    });

    // set schema and then validate
    this.schema = characterSchema;
    // this.validate();
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
