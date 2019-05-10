import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import { observer } from 'mobx-react';

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';
import CheckboxComponent from 'common-components/CheckboxComponent';
import FixedMenuComponent from 'common-components/FixedMenuComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';

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

      this.onClickToggleZoom = this.onClickToggleZoom.bind(this);
      this.onClickToggleVisibility = this.onClickToggleVisibility.bind(this);
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

          <div className='flex-row jcontent-center width-full adjacent-mar-t-2'>
            <div className='fsize-3 color-grayer mar-r-1'>userId</div>
            <div>{remoteAppState.get('userId')}</div>
          </div>

          <ClassicButtonComponent
            className='width-full adjacent-mar-t-2'
            onClick={this.props.onClickClose}
          >
            Close Debug Menu
          </ClassicButtonComponent>

          <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
            <h3 className='fsize-3 adjacent-mar-t-2'>Editor Tools</h3>

            <CloseMenuButton label='Close Editor' />

            <RouteToEncounterEditorButton label='Open Encounter Editor' />

            <RouteToTileEditorButton label='Open Tile Editor' />
          </div>

          <div className='width-full flex-col aitems-center adjacent-mar-t-2'>
            <h3 className='fsize-3 adjacent-mar-t-2'>Game Map Options</h3>

            <CheckboxComponent
              className='width-full aitems-center jcontent-start flex-row adjacent-mar-t-2'
              checked={remoteGameState.get('useZoomedOutMap')}
              onChange={this.onClickToggleZoom}
            >
              <LetterIconComponent className='mar-r-1' children='z' /> Zoom Out of Map
            </CheckboxComponent>

            <CheckboxComponent
              className='width-full aitems-center jcontent-start flex-row adjacent-mar-t-2'
              checked={remoteGameState.get('useFullyVisibleMap')}
              onChange={this.onClickToggleVisibility}
            >
              <LetterIconComponent className='mar-r-1' children='v' /> Fully Visible Map
            </CheckboxComponent>
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
    onClickToggleZoom() {
      remoteGameState.set({useZoomedOutMap: !remoteGameState.get('useZoomedOutMap')});
    }
    /**
     *
     */
    onClickToggleVisibility() {
      remoteGameState.set({useFullyVisibleMap: !remoteGameState.get('useFullyVisibleMap')});
    }
  }
)
/**
 *
 */
const CloseMenuButton = withRouter(({label, history}) => (
  <ClassicButtonComponent
    className='width-full flex-row aitems-center adjacent-mar-t-2'
    disabled={history.location.pathname !== '/encounter_editor' && history.location.pathname !== '/tile_editor'}
    onClick={() => {
      remoteAppState.set({
        isDebugMenuActive: false,
        isEditorMode: false,
      });
      history.push('/');
    }}
  >
    { label }
  </ClassicButtonComponent>
));
/**
 *
 */
const RouteToEncounterEditorButton = withRouter(({label, history}) => (
  <ClassicButtonComponent
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
  </ClassicButtonComponent>
));
/**
 *
 */
const RouteToTileEditorButton = withRouter(({label, history}) => (
  <ClassicButtonComponent
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
  </ClassicButtonComponent>
));
