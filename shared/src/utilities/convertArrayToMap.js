/**
 * @param {Array} array
 * @returns {Object}
 */
export default function convertArrayToMap(array) {
  const mapping = {};

  array.forEach((item) => {
    const {id} = item;
    if (mapping[id] !== undefined) {
      console.error(`Duplicate item with ${id} found while mapping!`);
      return;
    }

    mapping[id] = item;
  });

  return mapping;
};
