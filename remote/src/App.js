import React, { Component } from 'react';
import {observer} from 'mobx-react';

import remoteAppState from 'data/remoteAppState';

import * as remoteAppStateHelper from 'helpers/remoteAppStateHelper';

import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import DebugPage from 'pages/DebugPage';
import UserGamePage from 'pages/UserGamePage';
import UserLobbyPage from 'pages/UserLobbyPage';

/**
 *
 */
export default observer(
  class App extends Component {
    render() {

      if (remoteAppState.get('isDebugMode')) {
        return <DebugPage />
      }

      return (
        <div className='bg-primary'>
          <WebsocketConnectionIndicator />

          <div className='position-fixed pad-2' style={{color: '#b5b5b5', bottom: 0, left: 0}}>{remoteAppState.get('name')}</div>

          <div className='flex-centered flex-col color-white'>
            <h1 className='flex-none fsize-8 olor-white mar-v-2 f-bold width-full text-center'>Trick & Treat</h1>

            { remoteAppState.get('isInGame') &&
              <UserGamePage
                {...remoteAppState.export()}
                canUseActions={remoteAppStateHelper.canUseActions()}
              />
            }

            { remoteAppState.get('isInLobby') &&
              <UserLobbyPage
                {...remoteAppState.export()}
              />
            }

          </div>
        </div>
      );
    }
  }
)
