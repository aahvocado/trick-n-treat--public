import schema from 'js-schema';

import Point from '@studiomoniker/point';
import Model from 'models/Model';
import StatModel, { HealthModel, MovementModel } from 'models/StatModel';

// define attribute types
const characterSchema = schema({
  // character's name
  name: String,
  //
  characterId: String,
  // id of character type
  typeId: String,
  // health
  health: StatModel,
  // spaces character and explore
  movement: StatModel,
  // where the player is on the world
  position: Point,
})

/**
 * character class
 *
 * @typedef {Model} CharacterModel
 */
export class CharacterModel extends Model {
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      health: new HealthModel({ value: 5 }),
      movement: new MovementModel({ value: 2 }),
    }, newAttributes));

    // set schema and then validate
    this.schema = characterSchema;
    this.validate();
  }
}

export default CharacterModel;
