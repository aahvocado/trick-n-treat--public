import test from 'ava';
import * as mathUtils from 'utilities/mathUtils';

/**
 * feels silly to unit test randomness
 */

test('getRandomIntInclusive() - returns a number between the two given ranges', (t) => {
  const lowerRange = 1;
  const upperRange = 3;
  const randomInt = mathUtils.getRandomIntInclusive(lowerRange, upperRange);
  const isWithinRange = randomInt >= lowerRange && randomInt <= upperRange;
  t.true(isWithinRange)
})

test('getRandomWeightedChoice() - returns the choice that is not 0', (t) => {
  const choiceList = [
    {
      arbitraryLabel: 'A',
      weight: 0,
    }, {
      arbitraryLabel: 'B',
      weight: 100,
    }
  ];

  const choice = mathUtils.getRandomWeightedChoice(choiceList);
  t.is(choice.arbitraryLabel, 'B');
})
