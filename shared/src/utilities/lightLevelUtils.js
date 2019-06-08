
/**
 * @param {Number} distance
 * @param {Number} vision
 * @returns {LightLevel}
 */
export function calculateLightLevel(distance, vision) {
  // adjust to let distance have a bigger impact
  const visionStrength = vision * 1.15;
  const distanceStrength = distance * 1.5;

  // raw value
  const baseLevel = visionStrength - distanceStrength;

  // try to keep it between 0 to 10 and a whole number
  const finalLevel = Math.round(Math.max(Math.min(baseLevel, 10), 0));

  // done
  return finalLevel;
}
/**
 * @param {LightLevel} lightLevel
 * @returns {Boolean}
 */
export function isPartialLighting(lightLevel) {
  return lightLevel > 0 && lightLevel < 10;
}
/**
 * @param {LightLevel} lightLevelA
 * @param {LightLevel} lightLevelB
 * @returns {Boolean}
 */
export function isMoreLit(lightLevelA, lightLevelB) {
  return lightLevelA > lightLevelB;
}
/**
 * @param {LightLevel} lightLevelA
 * @param {LightLevel} lightLevelB
 * @returns {Boolean}
 */
export function isLessLit(lightLevelA, lightLevelB) {
  return lightLevelA < lightLevelB;
}
