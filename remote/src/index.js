import React from 'react';
import ReactDOM from 'react-dom';

import keycodes from 'constants.shared/keycodes';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

// services
import * as serviceWorker from './serviceWorker';
import * as connectionManager from 'managers/connectionManager';

// css
import 'react-notifications/lib/notifications.css';
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
window.addEventListener('keydown', (evt) => {
  // don't use the hotkeys if trying to type
  if (evt.srcElement.type === 'text' || evt.srcElement.type === 'textarea' || evt.srcElement.type === 'number') {
    return;
  }

  // only devs get super cool hotkeys
  if (!remoteAppState.get('isDevMode')) {
    return;
  }

  // backquote
  if (evt.keyCode === keycodes.backquote) {
    remoteAppState.set({isDebugMenuActive: !remoteAppState.get('isDebugMenuActive')});
  }
  // r
  if (evt.keyCode === keycodes.r) {
    connectionManager.reconnect();
  }

  // following codes only work if debug menu is open
  if (!remoteAppState.get('isDebugMenuActive')) {
    // return;
  }
  // t
  if (evt.keyCode === keycodes.t) {
    // remoteAppState.set({isEditorMode: !remoteAppState.get('isEditorMode')});
  }
  // z
  if (evt.keyCode === keycodes.z) {
    remoteGameState.set({useZoomedOutMap: !remoteGameState.get('useZoomedOutMap')});
  }
  // v
  if (evt.keyCode === keycodes.v) {
    remoteGameState.set({useFullyVisibleMap: !remoteGameState.get('useFullyVisibleMap')});
  }
});
