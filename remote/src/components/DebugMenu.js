import React, { Component } from 'react';
import {NotificationManager} from 'react-notifications';
import {
  withRouter,
} from 'react-router-dom';
import {observer} from 'mobx-react';

import {faDatabase} from '@fortawesome/free-solid-svg-icons';

import ButtonComponent from 'common-components/ButtonComponent';
import FixedMenuComponent from 'common-components/FixedMenuComponent';
import IconButtonComponent from 'common-components/IconButtonComponent';
import TextInputComponent from 'common-components/TextInputComponent';

import CharacterSheetComponent from 'components/CharacterSheetComponent';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

import {parseLogData} from 'utilities/logger.remote';

import * as consoleUtils from 'utilities.shared/consoleUtils';

/**
 * dev debug menu
 */
export default observer(
class DebugMenu extends Component {
  static defaultProps = {
    /** @type {Boolean} */
    active: false,

    /** @type {Function} */
    onClickOverlay: () => {},
    /** @type {Function} */
    onClickClose: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onChangeConsole = this.onChangeConsole.bind(this);
    this.onSubmitConsole = this.onSubmitConsole.bind(this);

    this.state = {
      /** @type {String} */
      consoleText: '',
    }
  }
  /** @override */
  render() {
    const {
      active,
    } = this.props;

    const {
      consoleText,
    } = this.state;

    return (
      <FixedMenuComponent
        className='bg-secondary overflow-auto boxsizing-border flex-col aitems-center width-full talign-center'
        style={{
          boxShadow: '5px 0 3px 3px rgba(0, 0, 0, 0.4)',
          width: '250px',
        }}
        active={active}
        direction='left'
        position='left'
        shouldUseOverlay={false}
        onClickOverlay={this.props.onClickOverlay}
      >
        <div className='fsize-4 f-bold flex-row jcontent-center width-full'>
          {remoteAppState.get('name')}
        </div>

        <div className='flex-row jcontent-center width-full adjacent-mar-t-2'>
          <div className='fsize-3 color-grayer mar-r-1'>clientId</div>
          <div>{remoteAppState.get('clientId')}</div>
        </div>

        {/* Character Stat section */}
        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Character Stats</h3>

          <CharacterSheetComponent
            className='boxsizing-border width-full adjacent-mar-t-2'
            characterData={remoteGameState.get('myCharacter').export()}
          />
        </div>

        {/* Editor buttons section */}
        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Editor Tools</h3>

          <CloseMenuButton label='Close Editor' />

          <RouteToEncounterEditorButton label='Open Encounter Editor' />

          <RouteToItemEditorButton label='Open Item Editor' />

          <RouteToTileEditorButton label='Open Tile Editor' />
        </div>

        {/* Debugging Tools section */}
        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Debug Tools</h3>

          <form
            className='width-full flex-row adjacent-mar-t-2'
            onSubmit={this.onSubmitConsole}
          >
            <TextInputComponent
              containerClassName='flex-auto'
              value={consoleText}
              placeholder='Console'
              onChange={this.onChangeConsole}
            />
            <IconButtonComponent
              className='flex-none pad-h-2'
              icon={faDatabase}
            />
          </form>
        </div>

        <ButtonComponent
          className='width-full adjacent-mar-t-2'
          onClick={this.props.onClickClose}
        >
          Close Debug Menu
        </ButtonComponent>

        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Logs</h3>

          <textarea
            readOnly
            className='fsize-2 bor-1-gray borradius-1 pad-1 width-full flex-auto boxsizing-border resize-none whitespace-pre-line'
            style={{
              height: '220px',
            }}
            value={parseLogData(remoteAppState.get('appLog'))}
          />
        </div>
      </FixedMenuComponent>
    )
  }
  /**
   * @param {Event} evt
   */
  onChangeConsole(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({consoleText: evt.target.value});
  }
  /**
   * send console commands to the server for debugging purposes
   *
   * @todo - this needs to be cleaned up
   * @param {Event} evt
   */
  onSubmitConsole(evt) {
    evt.preventDefault();
    const {consoleText} = this.state;

    // empty command
    if (consoleText === '') {
      return;
    }
    // not valid console command
    const consoleData = consoleUtils.createConsoleData(consoleText);
    if (consoleData === null) {
      NotificationManager.error('Invalid command.', 'Console', 1000);
      return;
    }

    // ex: "restart"
    if (consoleData.action === 'restart') {
      connectionManager.socket.emit(SOCKET_EVENT.DEBUG.TO_SERVER.RESTART_GAME);
      NotificationManager.success('Requesting game restart!', 'Console');
      this.setState({consoleText: ''});
      return;
    }

    // ex: "set health 1"
    if (consoleData.action === 'set') {
      connectionManager.socket.emit(SOCKET_EVENT.DEBUG.TO_SERVER.CONSOLE_COMMAND, consoleData);
      NotificationManager.success('Requesting stat change...', 'Console');
      this.setState({consoleText: ''});
      return;
    }

    // ex: "move 10,10"
    if (consoleData.action === 'move') {
      connectionManager.socket.emit(SOCKET_EVENT.DEBUG.TO_SERVER.CONSOLE_COMMAND, consoleData);
      NotificationManager.success('Requesting to move...', 'Console');
      this.setState({consoleText: ''});
      return;
    }
  }
})
/**
 *
 */
const CloseMenuButton = withRouter(({label, history}) => (
  <ButtonComponent
    className='width-full aitems-center adjacent-mar-t-2'
    disabled={
      history.location.pathname !== '/encounter_editor' &&
      history.location.pathname !== '/item_editor' &&
      history.location.pathname !== '/tile_editor'
    }
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: false,
      });
      history.push('/');
    }}
  >
    { label }
  </ButtonComponent>
));
/**
 *
 */
const RouteToEncounterEditorButton = withRouter(({label, history}) => (
  <ButtonComponent
    className='width-full adjacent-mar-t-2'
    disabled={history.location.pathname === '/encounter_editor'}
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: true,
      });
      history.push('/encounter_editor');
    }}
  >
    { label }
  </ButtonComponent>
));
/**
 *
 */
const RouteToItemEditorButton = withRouter(({label, history}) => (
  <ButtonComponent
    className='width-full adjacent-mar-t-2'
    disabled={history.location.pathname === '/item_editor'}
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: true,
      });
      history.push('/item_editor');
    }}
  >
    { label }
  </ButtonComponent>
));
/**
 *
 */
const RouteToTileEditorButton = withRouter(({label, history}) => (
  <ButtonComponent
    className='width-full adjacent-mar-t-2'
    disabled={history.location.pathname === '/tile_editor'}
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: true,
      });
      history.push('/tile_editor');
    }}
  >
    { label }
  </ButtonComponent>
));
