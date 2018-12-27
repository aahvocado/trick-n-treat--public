import React, { Component } from 'react';

import PlayerGamePage from 'pages/PlayerGamePage';

class App extends Component {
  render() {
    return (
      <div className='bg-primary'>
        <div className='flex-centered flex-col color-white'>
          <h1 className='fsize-9 olor-white mar-ver-5'>DROP TEAM!</h1>
          <PlayerGamePage />
        </div>
      </div>
    );
  }
}

export default App;
