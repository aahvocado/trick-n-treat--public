import React, { Component, Fragment, PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faMobileAlt } from '@fortawesome/free-solid-svg-icons'

import ButtonComponent from 'common-components/ButtonComponent';

import {SOCKET_EVENTS} from 'constants.shared/socketEvents';

import remoteAppState from 'state/remoteAppState';

import * as connectionManager from 'managers/connectionManager';

/**
 *
 */
export default observer(
class UserLobbyPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnStartClick = this.handleOnStartClick.bind(this);
  }
  /** @override */
  render() {
    if (!remoteAppState.get('isInLobby')) {
      if (remoteAppState.get('isInGame')) {
        return <Redirect to='/game' />
      }
    }

    const isConnected = remoteAppState.get('isConnected');
    const isGameInProgress = remoteAppState.get('isGameInProgress');
    const lobbyData = remoteAppState.get('lobbyData');
    const name = remoteAppState.get('name');

    const inGameClients = lobbyData.filter((client) => (client.isInGame));
    const inLobbyClients = lobbyData.filter((client) => (client.isInLobby));

    return (
      <div className='bg-secondary pad-h-2 flex-auto flex-center flex-col text-center'>
        <ButtonComponent
          className='fsize-4 pad-2 f-bold mar-t-2 flex-col'
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
        </ButtonComponent>

        <h2 className='color-white mar-t-2 pad-v-2 flex-none'>
          { isConnected ? 'Welcome to the Disciples of Trick and Treat!' : 'You do not have a connection to the cosmos...' }
        </h2>

        <div className='flex-row'>
          <div className='flex-grow-only' style={{flex: '1 1 50%'}}>
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

          <div className='flex-grow-only' style={{flex: '1 1 50%'}}>
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
    if (remoteAppState.get('isGameInProgress')) {
      connectionManager.socket.emit(SOCKET_EVENTS.LOBBY.JOIN);
      return;
    };

    connectionManager.socket.emit(SOCKET_EVENTS.LOBBY.START);
  }
})
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
      <li className={`color-white sibling-mar-t-1 ${isLocalUser ? 'f-bold' : ''} flex-row-center`}>
        <FontAwesomeIcon className='mar-r-2' icon={clientType === 'SCREEN-CLIENT-TYPE' ? faDesktop : faMobileAlt} />
        <span>{ name }</span>
      </li>
    );
  }
}
