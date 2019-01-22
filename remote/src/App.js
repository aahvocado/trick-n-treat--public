import React, { Component } from 'react';

import DebugPage from 'pages/DebugPage';
import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

class App extends Component {
  render() {
    return (
      <div className='bg-primary'>
        <WebsocketConnectionIndicator />

        <div className='flex-centered flex-col color-white'>
          <h1 className='flex-none fsize-8 olor-white mar-v-2 f-bold width-full text-center'>Trick & Treat</h1>
          <DebugPage />
        </div>
      </div>
    );
  }
}

export default App;
