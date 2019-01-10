/**
 * generates a random integer
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * creates a random tile type
 *
 * @returns {Number}
 */
function generateTile() {
  return getRandomIntInclusive(0, 3);
}
/**
 * creates a 2D array representing a room
 *
 * @typedef {Model} CharacterModel
 */
export function generateRoom() {
  let map = [];
  const height = 10;
  const width = 10;

  for (var x = 0; x < width; x++) {
    map.push([]);
    for (var y = 0; y < height; y++) {
      map[x][y] = generateTile();
    }
  }

  return map;
}
