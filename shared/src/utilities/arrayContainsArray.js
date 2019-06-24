/**
 * checks if each element in `subset` is in the `superset`
 * @link https://github.com/lodash/lodash/issues/1743#issuecomment-365016367
 *
 * @param {Array} superset
 * @param {Array} subset
 * @returns {Boolean}
 */
export default function arrayContainsArray(superset, subset) {
  if (0 === subset.length || superset.length < subset.length) {
    return false;
  }

  for (let i = 0; i < subset.length; i++) {
    if (superset.indexOf(subset[i]) === -1) return false;
  }

  return true;
}
