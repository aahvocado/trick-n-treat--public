import React, { Component } from 'react';
import {
  BrowserRouter,
  Route,
  withRouter,
} from 'react-router-dom';
import { observer } from 'mobx-react';

import ButtonComponent from 'common-components/ButtonComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';

import remoteAppState from 'state/remoteAppState';
// import remoteGameState from 'state/remoteGameState';

import DebugMenu from 'components/DebugMenu';
import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import EncounterEditorPage from 'pages/EncounterEditorPage';
import ItemEditorPage from 'pages/ItemEditorPage';
import TileEditorPage from 'pages/TileEditorPage';
import UserGamePage from 'pages/UserGamePage';
import UserLobbyPage from 'pages/UserLobbyPage';

/**
 *
 */
export default observer(
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className='bg-primary'>
          {/* connection status */}
          <WebsocketConnectionIndicator />

          {/* Dev Tools - side menu */}
          <DebugMenu
            active={remoteAppState.get('isDebugMenuActive')}
            onClickClose={() => { remoteAppState.set({isDebugMenuActive: false}); }}
          />

          {/* Title */}
          <TitleRouteButton />

          {/* Page Content */}
          <Route exact path="/" component={UserLobbyPage} />

          <Route path="/lobby" component={UserLobbyPage} />

          <Route path="/game" component={UserGamePage} />

          <Route path="/encounter_editor" component={EncounterEditorPage} />

          <Route path="/item_editor" component={ItemEditorPage} />

          <Route path="/tile_editor" component={TileEditorPage} />

          {/* "Footer" - needs to be refactored to not be so hacky eventually */}
          <div
            className='position-fixed pad-1 mar-1 flex-row aitems-center'
            style={{bottom: 0, right: 0}}
          >
            <div className='adjacent-mar-l-2 color-gray'>{remoteAppState.get('name')}</div>

            {/* Debug Menu */}
            { remoteAppState.get('isDevMode') &&
              <ButtonComponent
                className='pad-2 adjacent-mar-l-2'
                onClick={() => { remoteAppState.set({isDebugMenuActive: !remoteAppState.get('isDebugMenuActive')}); }}
              >
                <LetterIconComponent className='mar-r-1' children='`' /> Debugger
              </ButtonComponent>
            }
          </div>
        </div>
      </BrowserRouter>
    );
  }
})
/**
 *
 */
const TitleRouteButton = withRouter(({history}) => (
  <h1
    className='flex-none color-white fsize-8 pad-v-2 f-bold width-full talign-center cursor-pointer'
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: false,
      });
      history.push('/');
    }}
  >
    Trick & Treat
  </h1>
))
