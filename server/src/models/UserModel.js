import schema from 'js-schema';

import Model from 'models/Model';

// define attribute types
const userSchema = schema({
  // user's name
  'name': String,
  // defined id of this user
  'userId': String,
  // id of user's chosen character
  '?characterId': String,
  //
  'isUserTurn': Boolean,
  //
  'canMoveLeft': Boolean,
  //
  'canMoveRight': Boolean,
  //
  'canMoveUp': Boolean,
  //
  'canMoveDown': Boolean,
  //
  'canTrick': Boolean,
  //
  'canTreat': Boolean,
});

/**
 * user class
 *
 * @typedef {Model} UserModel
 */
export class UserModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      name: '',
      isUserTurn: false,
      canMoveLeft: false,
      canMoveRight: false,
      canMoveUp: false,
      canMoveDown: false,
      canTrick: false,
      canTreat: false,
      ...newAttributes,
    });

    // set schema and then validate
    this.schema = userSchema;
    this.validate();
  }
  /**
   * @returns {Boolean}
   */
  canMove() {
    return this.get('canMoveLeft') || this.get('canMoveRight') || this.get('canMoveUp') || this.get('canMoveDown');
  }
}

export default UserModel;
