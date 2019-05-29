import Point from '@studiomoniker/point';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import Model from 'models.shared/Model';

// import gameState from 'state/gameState'; // eeek

import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

/**
 * UserModel is going to act as the interpreter
 *  between the player (Client) and the character they are controlling
 *
 * @typedef {Model} UserModel
 */
export default class UserModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      /** @type {ClientModel | null} */
      clientModel: null,
      /** @type {CharacterModel | null} */
      characterModel: null,
      /** @type {Object} */
      ...newAttributes,
    });

    // `addListeners()` when a Client and Character is finally set on this user
    this.onChange('clientModel', () => {
      if (this.get('clientModel') !== null && this.get('characterModel') !== null) {
        this.addListeners();
      }
    });
    this.onChange('characterModel', () => {
      if (this.get('clientModel') !== null && this.get('characterModel') !== null) {
        this.addListeners();
      }
    });
  }
  /**
   * attaches listeners
   */
  addListeners() {
    const socket = this.get('clientModel').get('socket');

    // client clicked to move to a Coordinate
    socket.on(SOCKET_EVENT.TO_SERVER.MOVE_TO, this.onMoveTo.bind(this));

    // client clicked an Action from the Encounter modal
    socket.on(SOCKET_EVENT.TO_SERVER.CHOSE_ACTION, this.onEncounterAction.bind(this));

    // client used an Item
    socket.on(SOCKET_EVENT.TO_SERVER.USE_ITEM, this.onUseItem.bind(this));
  }
  /**
   *
   */
  onMoveTo(coordinates) {
    const position = new Point(coordinates.x, coordinates.y);
    gamestateCharacterHelper.moveCharacterTo(this.get('characterModel'), position);
  }
  /**
   *
   */
  onEncounterAction(encounterId, actionData) {
    gamestateCharacterHelper.handleCharacterChoseAction(this.get('characterModel'), encounterId, actionData);
  }
  /**
   *
   */
  onUseItem(itemData) {
    const itemModel = new ItemModel(itemData);
    gamestateCharacterHelper.handleCharacterUseItem(this.get('characterModel'), itemModel);
  }
}
