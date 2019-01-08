import React, { Component } from 'react';

import PlayerGamePage from './pages/PlayerGamePage';
import {WebsocketConnectionIndicator} from 'components/WebsocketConnectionIndicator';

class App extends Component {
  render() {
    return (
      <div className='bg-primary'>
        <WebsocketConnectionIndicator />

        <div className='flex-centered flex-col color-white'>
          <h1 className='flex-none fsize-8 olor-white mar-ver-5 f-bold width-full text-center'>Trick & Treat</h1>
          <PlayerGamePage />
        </div>
      </div>
    );
  }
}

export default App;
