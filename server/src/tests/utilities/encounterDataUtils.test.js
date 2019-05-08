import test from 'ava';

import * as encounterDataUtils from 'utilities.shared/encounterDataUtils';

let testEncounterData;

test.beforeEach((t) => {
  testEncounterData = {
    "id": "ENCOUNTER_ID.TEST_ADD_HEALTH",
    "title": "Test Adding Health",
    "content": "You got 1 health",
    "tagList": [
      "TAG_ID.SIDEWALK",
      "TAG_ID.DEBUG"
    ],
    "actionList": [
      {
        "label": "Okay 0",
        "actionId": "ENCOUNTER_ACTION_ID.CONFIRM"
      },
      {
        "label": "Okay 1",
        "actionId": "ENCOUNTER_ACTION_ID.CONFIRM"
      }
    ],
    "triggerList": [
      {
        "triggerId": "ENCOUNTER_TRIGGER_ID.HEALTH.ADD",
        "value": 1,
        "conditionList": [
          {
            "conditionId": "ENCOUNTER_CONDITION_ID.LESS_THAN",
            "conditionTargetId": "CONDITION_TARGET_ID.STAT.HEALTH",
            "value": 2
          }
        ]
      }
    ]
  };
})

test('getId()', (t) => {
  const id = encounterDataUtils.getId(testEncounterData);
  t.is(id, 'ENCOUNTER_ID.TEST_ADD_HEALTH');
})

test('getActionList()', (t) => {
  const actionList = encounterDataUtils.getActionList(testEncounterData);
  t.is(actionList.length, 2);
})

test('getActionAt()', (t) => {
  const encounterActionData = encounterDataUtils.getActionAt(testEncounterData, 1);
  t.is(encounterActionData.label, 'Okay 1');
})

test('getTriggerList()', (t) => {
  const triggerList = encounterDataUtils.getTriggerList(testEncounterData);
  t.is(triggerList.length, 1);
})

test('getTriggerAt()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  t.is(encounterTriggerData.triggerId, 'ENCOUNTER_TRIGGER_ID.HEALTH.ADD');
  t.is(encounterTriggerData.value, 1);
})

test('getTriggerId()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  const triggerId = encounterDataUtils.getTriggerId(encounterTriggerData);
  t.is(triggerId, 'ENCOUNTER_TRIGGER_ID.HEALTH.ADD');
})

test('getTriggerConditionList()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  const conditionList = encounterDataUtils.getTriggerConditionList(encounterTriggerData);
  t.is(conditionList.length, 1);
})

test('getTriggerConditionAt()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  const conditionData = encounterDataUtils.getTriggerConditionAt(encounterTriggerData, 0);
  t.is(conditionData.conditionId, 'ENCOUNTER_CONDITION_ID.LESS_THAN');
  t.is(conditionData.conditionTargetId, 'CONDITION_TARGET_ID.STAT.HEALTH');
})

test('getTriggerConditionId()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  const conditionData = encounterDataUtils.getTriggerConditionAt(encounterTriggerData, 0);
  const conditionId = encounterDataUtils.getTriggerConditionId(conditionData);
  t.is(conditionId, 'ENCOUNTER_CONDITION_ID.LESS_THAN');
})

test('getTriggerConditionTargetId()', (t) => {
  const encounterTriggerData = encounterDataUtils.getTriggerAt(testEncounterData, 0);
  const conditionData = encounterDataUtils.getTriggerConditionAt(encounterTriggerData, 0);
  const conditionTargetId = encounterDataUtils.getTriggerConditionTargetId(conditionData);
  t.is(conditionTargetId, 'CONDITION_TARGET_ID.STAT.HEALTH');
})

