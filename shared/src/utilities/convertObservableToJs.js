import {
  isObservableArray,
  toJS,
} from 'mobx';

/**
 * does a deep conversion of all given (Model) attributes to plain JS
 *
 * @param   {Observable} attributes
 * @returns {Object}
 */
export default function convertObservableToJs(attributes) {
  const exportObject = {};
  const stateObject = toJS(attributes);

  const keys = Object.keys(stateObject);
  keys.forEach((attributeName) => {
    const attributeValue = stateObject[attributeName];

    // no need to do anything more with null
    if (attributeValue === null || attributeValue === undefined) {
      exportObject[attributeName] = attributeValue;
      return;
    }

    // if value is a Model or ModelList then use the `export()` method
    if (attributeValue.isModel || attributeValue.isModelList) {
      exportObject[attributeName] = attributeValue.export();
      return;
    }

    // check if we have an array of Models
    if (Array.isArray(attributeValue) || isObservableArray(attributeValue)) {
      // empty arrays don't matter
      if (attributeValue.length <= 0) {
        exportObject[attributeName] = attributeValue;
        return;
      }

      // export each item in array
      exportObject[attributeName] = attributeValue.map((data) => {
        return toJS(data);
      });
      return;
    }

    // assign the value
    exportObject[attributeName] = attributeValue;
  });

  return exportObject;
}
