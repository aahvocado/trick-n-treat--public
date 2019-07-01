import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDesktop, faMobileAlt} from '@fortawesome/free-solid-svg-icons'

import ButtonComponent, {BUTTON_THEME} from 'common-components/ButtonComponent';

import {CLIENT_TYPE} from 'constants.shared/clientTypes';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import remoteAppState from 'state/remoteAppState';

/**
 *
 */
export default observer(
class HomePage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.onClickJoinAsRemote = this.onClickJoinAsRemote.bind(this);
    this.onClickJoinAsScreen = this.onClickJoinAsScreen.bind(this);
  }
  /** @override */
  render() {
    const isConnected = remoteAppState.get('isConnected');

    // if there already is a chosen `clientType`, we can go to the lobby
    if (isConnected && remoteAppState.get('clientType') !== CLIENT_TYPE.UNKNOWN) {
      return <Redirect to='/lobby' />
    }

    const name = remoteAppState.get('name');

    return (
      <div className='bg-secondary pad-2 flex-auto flex-center flex-col talign-center'>
        <h2 className='color-white adjacent-mar-t-2 pad-v-2 flex-none'>
          { isConnected ? `Welcome, ${name}, to the Candy Cosmos!` : 'You do not have a connection to the cosmos...' }
        </h2>

        <div
          className='flex-row-center adjacent-mar-t-2'
          style={{height: '300px'}}
        >
          <ButtonComponent
            className='fsize-6 pad-2 f-bold flex-col-center height-full adjacent-mar-l-2'
            style={{width: '150px'}}
            theme={BUTTON_THEME.ORANGE}
            disabled={!isConnected}
            onClick={this.onClickJoinAsRemote}
          >
            <span className='mar-b-3'>Join as a Joyful Treater</span>
            <FontAwesomeIcon icon={faMobileAlt} />
          </ButtonComponent>

          <ButtonComponent
            className='fsize-6 pad-2 f-bold flex-col-center height-full adjacent-mar-l-2'
            style={{width: '150px'}}
            theme={BUTTON_THEME.ORANGE}
            disabled={!isConnected}
            onClick={this.onClickJoinAsScreen}
          >
            <span className='mar-b-3'>Join as a Cosmic Watcher</span>
            <FontAwesomeIcon icon={faDesktop} />
          </ButtonComponent>
        </div>
      </div>
    );
  }
  /**
   * join as a Remote
   */
  onClickJoinAsRemote() {
    connectionManager.socket.emit(SOCKET_EVENT.LOBBY.TO_SERVER.JOIN, CLIENT_TYPE.REMOTE);
    remoteAppState.set({isLoading: true});
  }
  /**
   * join as a Screen
   */
  onClickJoinAsScreen() {
    connectionManager.socket.emit(SOCKET_EVENT.LOBBY.TO_SERVER.JOIN, CLIENT_TYPE.SCREEN);
    remoteAppState.set({isLoading: true});
  }
});
