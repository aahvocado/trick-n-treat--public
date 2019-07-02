import * as connectionManager from 'managers/connectionManager';
import * as eventManager from 'managers/eventManager';
import * as threejsManager from 'managers/threejsManager';

// must be in order
connectionManager.connect();
eventManager.start();
threejsManager.initScreen();
