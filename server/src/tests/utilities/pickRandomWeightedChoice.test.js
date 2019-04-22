import test from 'ava';

import pickRandomWeightedChoice from 'utilities/pickRandomWeightedChoice';

test('pickRandomWeightedChoice() - returns the choice that is not 0', (t) => {
  const choiceList = [
    {
      returns: 'A',
      weight: 0,
    }, {
      returns: 'B',
      weight: 100,
    },
  ];

  const choice = pickRandomWeightedChoice(choiceList);
  t.is(choice, 'B');
});
