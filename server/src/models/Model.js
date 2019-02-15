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
  /**
   * gets all the attributes and simplifies them into a basic object
   *
   * @returns {Object}
   */
  export() {
    const exportObject = {};

    const keys = Object.keys(this.attributes);
    keys.forEach((attributeName) => {
      const attributeValue = this.get(attributeName);

      // if value is a Model then use that Model's export
      if (attributeValue instanceof Model) {
        exportObject[attributeName] = attributeValue.export();
        return;
      }

      // check if we have an array of Models
      if (Array.isArray(attributeValue)) {
        const isArrayOfModels = attributeValue[0] instanceof Model;

        if (isArrayOfModels) {
          exportObject[attributeName] = attributeValue.map((model) => (model.export()));
          return;
        }
      }

      // assign the value
      exportObject[attributeName] = attributeValue;
    })

    return exportObject;
  }
  /**
   * return a copy of this class
   * (this needs some R&D, what if we want to maintain references?)
   *
   * @returns {Object}
   */
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

export default Model;
