import uuid from 'uuid/v4';
import {
  observable,
  reaction,
  set,
  toJS,
} from 'mobx';

import Model from 'models.shared/Model';

/**
 * ModelList is an Array of Models
 *
 * NOTE: This is really bad design but I need to be able to distinguish
 *  between an array and an array of models.
 *  This may need to be changed.
 *
 * @typedef {Object} ModelList
 */
export default class ModelList {
  /**
   * @default
   * @param {Array} [defaultList]
   * @param {Model.Constructor} [ModelClass]
   */
  constructor(defaultList = [], ModelClass = Model) {
    /** @type {String} */
    this.id = uuid();
    /** @type {Boolean} */
    this.isModelList = true;

    /** @type {Model.Constructor} */
    this.ModelClass = ModelClass;
    /** @type {Array<Model>} */
    this.defaultList = defaultList.slice();

    /** @type {Array<Model>} */
    this.modelList = observable(this.defaultList);
  }
  /**
   * wrapper for watching for a change for a specific property
   * @see https://mobx.js.org/refguide/array.html
   *
   * @param {Function} callback
   * @returns {Function} - returns the `disposer` which will remove the observer
   */
  onChange(callback) {
    return reaction(
      () => toJS(this.modelList),
      callback,
    );
  }
  /**
   * EXPERIMENTAL
   * will remove all Models in the list that do not pass the callback
   *
   * @param {Function} callback
   */
  remove(callback) {
    const currentList = this.modelList.slice();
    const resultList = currentList.filter((...args) => (!callback(...args)));
    set(this.modelList, resultList);
  }
  /**
   * updates the ModelList by creating the original Model class
   *
   * @param {Array<Object>} newList
   * @returns {ModelList}
   */
  import(newList) {
    this.modelList = newList.map((data) => {
      const newModel = new this.ModelClass();
      newModel.import(data);
      return newModel;
    });

    return this;
  }
  /**
   * @returns {Array<Object>}
   */
  export() {
    return this.modelList.map((model) => {
      return model.export();
    });
  }
  /* eslint-disable */
  // -- Array methods
  from(...args) {
    return this.modelList.from(...args);
  }
  isArray(...args) {
    console.warn('This is a ModelList but returning "true" for now.');
    return this.modelList.isArray(...args);
  }
  of(...args) {
    return this.modelList.of(...args);
  }
  concat(...args) {
    return this.modelList.concat(...args);
  }
  copyWithin(...args) {
    return this.modelList.copyWithin(...args);
  }
  entries(...args) {
    return this.modelList.entries(...args);
  }
  every(...args) {
    return this.modelList.every(...args);
  }
  fill(...args) {
    return this.modelList.fill(...args);
  }
  filter(...args) {
    return this.modelList.filter(...args);
  }
  findIndex(...args) {
    return this.modelList.findIndex(...args);
  }
  flat(...args) {
    return this.modelList.flat(...args);
  }
  flatMap(...args) {
    return this.modelList.flatMap(...args);
  }
  forEach(...args) {
    return this.modelList.forEach(...args);
  }
  includes(...args) {
    return this.modelList.includes(...args);
  }
  indexOf(...args) {
    return this.modelList.indexOf(...args);
  }
  join(...args) {
    return this.modelList.join(...args);
  }
  keys(...args) {
    return this.modelList.keys(...args);
  }
  lastIndexOf(...args) {
    return this.modelList.lastIndexOf(...args);
  }
  map(...args) {
    return this.modelList.map(...args);
  }
  pop(...args) {
    return this.modelList.pop(...args);
  }
  push(...args) {
    return this.modelList.push(...args);
  }
  reduce(...args) {
    return this.modelList.reduce(...args);
  }
  reduceRight(...args) {
    return this.modelList.reduceRight(...args);
  }
  reverse(...args) {
    return this.modelList.reverse(...args);
  }
  shift(...args) {
    return this.modelList.shift(...args);
  }
  slice(...args) {
    return this.modelList.slice(...args);
  }
  some(...args) {
    return this.modelList.some(...args);
  }
  sort(...args) {
    return this.modelList.sort(...args);
  }
  splice(...args) {
    return this.modelList.splice(...args);
  }
  toLocaleString(...args) {
    return this.modelList.toLocaleString(...args);
  }
  toSource(...args) {
    return this.modelList.toSource(...args);
  }
  toString(...args) {
    return this.modelList.toString(...args);
  }
  unshift(...args) {
    return this.modelList.unshift(...args);
  }
  values(...args) {
    return this.modelList.values(...args);
  }
  // -- Array properties
  get caller() {
    return this.modelList.caller;
  }
  get displayName() {
    return this.modelList.displayName;
  }
  get length() {
    return this.modelList.length;
  }
  /* eslint-enable */
}
