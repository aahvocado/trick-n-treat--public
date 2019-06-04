import {
  isObservableArray,
} from 'mobx';

/**
 * helps determine how to import data into a Model
 *  Important that the `oldAttributes` are not converted/exported,
 *  as we'll have to find out if they were Models/ModelList
 *
 * @param {Object} oldAttributes
 * @param {Object} newAttributes
 * @returns {Object}
 */
export default function createImportingAttributes(oldAttributes, newAttributes) {
  // collect the other attributes to be set at once
  let setAttributes = {};

  // iterate through the attributes to see if we handle setting it differently
  const attributeKeys = Object.keys(newAttributes);
  attributeKeys.forEach((key) => {
    const oldValue = oldAttributes[key];
    const newValue = newAttributes[key];

    const resultValue = handleImportingValue(oldValue, newValue);
    setAttributes[key] = resultValue;
  })

  return setAttributes;
}
/**
 * determines how to import a Value given an oldValue
 *
 * @todo - figure out how to handle case of empty Array and importing a Array of Points
 *
 * @param {*} oldValue
 * @param {*} newValue
 * @returns {*}
 */
export function handleImportingValue(oldValue, newValue) {
  // do nothing if newValue is null or undefined
  if (newValue === null || newValue === undefined) {
    return newValue;
  }

  // most primitive types can be used as is
  const newValueType = typeof newValue;
  if (newValueType === 'boolean' || newValueType === 'number' || newValueType === 'string' || newValueType === 'undefined') {
    return newValue;
  }

  // no way to determine what to do if oldValue was null or undefined
  if (oldValue === null || oldValue === undefined) {
    return newValue;
  }

  // `import()` if oldValue is a Model or ModelList
  if (oldValue.isModel || oldValue.isModelList) {
    return oldValue.import(newValue);
  };

  // cases for Array
  const isArray = Array.isArray(newValue) || isObservableArray(newValue);
  if (isArray) {
    // do nothing, as empty arrays are straightforward
    if (newValue.length <= 0) {
      return newValue;
    }

    // recursively iterate through the newValue as Array
    //  use the first value of the oldValue as Array for comparison if available
    const wasArray = Array.isArray(oldValue) || isObservableArray(oldValue);
    const oldArrayValue = (wasArray && oldValue.length > 0) ? oldValue[0] : undefined;
    return newValue.map((itemValue) => {
      return handleImportingValue(oldArrayValue, itemValue);
    })
  }

  // case of oldValue being a Class of some sort
  // (currently likely to be a Point)
  if (oldValue.constructor !== undefined) {
    return handleImportingClass(oldValue, newValue);
  };
}
/**
 * @param {Object} oldValue
 * @param {Object} newValue
 * @returns {Object} - created class
 */
function handleImportingClass(oldValue, newValue) {
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
