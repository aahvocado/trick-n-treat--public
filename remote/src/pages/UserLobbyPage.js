import React, { PureComponent } from 'react';

import {BasicButtonComponent} from 'components/ButtonComponent';

import {SOCKET_EVENTS} from 'constants/socketEvents';

import * as connectionManager from 'managers/connectionManager';

/**
 *
 */
export class UserLobbyPage extends PureComponent {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnStartClick = this.handleOnStartClick.bind(this);
  }
  /** @override */
  render() {
    const {
      isConnected,
      lobbyNames,
      name,
    } = this.props;

    const hasOtherClients = lobbyNames.length > 0;

    return (
      <div className='bg-secondary pad-h-2 flex-grow flex-centered flex-col text-center'>
        <BasicButtonComponent
          className='mar-t-2 flex-col'
          disabled={!hasOtherClients && !isConnected}
          onClick={this.handleOnStartClick}
        >
          <span className='fsize-7'>Embark</span>
          <span className='fsize-4'>on your candy inquisition</span>
        </BasicButtonComponent>

        <h2 className='mar-t-2 pad-v-2 flex-none'>
          { isConnected ? 'Welcome to the Disciples of Trick and Treat!' : 'You do not have a connection to the cosmos...' }
        </h2>

        <div className='pad-v-2 fsize-4'>
          { lobbyNames.map((lobbyName, idx) => {
            return (
              <LobbyListRow
                key={`lobby-name-${lobbyName}-${idx}-key`}
                isLocalUser={lobbyName === name}
                isScreenClient={false}
                name={lobbyName}
              />
            )
          })}
        </div>
      </div>
    );
  }
  /**
   * clicked on Start the game
   */
  handleOnStartClick() {
    connectionManager.socket.emit(SOCKET_EVENTS.LOBBY.START);
  }
}
export default UserLobbyPage;
/**
 *
 */
class LobbyListRow extends PureComponent {
  /** @override */
  render() {
    const {
      isLocalUser,
      isScreenClient,
      name,
    } = this.props;

    return (
      <li className={`sibling-mar-t-1 ${isLocalUser ? 'f-bold' : ''} flex-row`}>
        <span className='mar-r-2'>{ isScreenClient ? '[S]' : '[R]' }</span>
        <span>{ name }</span>
      </li>
    );
  }
}
