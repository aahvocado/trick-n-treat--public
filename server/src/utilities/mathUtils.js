/**
 * generates a random integer between two values, including those values
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
