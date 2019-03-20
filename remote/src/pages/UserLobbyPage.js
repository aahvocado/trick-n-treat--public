import React, { Fragment, PureComponent } from 'react';

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
      isGameInProgress,
      lobbyData,
      name,
    } = this.props;

    const inGameClients = lobbyData.filter((client) => (client.isInGame));
    const inLobbyClients = lobbyData.filter((client) => (client.isInLobby));

    return (
      <div className='bg-secondary pad-h-2 flex-grow flex-centered flex-col text-center'>
        <BasicButtonComponent
          className='mar-t-2 flex-col'
          disabled={!isConnected}
          onClick={this.handleOnStartClick}
        >
          { isGameInProgress &&
            <Fragment>
              <span className='fsize-7'>Join</span>
              <span className='fsize-4'>the candy inquisition</span>
            </Fragment>
          }

          { !isGameInProgress &&
            <Fragment>
              <span className='fsize-7'>Embark</span>
              <span className='fsize-4'>on your candy inquisition</span>
            </Fragment>
          }
        </BasicButtonComponent>

        <h2 className='mar-t-2 pad-v-2 flex-none'>
          { isConnected ? 'Welcome to the Disciples of Trick and Treat!' : 'You do not have a connection to the cosmos...' }
        </h2>

        <div className='flex-row'>
          <div className='flex-grow-1' style={{flex: '1 1 50%'}}>
            <h3 className="color-fourth">Candy Planning</h3>
            <ul className='pad-v-2 fsize-4'>
              { inLobbyClients.map((clientData, idx) => {
                return (
                  <LobbyListRow
                    key={`lobby-name-${clientData}-${idx}-key`}
                    isLocalUser={clientData.name === name}
                    clientType={clientData.clientType}
                    name={clientData.name}
                  />
                )
              })}
            </ul>
          </div>

          <div className='flex-grow-1' style={{flex: '1 1 50%'}}>
            <h3 className="color-fourth">Trick and Treating</h3>
            <ul className='pad-v-2 fsize-4'>
              { inGameClients.map((clientData, idx) => {
                return (
                  <LobbyListRow
                    key={`lobby-name-${clientData}-${idx}-key`}
                    isLocalUser={clientData.name === name}
                    clientType={clientData.clientType}
                    name={clientData.name}
                  />
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  /**
   * clicked on Start the game
   */
  handleOnStartClick() {
    const {
      isGameInProgress,
    } = this.props;

    if (isGameInProgress) {
      connectionManager.socket.emit(SOCKET_EVENTS.LOBBY.JOIN);
      return;
    };

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
      clientType,
      name,
    } = this.props;

    return (
      <li className={`sibling-mar-t-1 ${isLocalUser ? 'f-bold' : ''} flex-row-center`}>
        <span className='mar-r-2'>{ clientType === 'SCREEN-CLIENT-TYPE' ? '[S]' : '[R]' }</span>
        <span>{ name }</span>
      </li>
    );
  }
}
