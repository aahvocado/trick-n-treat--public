import logger from 'utilities/logger.game'; // I want this utility but if I wasn't then this could be shared

/**
 * number of QueuedFunctions ever created
 * @type {Number}
 */
let actionCount = 0;
/**
 * ms to wait between each resolving Queue
 * @type {Number}
 */
const timeBetweenActions = 50;
/**
 * creates an asynchronous Function for the FunctionQueue using given function
 *  the function this returns is not async,
 *  but when called it will execute an async function
 *
 * @param {Function} baseFunction
 * @param {String} [name]
 * @returns {QueuedFunction}
 */
export function createQueuedFunction(baseFunction, name) {
  if (typeof baseFunction !== 'function') {
    logger.error('createQueuedFunction() was not given a function');
    return;
  }

  // keep track of how many were created
  actionCount += 1;

  // use given parameter's name first, then use what's available, then create a name otherwise
  //  then always append the `actionCount` to the end
  const newFunctionName = `${name || baseFunction.name || baseFunction.displayName || 'unknownFunction'}#${actionCount}`;

  // create the function object
  const queuedFunction = () => {
    return new Promise((resolve) => {
      logger.verbose(`. [[resolving "${newFunctionName}"]]`);

      // actually call the function here
      baseFunction();

      // pause between actions
      setTimeout(resolve, timeBetweenActions);
    });
  };

  // assign the name
  queuedFunction.displayName = newFunctionName;

  // done
  return queuedFunction;
}
/**
 * this class creates a Manager for resolving a series of Functions
 *  hopefully this makes it so the ordering of events are maintained
 *
 *  @typedef {Function} QueuedFunction
 */
export default class FunctionQueue {
  /** @override */
  constructor() {
    /**
     * this is the queue singleton
     *
     * @type {Array<QueuedFunction>}
     */
    this.functionQueue = [];
    /**
     * the current function being resolved
     *
     * @type {QueuedFunction | null}
     */
    this.currentFunction = null;
  }
  /**
   * add action to the end of queue
   *
   * @param {Function} baseFunction
   * @param {String} [name]
   */
  addToFunctionQueue(baseFunction, name) {
    const actionFunction = createQueuedFunction(baseFunction, name);

    // add to queue
    this.functionQueue.push(actionFunction);

    // check if should start resolving
    if (this.shouldResolveFunctionQueue()) {
      logger.new('[[starting FunctionQueue resolution]]');
      this.resolveFunctionQueue();
    }
  }

  /**
   * insert an Action into the front of the Queue
   *
   * @param {Function} baseFunction
   * @param {String} [name]
   * @param {Number} [idx]
   */
  insertIntoFunctionQueue(baseFunction, name, idx = 0) {
    const actionFunction = createQueuedFunction(baseFunction, name);

    // splice `actionFunction` into given idx in the queue
    this.functionQueue.splice(idx, 0, actionFunction);

    // check if we can start resolving
    if (this.shouldResolveFunctionQueue()) {
      logger.new('[[starting FunctionQueue resolution]]');
      this.resolveFunctionQueue();
    }
  }
  /**
   * go through the `functionQueue` and resolve each `QueuedFunction`
   */
  async resolveFunctionQueue() {
    const activeFunction = this.functionQueue.shift();

    // track the active function
    this.currentFunction = activeFunction;

    await activeFunction();

    // resolve the next action, since previous actions may have added more
    if (this.functionQueue.length > 0) {
      this.resolveFunctionQueue();
      return;
    }

    // completely resolved, so clear the currentFunction
    this.currentFunction = null;
    logger.old('[[finished resolving FunctionQueue]]');
  }
  /**
   * immediately clear everything from the `functionQueue`
   */
  clearFunctionQueue() {
    if (this.functionQueue.length <= 0) {
      return;
    }

    // set to empty array
    logger.old(`[[clearing FunctionQueue of "${this.functionQueue.length}" functions]]`);
    this.functionQueue = [];
  }
  /**
   * determines if we can start the resolution of the `functionQueue`
   *
   * @returns {Boolean}
   */
  shouldResolveFunctionQueue() {
    // can not start if queue is empty
    if (this.functionQueue.length <= 0) {
      return false;
    }

    // can not start resolution if there already is an `activeFunction`
    if (this.currentFunction !== null) {
      return false;
    }

    // go for it
    return true;
  }
}
