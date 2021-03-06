/**
 * these should be used to indicate what type of data an object represents
 *  so we can be certain some block of data represents an Encounter or an Item
 *  or if it's a Trigger or Action
 *
 * @typedef {String} DataType
 */

export const DATA_TYPE = {
  ENCOUNTER: 'DATA_TYPE.ENCOUNTER',
  HOUSE: 'DATA_TYPE.HOUSE',
  ITEM: 'DATA_TYPE.ITEM',

  ACTION: 'DATA_TYPE.ACTION',
  CONDITION: 'DATA_TYPE.CONDITION',
  TRIGGER: 'DATA_TYPE.TRIGGER',
  TAG: 'DATA_TYPE.TAG',
};
//
export const PRIMARY_DATA_TYPE_LIST = [
  DATA_TYPE.ENCOUNTER,
  DATA_TYPE.HOUSE,
];
