import CharacterModel from 'models/CharacterModel';
import StatModel, {
  HealthModel,
  MovementModel,
  SanityModel,
  StatModel,
} from 'models/StatModel';

export class FastCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'FAST_CHARACTER_TYPE',
      health: new HealthModel({base: 4}),
      movement: new MovementModel({base: 5}),
      sanity: new SanityModel({base: 4}),
      vision: new StatModel({base: 4}),
      ...newAttributes,
    });
  }
}
export class StrongCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'STRONG_CHARACTER_TYPE',
      health: new HealthModel({base: 5}),
      movement: new MovementModel({base: 3}),
      sanity: new SanityModel({base: 5}),
      vision: new StatModel({base: 3}),
      ...newAttributes,
    });
  }
}
export class SmartCharacter extends CharacterModel {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      typeId: 'SMART_CHARACTER_TYPE',
      health: new HealthModel({base: 3}),
      movement: new MovementModel({base: 3}),
      sanity: new SanityModel({base: 7}),
      vision: new StatModel({base: 5}),
      ...newAttributes,
    });
  }
}
