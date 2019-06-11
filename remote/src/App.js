import React, { Component } from 'react';
import {NotificationContainer} from 'react-notifications';

import {
  BrowserRouter,
  Route,
  withRouter,
} from 'react-router-dom';
import { observer } from 'mobx-react';

import ButtonComponent from 'common-components/ButtonComponent';

import DebugMenu from 'components/DebugMenu';
import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import EncounterEditorPage from 'pages/EncounterEditorPage';
import ItemEditorPage from 'pages/ItemEditorPage';
import TileEditorPage from 'pages/TileEditorPage';
import UserGamePage from 'pages/UserGamePage';
import UserLobbyPage from 'pages/UserLobbyPage';

import remoteAppState from 'state/remoteAppState';
// import remoteGameState from 'state/remoteGameState';
//
/**
 *
 */
export default observer(
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className='bg-primary'>
          <NotificationContainer/>

          {/* connection status */}
          <WebsocketConnectionIndicator />

          {/* Dev Tools - side menu */}
          <DebugMenu
            active={remoteAppState.get('isDebugMenuActive')}
            onClickClose={() => { remoteAppState.set({isDebugMenuActive: false}); }}
          />

          {/* Debug toggler */}
          { remoteAppState.get('isDevMode') &&
            <ButtonComponent
              className='opacity-0 pad-2 position-absolute sibling-mar-l-2'
              style={{left: '10px', bottom: '10px'}}
              onClick={() => remoteAppState.set({isDebugMenuActive: true})}
            >
              Debugger
            </ButtonComponent>
          }

          {/* Title */}
          <TitleRouteButton />

          {/* Page Content */}
          <Route exact path="/" component={UserLobbyPage} />

          <Route path="/lobby" component={UserLobbyPage} />

          <Route path="/game" component={UserGamePage} />

          <Route path="/encounter_editor" component={EncounterEditorPage} />

          <Route path="/item_editor" component={ItemEditorPage} />

          <Route path="/tile_editor" component={TileEditorPage} />
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
