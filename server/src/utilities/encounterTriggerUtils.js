import * as gamestateCharacterHelper from 'helpers/gamestateCharacterHelper';

/**
 * handles the basic Encounter Trigger of adding candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddCandyTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount + value});
};
/**
 * handles the basic Encounter Trigger of subtracting candy
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseCandyTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevCandyCount = characterModel.get('candies');
  characterModel.set({candies: prevCandyCount - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddHealthTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseHealthTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('health');
  characterModel.set({health: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddMovementTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseMovementTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('movement');
  characterModel.set({movement: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddSanityTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseSanityTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('sanity');
  characterModel.set({sanity: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddVisionTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseVisionTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('vision');
  characterModel.set({vision: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddLuckTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseLuckTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('luck');
  characterModel.set({luck: prevValue - value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleAddGreedTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue + value});
};
/**
 *
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleLoseGreedTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;

  const prevValue = characterModel.get('greed');
  characterModel.set({greed: prevValue - value});
};
/**
 * @todo - does this belong here since it uses the helper...?
 *
 * @param {CharacterModel} characterModel
 * @param {EncounterTriggerData} encounterTriggerData
 */
export function handleChangePositionTrigger(characterModel, encounterTriggerData) {
  const {value} = encounterTriggerData;
  const nextPoint = new Point(value.x, value.y);

  // gameState.addToActionQueue(() => {
  gamestateCharacterHelper.updateCharacterPosition(characterModel, nextPoint);
  // })
};
