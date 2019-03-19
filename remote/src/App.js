import React, { Component } from 'react';

import {appStore} from 'data/remoteAppState';

import WebsocketConnectionIndicator from 'components/WebsocketConnectionIndicator';

import DebugPage from 'pages/DebugPage';

/**
 *
 */
export default class App extends Component {
  render() {
    return (
      <div className='bg-primary'>
        <WebsocketConnectionIndicator />

        <div className='position-fixed color-white pad-2' style={{right: 0}}>{appStore.name}</div>

        <div className='flex-centered flex-col color-white'>
          {/*<h1 className='flex-none fsize-8 olor-white mar-v-2 f-bold width-full text-center'>Trick & Treat</h1>*/}
          <DebugPage />
        </div>
      </div>
    );
  }
}
