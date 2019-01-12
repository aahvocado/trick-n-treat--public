import React, { PureComponent } from 'react';

import * as connectionManager from 'managers/connectionManager';

const INDICATOR_STYLES = {
  CONNECTED: {
    background: '#99f1b2',
  },
  DISCONNECTED: {
    background: '#d0355d',
  }
}

export class WebsocketConnectionIndicator extends PureComponent {
  /** @default */
  constructor(props) {
    super(props);

    this.handleStatusOnClick = this.handleStatusOnClick.bind(this);

    this.state = {
      isConnected: false,
    }
  }
  /** @default */
  componentDidMount() {
    const socket = connectionManager.socket;

    socket.on('connect', () => {
      this.setState({isConnected: true});
    });

    socket.on('disconnect', () => {
      this.setState({isConnected: false});
    });
  }
  /** @default */
  render() {
    const { isConnected } = this.state;

    const modifierStyles = isConnected ? INDICATOR_STYLES.CONNECTED : INDICATOR_STYLES.DISCONNECTED;

    return (
      <button
        className='pad-2 position-fixed mar-l-1 mar-t-1 borradius-3 bor-2-white'
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
    const { isConnected } = this.state;

    if (!isConnected) {
      connectionManager.reconnect();
    }
  }
}
