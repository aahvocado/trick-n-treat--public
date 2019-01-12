import React from 'react';
import ReactDOM from 'react-dom';

// services
import * as serviceWorker from './serviceWorker';
import * as connectionManager from 'managers/connectionManager';

// css
import './styles/css-reset.css';
import './compiled/app.css';

// pages
import App from './App';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

// connect to websocket
connectionManager.connect();

// render after everything
ReactDOM.render(<App />, document.getElementById('root'));
