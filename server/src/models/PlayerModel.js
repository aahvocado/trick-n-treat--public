import schema from 'js-schema';

import Model from '../models/Model';

// define attribute types
const playerSchema = schema({
  // player's name
  name: String,
  // id of player's chosen character
  '?selectedCharacterId': String,
})

/**
 * player class
 *
 * @typedef {Model} PlayerModel
 */
export class PlayerModel extends Model {
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      name: '',
    }, newAttributes));

    // set schema and then validate
    this.schema = playerSchema;
    this.validate();
  }
}

export default PlayerModel;
