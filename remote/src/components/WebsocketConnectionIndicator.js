import React, { PureComponent } from 'react';
import {observer} from "mobx-react";

import remoteAppState from 'data/remoteAppState';

import * as connectionManager from 'managers/connectionManager';

const INDICATOR_STYLES = {
  CONNECTED: {
    background: '#99f1b2',
  },
  DISCONNECTED: {
    background: '#d0355d',
  },
  LOADING: {
    background: '#d0ad4b',
  },
}

class WebsocketConnectionIndicator extends PureComponent {
  /** @override */
  constructor(props) {
    super(props);

    this.handleStatusOnClick = this.handleStatusOnClick.bind(this);
  }
  /** @override */
  render() {
    const { isConnected, isReconnecting } = this.props;

    const indicatorStatusStyles = isConnected ? INDICATOR_STYLES.CONNECTED : INDICATOR_STYLES.DISCONNECTED;
    const modifierStyles = isReconnecting ? INDICATOR_STYLES.LOADING : indicatorStatusStyles;

    return (
      <button
        className='pad-2 position-fixed mar-l-2 mar-t-2 borradius-3 bor-2-white cursor-pointer'
        style={modifierStyles}
        title='Click to reconnect to Websocket Server'
        onClick={this.handleStatusOnClick}
      >
      </button>
    );
  };
  /**
   * clicking on this button makes an attempt to reconnect
   */
  handleStatusOnClick() {
    const { isConnected, isReconnecting } = this.props;

    if (!isConnected && !isReconnecting) {
      connectionManager.reconnect();
    }
  }
}

export const ObservingWebsocketConnectionIndicator = observer(() => {
  const isConnected = remoteAppState.get('isConnected');
  const isReconnecting = remoteAppState.get('isReconnecting');

  return (
    <WebsocketConnectionIndicator
      isConnected={isConnected}
      isReconnecting={isReconnecting}
    />
  )
})

export default ObservingWebsocketConnectionIndicator;
