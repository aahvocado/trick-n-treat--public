import {
  isObservableArray,
} from 'mobx';

/**
 * helps determine how to import data into a Model
 *
 * @param {Model} model
 * @param {Object} newAttributes
 */
export default function importModelAttributes(model, newAttributes) {
  // collect the other attributes to be set at once
  let setAttributes = {};

  // iterate through the attributes to see if we handle setting it differently
  const attributeKeys = Object.keys(newAttributes);
  attributeKeys.forEach((key) => {
    const newValue = newAttributes[key];
    const oldValue = model.export()[key];

    // don't do anything with these basic types
    const newValueType = typeof newValue;
    if (newValueType === 'undefined' || newValueType === 'boolean' || newValueType === 'number' || newValueType === 'string') {
      setAttributes[key] = newValue;
      return;
    }

    // use `import()` to override the old attribute if it was a Model or ModelList
    if (oldValue.isModel || oldValue.isModelList) {
      oldValue.import(newValue);
      return;
    };

    // check if we have an array
    if (Array.isArray(oldValue) || isObservableArray(oldValue)) {
      // empty arrays don't matter
      if (newValue.length <= 0) {
        setAttributes[key] = newValue;
        return;
      }

      // can not determine what the value previously was
      if (oldValue.length <= 0) {
        setAttributes[key] = newValue;
        return;
      }

      // handle importing each item in array
      const firstOldItem = oldValue[0];
      if (firstOldItem.constructor !== undefined) {
        setAttributes[key] = newValue.map((arrayValue) => (handleImportClass(firstOldItem, arrayValue)));
        return;
      }
    }

    // case of oldValue being a Class
    if (oldValue.constructor !== undefined) {
      setAttributes[key] = handleImportClass(oldValue, newValue);
      return;
    };

    // generic attribute
    setAttributes[key] = newValue;
  })

  // set the generic attributes
  model.set(setAttributes);
}
/**
 * @param {Object} oldValue
 * @param {Object} newValue
 * @returns {Object} - created class
 */
function handleImportClass(oldValue, newValue) {
  // find the prototype of the original value
  const Prototype = Object.getPrototypeOf(oldValue);

  // unique case specifically for Point
  if (newValue.x !== undefined && newValue.y !== undefined) {
    const newpoint = Object.create(Prototype);
    newpoint.set(newValue.x, newValue.y);
    return newpoint;
  }

  // create the Object with new Properties most of the time
  return Object.create(Prototype, [newValue]);
}
