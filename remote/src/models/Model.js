import uuid from 'uuid/v4';

/**
 * Model base class
 *
 * @typedef {Object} Model
 */
export class Model {
  constructor() {
    /** @type {String} */
    this.id = uuid();
  }
  /**
   * gets a specific attribute
   *
   * @param {String} attributeName
   * @returns {* | undefined} - returns given attribute
   */
  get(attributeName) {
    return this.attributes[attributeName]
  }
  /**
   * assigns and updates these attributes
   *
   * @param {Object} changes
   * @returns {Object} - returns all attributes
   */
  set(changes) {
    this.attributes = Object.assign({}, this.attributes, changes);
    return this.attributes;
  }
  /**
   * makes sure attributes match the schema
   *
   * @returns {Boolean}
   */
  validate() {
    const valid = this.schema(this.attributes);

    if (!valid) {
      console.error(this.constructor.name, this.schema.errors(this.attributes));
    }

    return valid;
  }
}

export default Model;
