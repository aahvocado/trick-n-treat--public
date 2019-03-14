import React from 'react';
import ReactDOM from 'react-dom';

import * as remoteAppState from 'data/remoteAppState';

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
console.log(`Hello, I am "${remoteAppState.appStore.name}"!`)

// render after everything
ReactDOM.render(<App />, document.getElementById('root'));
