var path = require('path');

/**
 * webpack's compiled folder
 */
module.exports.BUILD_PATH = path.resolve(__dirname, 'build');
/**
 * location of the screen
 */
module.exports.SCREEN_PATH = path.resolve(__dirname, 'screen');
/**
 * location of the remote
 */
module.exports.REMOTE_PATH = path.resolve(__dirname, 'remote');
/**
 * location of the server
 */
module.exports.SERVER_PATH = path.resolve(__dirname, 'server');
/**
 * location of the shared scripts folder
 */
module.exports.SHARED_PATH = path.resolve(__dirname, 'shared');
