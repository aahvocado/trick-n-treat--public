import React, { PureComponent } from 'react';

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

export class WebsocketConnectionIndicator extends PureComponent {
  /** @default */
  constructor(props) {
    super(props);

    this.handleStatusOnClick = this.handleStatusOnClick.bind(this);

    this.state = {
      isConnected: false,
      isReconnecting: false,
    }
  }
  /** @default */
  componentDidMount() {
    const socket = connectionManager.socket;

    socket.on('connect', () => {
      this.setState({isConnected: true, isReconnecting: false});
    });

    socket.on('disconnect', () => {
      this.setState({isConnected: false, isReconnecting: false});
    });

    socket.on('reconnect_failed', () => {
      this.setState({isConnected: false, isReconnecting: false});
    });
  }
  /** @default */
  render() {
    const { isConnected, isReconnecting } = this.state;

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
    const { isConnected, isReconnecting } = this.state;

    if (!isConnected && !isReconnecting) {
      connectionManager.reconnect();
      this.setState({ isReconnecting: true });
    }
  }
}

export default WebsocketConnectionIndicator;
