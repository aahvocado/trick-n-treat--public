import CharacterModel from 'models/CharacterModel';
/**
 *
 */
export class FastCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'FAST_CHARACTER_TYPE',
      health: 4,
      movement: 5,
      sanity: 4,
      vision: 4,
      ...newAttributes,
    });
  }
}
/**
 *
 */
export class StrongCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'STRONG_CHARACTER_TYPE',
      health: 5,
      movement: 3,
      sanity: 5,
      vision: 3,
      ...newAttributes,
    });
  }
}
/**
 *
 */
export class SmartCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'SMART_CHARACTER_TYPE',
      health: 3,
      movement: 3,
      sanity: 7,
      vision: 5,
      ...newAttributes,
    });
  }
}
