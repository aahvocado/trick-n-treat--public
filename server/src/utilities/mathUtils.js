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
 * picks a choice out of a list by adding up all the odds and picking one of them
 *
 * @typedef {Object} Choice
 * @property {Number} Choice.weight - weight of this choice
 *
 * @param {Array<Choice>} choiceList
 * @returns {Choice}
 */
export function getRandomWeightedChoice(choiceList) {
  // sum up the chances
  const totalChance = choiceList.reduce((accumulator, choice) => {
    // range of values that could indicate this was picked
    choice.range = [accumulator, accumulator + choice.weight];
    return accumulator + choice.weight;
  }, 0);

  // randomly pick a value between 0 and totalChance
  const roll = Math.random() * totalChance;

  // find the choice that has the roll in between the range values
  return choiceList.find((choice) => {
    return roll >= choice.range[0] && roll < choice.range[1];
  });
}
