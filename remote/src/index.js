import React from 'react';
import ReactDOM from 'react-dom';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

// services
import * as serviceWorker from './serviceWorker';
import * as connectionManager from 'managers/connectionManager';

// css
import './styles/css-reset.css';
import './build/app.css';

// pages
import App from './App';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

// connect to websocket
const socket = connectionManager.connect();

// after connecting, add some events to our state
remoteAppState.attachSocketListeners(socket);
remoteGameState.attachSocketListeners(socket);

// render after everything
ReactDOM.render(<App />, document.getElementById('root'));

/**
 * @todo - move this to a better place
 */
window.addEventListener('keydown', (e) => {
  // only devs get super cool hotkeys
  if (!remoteAppState.get('isDevMode')) {
    e.preventDefault();
    return;
  }

  // backquote
  if (e.keyCode === 192) {
    remoteAppState.set({isDebugMenuActive: !remoteAppState.get('isDebugMenuActive')});
  }
  // r
  if (e.keyCode === 82) {
    connectionManager.reconnect();
  }

  // following codes only work if debug menu is open
  if (!remoteAppState.get('isDebugMenuActive')) {
    return;
  }
  // t
  if (e.keyCode === 84) {
    // remoteAppState.set({isEditorMode: !remoteAppState.get('isEditorMode')});
  }
  // z
  if (e.keyCode === 90) {
    remoteGameState.set({useZoomedOutMap: !remoteGameState.get('useZoomedOutMap')});
  }
  // v
  if (e.keyCode === 86) {
    remoteGameState.set({useFullyVisibleMap: !remoteGameState.get('useFullyVisibleMap')});
  }
});
