/**
 * picks a choice out of a list by adding up all the odds and picking one of them
 *
 * @typedef {Object} Choice
 * @property {Number} Choice.returns - what it will return this choice was chosen
 * @property {Number} Choice.weight - weight of this choice
 *
 * @example
  const choiceList = [
    {
      returns: 'A',
      weight: 1,
    },
    {
      returns: 'B',
      weight: 1,
    }
  ];

  const choice = pickRandomWeightedChoice(choiceList);
  console.log(choice) // 'A' (or 'B')
 *
 * @param {Array<Choice>} choiceList
 * @returns {Choice.returns}
 */
export default function pickRandomWeightedChoice(choiceList) {
  // sum up the chances
  const totalChance = choiceList.reduce((accumulator, choice) => {
    // range of values that could indicate this was picked
    if (choice.weight > 0) {
      choice.range = [accumulator, accumulator + choice.weight];

    // if weight is zero, don't create a range
    } else {
      choice.range = [-1, -1];
    }

    return accumulator + choice.weight;
  }, 0);

  // randomly pick a value between 0 and totalChance
  const roll = Math.random() * totalChance;

  // find the choice that has the roll in between the range values
  const chosenChoice = choiceList.find((choice) => {
    return roll >= choice.range[0] && roll < choice.range[1];
  });

  // gives you the data of the choice
  return chosenChoice.returns;
}
