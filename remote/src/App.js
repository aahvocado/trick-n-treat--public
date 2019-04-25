import React, { Component } from 'react';
import {observer} from 'mobx-react';

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';

import remoteAppState from 'data/remoteAppState';

import * as remoteAppStateHelper from 'helpers/remoteAppStateHelper';

import DebugMenu from 'components/DebugMenu';
import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import EditorPage from 'pages/EditorPage';
import UserGamePage from 'pages/UserGamePage';
import UserLobbyPage from 'pages/UserLobbyPage';

/**
 *
 */
export default observer(
  class App extends Component {
    render() {
      const isInTileEditorMode = remoteAppState.get('isTileEditorMode');

      return (
        <div className='bg-primary'>
          <WebsocketConnectionIndicator />

          {/* Dev Tools - side menu */}
          <DebugMenu
            active={remoteAppState.get('isDebugMenuActive')}
            onClickClose={() => { remoteAppState.set({isDebugMenuActive: false}); }}
            onClickOverlay={() => { remoteAppState.set({isDebugMenuActive: false}); }}
          />

          {/* Page */}
          <div className='flex-centered flex-col color-white'>
            <h1 className='flex-none fsize-8 olor-white mar-v-2 f-bold width-full text-center'>Trick & Treat</h1>

            { remoteAppState.get('isTileEditorMode') &&
              <EditorPage />
            }

            { !isInTileEditorMode && remoteAppState.get('isInGame') &&
              <UserGamePage
                {...remoteAppState.export()}
                canUseActions={remoteAppStateHelper.canUseActions()}
                useFullyVisibleMap={remoteAppState.get('useFullyVisibleMap')}
                useZoomedOutMap={remoteAppState.get('useZoomedOutMap')}
              />
            }

            { !isInTileEditorMode && remoteAppState.get('isInLobby') &&
              <UserLobbyPage
                {...remoteAppState.export()}
              />
            }
          </div>

          {/* "Footer" - needs to be refactored to not be so hacky eventually */}
          <div
            className='position-fixed pad-1 mar-1 flex-row aitems-center'
            style={{bottom: 0, right: 0}}
          >
            <div className='sibling-mar-l-2 color-gray'>{remoteAppState.get('name')}</div>

            {/* Debug Menu */}
            { remoteAppState.get('isDevMode') &&
              <ClassicButtonComponent
                className='pad-2 sibling-mar-l-2'
                onClick={() => { remoteAppState.set({isDebugMenuActive: true}); }}
              >
                <LetterIconComponent className='mar-r-1' children='`' /> Debugger
              </ClassicButtonComponent>
            }
          </div>
        </div>
      );
    }
  }
)
