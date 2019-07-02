/**
 * generates a random integer between two values, including those values
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * gets a even integer between the two numbers
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}z
 */
export function getRandomEven(min, max) {
  const randomInt = getRandomInt(min, max);

  // if it randomly picked a odd number, return it subtracted
  if (randomInt % 2 === 1) {
    return randomInt - 1;
  }

  return randomInt;
}
/**
 * gets a odd integer between the two numbers
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function getRandomOdd(min, max) {
  const randomInt = getRandomInt(min, max);

  // if it randomly picked a even number, return it subtracted
  if (randomInt % 2 === 0) {
    return randomInt - 1;
  }

  return randomInt;
}
/**
 * @param {Number} num
 * @returns {Number}
 */
export function makeEven(num) {
  if (num % 2 === 1) {
    num += 1;
  }

  return num;
}
/**
 * @param {Number} num
 * @returns {Number}
 */
export function makeOdd(num) {
  if (num % 2 === 0) {
    num += 1;
  }

  return num;
}
