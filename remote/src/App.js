import React, { Component } from 'react';

import PlayerGamePage from './pages/PlayerGamePage';

class App extends Component {
  render() {
    return (
      <div className='bg-primary'>
        <div className='flex-centered flex-col color-white'>
          <h1 className='flex-none fsize-8 olor-white mar-ver-2 f-bold width-full text-center'>Trick & Treat</h1>
          <PlayerGamePage />
        </div>
      </div>
    );
  }
}

export default App;
