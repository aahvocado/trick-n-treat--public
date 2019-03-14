import schema from 'js-schema';

import Point from '@studiomoniker/point';
import Model from 'models/Model';

// define attribute types
const encounterSchema = schema({
  // id
  'typeId': String,
  // where this is in the world
  'position': Point,
  // callback for when a character steps on this
  '?onTrigger': Function,
  // how many times this encounter has triggered
  'triggerCount': Number,
});

/**
 * @typedef {Model} EncounterModel
 */
export class EncounterModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super({
      position: new Point(),
      onTrigger: undefined,
      triggerCount: 0,
      ...newAttributes,
    });

    // set schema and then validate
    this.schema = encounterSchema;
    // this.validate();
  }
  /**
   * base function that will be called when a character gets on this
   *
   * @abstract
   * @param {CharacterModel} characterModel
   */
  trigger(characterModel) {
    console.log('encounter trigger');
    const onTrigger = this.get('onTrigger');
    onTrigger(characterModel);

    this.set({triggerCount: this.attributes.triggerCount + 1});
  }
}
export default EncounterModel;
