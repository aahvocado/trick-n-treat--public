import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import { observer } from 'mobx-react';

import ButtonComponent from 'common-components/ButtonComponent';
import FixedMenuComponent from 'common-components/FixedMenuComponent';

import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import remoteAppState from 'state/remoteAppState';
import remoteGameState from 'state/remoteGameState';

import {parseLogData} from 'utilities/logger.remote';

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

    this.onClickRestart = this.onClickRestart.bind(this);
  }
  /** @override */
  render() {
    const {
      active,
    } = this.props;

    return (
      <FixedMenuComponent
        className='bg-secondary flex-col aitems-center width-full talign-center'
        style={{
          boxShadow: '5px 0 3px 3px rgba(0, 0, 0, 0.4)',
          width: '250px',
        }}
        active={active}
        shouldUseOverlay={false}
        onClickOverlay={this.props.onClickOverlay}
      >
        <div className='fsize-4 flex-row jcontent-center width-full adjacent-mar-t-2'>
          {remoteAppState.get('name')}
        </div>

        <div className='flex-row jcontent-center width-full adjacent-mar-t-2'>
          <div className='fsize-3 color-grayer mar-r-1'>clientId</div>
          <div>{remoteAppState.get('clientId')}</div>
        </div>

        <ButtonComponent
          className='width-full adjacent-mar-t-2'
          onClick={this.props.onClickClose}
        >
          Close Debug Menu
        </ButtonComponent>

        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Editor Tools</h3>

          <CloseMenuButton label='Close Editor' />

          <RouteToEncounterEditorButton label='Open Encounter Editor' />

          <RouteToItemEditorButton label='Open Item Editor' />

          <RouteToTileEditorButton label='Open Tile Editor' />
        </div>

        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <ButtonComponent
            className='width-full'
            disabled={!remoteGameState.isGameReady()}
            onClick={this.onClickRestart}
          >
            Restart Game
          </ButtonComponent>
        </div>

        <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
          <h3 className='fsize-3 adjacent-mar-t-2'>Logs</h3>

          <textarea
            readOnly
            className='fsize-2 bor-1-gray borradius-1 pad-1 width-full flex-auto resize-none whitespace-pre-line'
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
   *
   */
  onClickRestart() {
    connectionManager.socket.emit(SOCKET_EVENT.DEBUG.TO_SERVER.RESTART_GAME);
  }
})
/**
 *
 */
const CloseMenuButton = withRouter(({label, history}) => (
  <ButtonComponent
    className='width-full flex-row aitems-center adjacent-mar-t-2'
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
    className='width-full flex-row aitems-center adjacent-mar-t-2'
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
    className='width-full flex-row aitems-center adjacent-mar-t-2'
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
    className='width-full flex-row aitems-center adjacent-mar-t-2'
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
