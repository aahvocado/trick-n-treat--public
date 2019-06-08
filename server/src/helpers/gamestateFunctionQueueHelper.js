import FunctionQueue from 'managers/FunctionQueue';

/**
 * create singleton of the FunctionQueue for the gameState
 *
 * @type {FunctionQueue}
 */
const gamestateFunctionQueue = new FunctionQueue();
// -- extended methods below - see FunctionQueue.js for details
/* eslint-disable */
/** @override */
export function addToFunctionQueue(baseFunction, name) {
  gamestateFunctionQueue.addToFunctionQueue(baseFunction, name);
}
/** @override */
export function insertIntoFunctionQueue(baseFunction, name, idx) {
  gamestateFunctionQueue.insertIntoFunctionQueue(baseFunction, name, idx);
}
/** @override */
export async function resolveFunctionQueue() {
  gamestateFunctionQueue.resolveFunctionQueue();
}
/** @override */
export function clearFunctionQueue() {
  gamestateFunctionQueue.clearFunctionQueue();
}
/** @override */
export function shouldResolveFunctionQueue() {
  return gamestateFunctionQueue.shouldResolveFunctionQueue();
}
/* eslint-enable */
