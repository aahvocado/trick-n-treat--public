import schema from 'js-schema';

import Model from 'models/Model';

// define attribute types
const playerSchema = schema({
  // player's name
  name: String,
  // id of player's chosen character
  '?characterId': String,
  //
  isPlayerTurn: Boolean,
  //
  canMoveLeft: Boolean,
  //
  canMoveRight: Boolean,
  //
  canMoveUp: Boolean,
  //
  canMoveDown: Boolean,
  //
  canTrick: Boolean,
  //
  canTreat: Boolean,
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
      isPlayerTurn: false,
      canMoveLeft: false,
      canMoveRight: false,
      canMoveUp: false,
      canMoveDown: false,
      canTrick: false,
      canTreat: false,
    }, newAttributes));

    // set schema and then validate
    this.schema = playerSchema;
    this.validate();
  }
  /**
   * @returns {Boolean}
   */
  canMove() {
    return this.get('canMoveLeft') || this.get('canMoveRight') || this.get('canMoveUp') || this.get('canMoveDown');
  }
}

export default PlayerModel;
