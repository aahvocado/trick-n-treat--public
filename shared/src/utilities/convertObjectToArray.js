/**
 * @param {Object} object
 * @returns {Array}
 */
export default function convertObjectToArray(object) {
  let result = [];

  const keys = Object.keys(object);
  keys.forEach(key => {
    const value = object[key];

    // if the value here is another object, recursively conver that as well
    if (typeof value === 'object') {
      result = result.concat(convertObjectToArray(value));
    } else {
      result.push(value);
    }
  });

  return result;
};
