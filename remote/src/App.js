import React, { Component } from 'react';
import {observer} from 'mobx-react';

import remoteAppState from 'data/remoteAppState';

import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import UserGamePage from 'pages/UserGamePage';
import UserLobbyPage from 'pages/UserLobbyPage';

/**
 *
 */
export default observer(
  class App extends Component {
    render() {
      return (
        <div className='bg-primary'>
          <WebsocketConnectionIndicator />

          <div className='position-fixed color-white pad-2' style={{right: 0}}>{remoteAppState.get('name')}</div>

          <div className='flex-centered flex-col color-white'>
            <h1 className='flex-none fsize-8 olor-white mar-v-2 f-bold width-full text-center'>Trick & Treat</h1>

            { remoteAppState.get('isInGame') &&
              <UserGamePage
                {...remoteAppState.export()}
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
