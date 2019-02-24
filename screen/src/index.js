import * as connectionManager from 'managers/connectionManager';
import * as eventManager from 'managers/eventManager';

connectionManager.connect();
eventManager.start();
