import {
  get,
  observable,
  reaction,
  set,
  toJS,

  isObservableArray,
} from 'mobx';
import uuid from 'uuid/v4';

import convertObservableToJs from 'utilities.shared/convertObservableToJs';

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
    this.modelId = uuid();

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
   * EXPERIMENTAL - this might be unnecessary and mess things up more than it helps
   *
   * @param {String} arrayName
   * @param {*} item
   */
  addToArray(arrayName, item) {
    const currentArray = this.get(arrayName).slice();
    currentArray.push(item);
    this.set({
      [arrayName]: currentArray,
    });
  }
  /**
   * EXPERIMENTAL - this might be unnecessary and mess things up more than it helps
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
    // @see https://mobx.js.org/refguide/array.html
    if (isObservableArray(this.attributes[property])) {
      return reaction(
        () => toJS(this.attributes[property]),
        callback,
      );
    };

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
    return convertObservableToJs(this.attributes);
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
