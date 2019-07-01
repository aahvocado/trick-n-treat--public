import React, { Component, Fragment, PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faMobileAlt } from '@fortawesome/free-solid-svg-icons'

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

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
    // if user does not have a defined `clientType`, go back to HomePage
    if (remoteAppState.get('clientType') === CLIENT_TYPE.UNKNOWN) {
      return <Redirect to='/home' />
    }

    // for now, we are allowed to be in the Lobby as long as we are not in the Game
    if (!remoteAppState.get('isInLobby')) {
      if (remoteAppState.get('isInGame') && remoteAppState.get('clientType') === CLIENT_TYPE.REMOTE) {
        return <Redirect to='/game' />
      }

      if (remoteAppState.get('isInGame') && remoteAppState.get('clientType') === CLIENT_TYPE.SCREEN) {
        return <Redirect to='/screen' />
      }
    }

    const isConnected = remoteAppState.get('isConnected');
    const isGameInProgress = remoteAppState.get('isGameInProgress');
    const name = remoteAppState.get('name');
    const clientType = remoteAppState.get('clientType');

    const gameClients = remoteAppState.get('gameClients');
    const lobbyClients = remoteAppState.get('lobbyClients');

    return (
      <div className='bg-secondary pad-2 flex-auto flex-center flex-col talign-center'>
        <div className='color-white fsize-6 pad-v-2 adjacent-mar-t-2'>
          <FontAwesomeIcon className='adjacent-mar-t-2' icon={clientType === CLIENT_TYPE.SCREEN ? faDesktop : faMobileAlt} />

          <h2 className='color-white fsize-4 adjacent-mar-t-2 flex-none'>
            { isConnected ? 'Your friends and the candy in the neighborhood await you!' : 'You do not have a connection to the cosmos...' }
          </h2>
        </div>

        <ButtonComponent
          className='fsize-4 pad-2 f-bold adjacent-mar-t-2 flex-col'
          theme={BUTTON_THEME.ORANGE}
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
              <span className='fsize-4'>on a candy inquisition</span>
            </Fragment>
          }
        </ButtonComponent>

        <div className='flex-row adjacent-mar-t-2'>
          <div className='flex-grow-only' style={{flex: '1 1 50%'}}>
            <h3 className="color-fourth">In Lobby</h3>
            <ul className='pad-v-2 fsize-4'>
              { lobbyClients.map((clientData, idx) => {
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
            <h3 className="color-fourth">In Game</h3>
            <ul className='pad-v-2 fsize-4'>
              { gameClients.map((clientData, idx) => {
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
      connectionManager.socket.emit(SOCKET_EVENT.LOBBY.TO_SERVER.REJOIN);
      return;
    };

    connectionManager.socket.emit(SOCKET_EVENT.LOBBY.TO_SERVER.START);
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
      <li className={`color-white adjacent-mar-t-1 ${isLocalUser ? 'f-bold' : ''} flex-row-center`}>
        <FontAwesomeIcon className='mar-r-2' icon={clientType === CLIENT_TYPE.SCREEN ? faDesktop : faMobileAlt} />
        <span>{ name }</span>
      </li>
    );
  }
}
