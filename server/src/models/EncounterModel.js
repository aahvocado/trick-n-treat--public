import Point from '@studiomoniker/point';
import Model from 'models/Model';

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
  }
  /**
   * base function that will be called when a character gets on this
   *
   * @abstract
   * @param {CharacterModel} characterModel
   */
  trigger(characterModel) {
    const onTrigger = this.get('onTrigger');
    onTrigger(characterModel);

    this.set({triggerCount: this.attributes.triggerCount + 1});
  }
}
export default EncounterModel;
