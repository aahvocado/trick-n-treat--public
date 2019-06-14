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
/**
 * gets a odd integer between the two number
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function getRandomOdd(min, max) {
  const randomInt = getRandomIntInclusive(min, max);

  // if it randomly picked a even number, return it subtracted
  if (randomInt % 2 === 0) {
    return randomInt - 1;
  }

  return randomInt;
}
