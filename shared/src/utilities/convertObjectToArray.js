/**
 * @param {Object} object
 * @param {Object} [options]
 * @property {Object} options.flatten = true
 * @returns {Array}
 */
export default function convertObjectToArray(object, options = {}) {
  const {
    flatten = true,
  } = options;

  // this will be returned
  let result = [];

  const keys = Object.keys(object);
  keys.forEach(key => {
    const value = object[key];

    // if the value here is another object, recursively convert that as well
    if (flatten && typeof value === 'object') {
      const flattenedObject = convertObjectToArray(value);
      result = result.concat(flattenedObject);
      return;
    }

    // add the value to the array
    result.push(value);
  });

  return result;
};
