import React, { PureComponent } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faToggleOff,
  faToggleOn,
} from '@fortawesome/free-solid-svg-icons'

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';
import CheckboxComponent from 'common-components/CheckboxComponent';
import FixedMenuComponent from 'common-components/FixedMenuComponent';
import LetterIconComponent from 'common-components/LetterIconComponent';

import remoteAppState from 'data/remoteAppState';

import {parseLogData} from 'utilities/logger.remote';

/**
 * dev debug menu
 */
export default class DebugMenu extends PureComponent {
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

    this.onClickSwitchToTileEditor = this.onClickSwitchToTileEditor.bind(this);

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
        className='bg-secondary flex-col aitems-center width-full text-center bor-r-3-gray'
        style={{
          width: '250px',
        }}
        active={active}
        shouldUseOverlay={false}
        onClickOverlay={this.props.onClickOverlay}
      >

        <div className='width-full text-center sibling-mar-t-2'>{`UserId: ${remoteAppState.get('userId')}`}</div>

        <ClassicButtonComponent
          className='width-full sibling-mar-t-2'
          onClick={this.props.onClickClose}
        >
          Close
        </ClassicButtonComponent>

        <div className='width-full flex-col aitems-center sibling-mar-t-2'>
          <h3 className='fsize-3 sibling-mar-t-2'>Editor Tools</h3>

          <IndicatorButtonComponent
            active={remoteAppState.get('isTileEditorMode')}
            onClick={this.onClickSwitchToTileEditor}
          >
            <LetterIconComponent className='mar-r-1' children='t' /> Open Tile Editor
          </IndicatorButtonComponent>
        </div>

        <div className='width-full flex-col aitems-center sibling-mar-t-2'>
          <h3 className='fsize-3 sibling-mar-t-2'>Game Map Options</h3>

          <CheckboxComponent
            className='width-full aitems-center jcontent-start flex-row sibling-mar-t-2'
            checked={remoteAppState.get('useZoomedOutMap')}
            onChange={this.onClickToggleZoom}
          >
            <LetterIconComponent className='mar-r-1' children='z' /> Zoom Out of Map
          </CheckboxComponent>

          <CheckboxComponent
            className='width-full aitems-center jcontent-start flex-row sibling-mar-t-2'
            checked={remoteAppState.get('useFullyVisibleMap')}
            onChange={this.onClickToggleVisibility}
          >
            <LetterIconComponent className='mar-r-1' children='v' /> Fully Visible Map
          </CheckboxComponent>
        </div>

        <div className='width-full flex-col aitems-center sibling-mar-t-2'>
          <h3 className='fsize-3 sibling-mar-t-2'>Logs</h3>

          <textarea
            readOnly
            className='fsize-2 bor-1-gray borradius-1 pad-1 width-full flex-grow-1 flex-shrink-1'
            style={{
              height: '220px',
              resize: 'none',
              whiteSpace: 'pre-line',
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
  onClickSwitchToTileEditor() {
    remoteAppState.set({isTileEditorMode: !remoteAppState.get('isTileEditorMode')});
  }
  /**
   *
   */
  onClickToggleZoom() {
    remoteAppState.set({useZoomedOutMap: !remoteAppState.get('useZoomedOutMap')});
  }
  /**
   *
   */
  onClickToggleVisibility() {
    remoteAppState.set({useFullyVisibleMap: !remoteAppState.get('useFullyVisibleMap')});
  }
}
/**
 *
 */
class IndicatorButtonComponent extends PureComponent {
  render() {
    const {
      active,
      ...otherProps
    } = this.props;

    return (
      <div className='width-full aitems-center jcontent-start flex-row sibling-mar-t-2'>
        <FontAwesomeIcon className='fsize-3 mar-r-2' icon={active ? faToggleOn : faToggleOff} />

        <ClassicButtonComponent
          {...otherProps}
        />
      </div>
    )
  }
}
