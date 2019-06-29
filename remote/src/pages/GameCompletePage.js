import React, {Component} from 'react';
// import {Redirect} from 'react-router-dom';
import {observer} from 'mobx-react';

// import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import CharacterSheetComponent from 'components/CharacterSheetComponent';

// import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import remoteGameState from 'state/remoteGameState';

// import * as connectionManager from 'managers/connectionManager';

/**
 *
 */
export default observer(
class GameCompletePage extends Component {
  // /** @override */
  // constructor(props) {
  //   super(props);

  //   this.handleOnStartClick = this.handleOnStartClick.bind(this);
  // }
  /** @override */
  render() {
    const myCharacter = remoteGameState.get('myCharacter');

    return (
      <div className='bg-secondary pad-h-2 flex-auto flex-col-center'>
        <div className='pad-v-4 fsize-8 color-white text-stroke adjacent-mar-t-2'
          style={{textShadow: '0 0 10px #ffa525'}}
        >
          Tricking and Treating Complete!
        </div>

        <div className='fsize-6 color-white adjacent-mar-t-2'>
          {myCharacter.get('name') || 'no name'}
        </div>

        <CharacterSheetComponent
          className='bg-white boxsizing-border adjacent-mar-t-2'
          style={{width: '280px'}}
          characterData={myCharacter.export()}
        />
      </div>
    );
  }
});
