import uuid from 'uuid/v4';

import Model from 'models.shared/Model';

/**
 * ModelList is an Array of Models
 *  this is basically extending the Array prototype with some stuff
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

    /** @type {Array<Model>} */
    this.modelList = defaultList;
    /** @type {Array<Model>} */
    this.defaultList = defaultList.slice();
    /** @type {Model.Constructor} */
    this.ModelClass = ModelClass;

    // extend the Array prototype
    const modelList = this.modelList;
    modelList.isModelList = true;
    modelList.defaultList = this.defaultList;
    modelList.ModelClass = this.ModelClass;
    modelList.id = this.id;
    modelList.export = this.export.bind(this);
    modelList.import = this.import.bind(this);

    // return the extended Array we created
    return this.modelList;
  }
  /**
   * updates the ModelList by creating the original Model class
   *
   * @param {Array<Object>} newList
   */
  import(newList) {
    this.modelList = newList.map((data) => {
      const newModel = new this.ModelClass();
      return newModel.import(data);
    });
  }
  /**
   * @returns {Array<Object>}
   */
  export() {
    return this.modelList.map((model) => (model.export()));
  }
}
