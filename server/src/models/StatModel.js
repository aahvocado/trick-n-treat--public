import schema from 'js-schema';

import Model from '../models/Model';

// define attribute types
const statSchema = schema({
  // id of stat
  typeId: String,
  // base value
  base: Number,
  // current value
  value: Number,
  // temporary change of values
  modifier: Number,
});

export const STAT_TYPE_ID = {
  HEALTH: 'HEALTH-STAT-TYPE',
  MOVEMENT: 'MOVEMENT-STAT-TYPE',
};

const STAT_NAME = {
  [STAT_TYPE_ID.HEALTH]: 'Health',
  [STAT_TYPE_ID.MOVEMENT]: 'Movement',
};

/**
 * stat class
 *
 * @typedef {Model} StatModel
 */
export class StatModel extends Model {
  /** @override */
  constructor(newAttributes = {}) {
    super(newAttributes);

    // apply default attributes and then override with given ones
    this.set(Object.assign({
      base: 0,
      value: 0,
      modifier: 0,
    }, newAttributes));

    // set schema and then validate
    this.schema = statSchema;
    this.validate();
  }
  /**
   * finds out what the name of this stat is by its type
   *
   * @returns {String}
   */
  getDisplayName() {
    return STAT_NAME[this.get('typeId')];
  }
}
/**
 *
 */
export class HealthModel extends StatModel {
  /** @override */
  constructor(newAttributes = {}) {
    super(Object.assign({
      typeId: STAT_TYPE_ID.HEALTH,
    }, newAttributes));
  }
}
/**
 *
 */
export class MovementModel extends StatModel {
  /** @override */
  constructor(newAttributes = {}) {
    super(Object.assign({
      typeId: STAT_TYPE_ID.MOVEMENT,
    }, newAttributes));
  }
}

export default StatModel;
