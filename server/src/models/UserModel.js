import Model from 'models/Model';

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
  }
  /**
   * @returns {Boolean}
   */
  canMove() {
    return this.get('canMoveLeft') || this.get('canMoveRight') || this.get('canMoveUp') || this.get('canMoveDown');
  }
}

export default UserModel;
