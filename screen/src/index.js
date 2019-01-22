import * as connectionManager from 'managers/connectionManager';
import * as eventManager from 'managers/eventManager';

import app from './app.js';

connectionManager.connect();
eventManager.start();
