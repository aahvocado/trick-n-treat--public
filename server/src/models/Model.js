import {
  get,
  observable,
  reaction,
  set,
  toJS,
} from 'mobx';
import uuid from 'uuid/v4';

/**
 * Model base class
 *
 * @typedef {Object} Model
 */
export class Model {
  /**
   * @constructor
   * @param {Object} newAttributes
   */
  constructor(newAttributes = {}) {
    /** @type {String} */
    this.id = uuid();

    this.attributes = observable(newAttributes);
  }
  /**
   * gets a specific attribute
   *
   * @param {String} attributeName
   * @returns {* | undefined} - returns given attribute
   */
  get(attributeName) {
    return get(this.attributes, attributeName);
  }
  /**
   * assigns and updates these attributes
   *
   * @param {Object} changes
   */
  set(changes) {
    set(this.attributes, changes);
  }
  /**
   * PROPOSAL FUNCTION
   *
   * @param {String} arrayName
   * @param {*} item
   */
  addToArray(arrayName, item) {
    const currentArray = this.get(arrayName).slice();

    // no add needed if array already has item
    if (currentArray.includes(item)) {
      return;
    }

    currentArray.push(item);
    this.set({
      [arrayName]: currentArray,
    });
  }
  /**
   * PROPOSAL FUNCTION
   *
   * @param {String} arrayName
   * @param {*} item
   */
  removeFromArray(arrayName, item) {
    const currentArray = this.get(arrayName).slice();
    const newArray = currentArray.filter((existingItem) => (!Object.is(existingItem, item)));

    this.set({
      [arrayName]: newArray,
    });
  }
  /**
   * wrapper for watching for a change for a specific property
   * @link https://mobx.js.org/refguide/reaction.html
   *
   * @param {String} property - one of the observeable properties in the `appStore`
   * @param {Function} callback
   * @returns {Function} - returns the `disposer` which will remove the observer
   */
  onChange(property, callback) {
    return reaction(
      () => this.attributes[property],
      callback,
    );
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
    const stateObject = toJS(this.attributes);

    const keys = Object.keys(stateObject);
    keys.forEach((attributeName) => {
      const attributeValue = get(this.attributes, attributeName);

      // if value is a Model then use that Model's export
      if (attributeValue instanceof Model) {
        exportObject[attributeName] = attributeValue.export();
        return;
      }

      // check if we have an array of Models
      if (Array.isArray(attributeValue)) {
        // empty arrays don't matter
        if (attributeValue.length <= 0) {
          exportObject[attributeName] = attributeValue;
          return;
        }

        // export array of models using their own export()
        const isArrayOfModels = attributeValue[0] instanceof Model;
        if (isArrayOfModels) {
          exportObject[attributeName] = attributeValue.map((model) => (model.export()));
          return;
        }
      }

      // assign the value
      exportObject[attributeName] = attributeValue;
    });

    return exportObject;
  }
  /**
   * return a copy of this class
   * (this needs some R&D, what if we want to maintain references?)
   *
   * @returns {Object}
   */
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export default Model;
