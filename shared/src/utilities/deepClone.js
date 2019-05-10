/**
 * lazily does a deep copy of an object
 *
 * @param {Object} obj
 * @returns {Object}
 */
export default function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
