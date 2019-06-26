import React, { Component, Fragment, PureComponent } from 'react';
import {NotificationManager} from 'react-notifications';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import array2d from 'array2d';
import Point from '@studiomoniker/point';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faPause,
  faPlay,
  faRetweet,
} from '@fortawesome/free-solid-svg-icons'

import ButtonComponent from 'common-components/ButtonComponent';
import CheckboxComponent from 'common-components/CheckboxComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ModalComponent from 'common-components/ModalComponent';
import NumericalMenuComponent from 'common-components/NumericalMenuComponent';
import RadioButtonComponent from 'common-components/RadioButtonComponent';

import {TileItemComponent} from 'components/TileMapComponent';
import TileInspectorComponent from 'components/TileInspectorComponent';

import {LIGHT_LEVEL} from 'constants.shared/lightLevelIds';
import {
  TILE_ID,
  TILE_ID_NAME_MAP,
} from 'constants.shared/tileIds';
import {SOCKET_EVENT} from 'constants.shared/socketEvents';

import * as connectionManager from 'managers/connectionManager';

import remoteAppState from 'state/remoteAppState';

import debounce from 'utilities.shared/debounce';

/**
 * page for tile editing
 */
export default observer(
class TileEditorPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnChangeHeightValue = this.handleOnChangeHeightValue.bind(this);
    this.handleOnChangeWidthValue = this.handleOnChangeWidthValue.bind(this);
    this.handleOnChangeTileSizeValue = this.handleOnChangeTileSizeValue.bind(this);
    this.handleNewGrid = this.handleNewGrid.bind(this);
    this.updateGrid = debounce(this.updateGrid.bind(this), 350);

    this.handleOnClickTile = this.handleOnClickTile.bind(this);
    this.handleOnHoverTile = this.handleOnHoverTile.bind(this);
    this.handleOnLeaveTile = this.handleOnLeaveTile.bind(this);
    this.handleOnChangeEditorTile = this.handleOnChangeEditorTile.bind(this);

    this.onChangeMapHistoryIdx = this.onChangeMapHistoryIdx.bind(this);
    this.onToggleAutoplayHistory = this.onToggleAutoplayHistory.bind(this);
    this.onClickRequestHistory = this.onClickRequestHistory.bind(this);

    const history = remoteAppState.get('history');
    const currentTileGrid = remoteAppState.get('currentTileGrid');
    const defaultMapHistoryIdx = history.length - 1;
    const defaultGrid = history[defaultMapHistoryIdx] || currentTileGrid || array2d.build(10, 10, null);

    this.state = {
      /** @type {Point} */
      hoveredTilePos: null,

      selectedEditorTile: 'GRASS_EDITOR_TILE',
      mapGrid: defaultGrid,
      mapWidth: array2d.width(defaultGrid),
      mapHeight: array2d.height(defaultGrid),
      tileSize: this.getAutoAdjustedTileSize(defaultGrid),

      /** @type {Boolean} */
      isAutoplayHistory: false,
      /** @type {Number} */
      historyIdx: defaultMapHistoryIdx,
      /** @type {Boolean} */
      loading: false,
    }
  }
  /** @override */
  componentDidMount() {
    setInterval(() => {
      if (this.state.isAutoplayHistory) {
        const history = remoteAppState.get('history');
        const nextIdx = this.state.historyIdx + 1;

        // if autoplay is about to go above idx, then we have to stop;
        if (nextIdx > history.length - 1) {
          this.onToggleAutoplayHistory();
          return;
        }

        // show the next map
        this.onChangeMapHistoryIdx(nextIdx);
      };
    }, 50);
  }
  /** @override */
  render() {
    if (!remoteAppState.get('isEditorMode')) {
      if (remoteAppState.get('isInLobby')) {
        return <Redirect to='/lobby' />
      }

      if (remoteAppState.get('isInGame')) {
        return <Redirect to='/game' />
      }
    }

    const {
      hoveredTilePos,
      isAutoplayHistory,
      loading,
      mapGrid,
      mapWidth,
      mapHeight,
      historyIdx,
      selectedEditorTile,
      tileSize,
    } = this.state;

    const useCells = true;
    const showEditor = false;

    const history = remoteAppState.get('history');
    const isEndOfHistory = historyIdx === history.length - 1;

    return (
      <div className='flex-center flex-col color-white bg-primary'>
        <h2 className='bg-secondary fsize-4 pad-v-1 width-full talign-center'>Tile Editor</h2>

        <div className='flex-row-center'>
          <div className='fsize-3 adjacent-mar-l-2'>
            Tile Map History
          </div>

          <ButtonComponent
            className='flex-none adjacent-mar-l-2'
            disabled={!remoteAppState.get('isGameInProgress') || loading}
            onClick={this.onClickRequestHistory}
          >
            Request
          </ButtonComponent>

          <ButtonComponent
            className='flex-none adjacent-mar-l-2'
            disabled={history.length <= 0}
            onClick={this.onToggleAutoplayHistory}
          >
            <FontAwesomeIcon className='fsize-3' icon={isAutoplayHistory ? faPause : isEndOfHistory ? faRetweet : faPlay} />
          </ButtonComponent>

          <NumericalMenuComponent
            className='fsize-4 adjacent-mar-l-2'
            defaultIdx={historyIdx}
            maxToShow={7}
            maxIdx={history.length - 1}
            onChange={this.onChangeMapHistoryIdx}
          />
        </div>

        <div className='flex-row height-full bg-primary-darker'>
          { showEditor &&
            <EditorPanel
              mapGrid={mapGrid}
              mapWidth={mapWidth}
              mapHeight={mapHeight}
              tileSize={tileSize}
              selectedEditorTile={selectedEditorTile}

              onChangeHeightValue={this.handleOnChangeHeightValue}
              onChangeWidthValue={this.handleOnChangeWidthValue}
              onChangeTileSizeValue={this.handleOnChangeTileSizeValue}
              onChangeEditorTile={this.handleOnChangeEditorTile}

              onNewGrid={this.handleNewGrid}
            />
          }

          <div className='flex-row-center mar-h-auto mar-v-5'>
            {/* Tile Inspection */}
            { hoveredTilePos !== null &&
              <TileInspectorComponent
                style={{right: '10px', top: '70px'}}
                tileData={array2d.get(mapGrid, hoveredTilePos.y, hoveredTilePos.x)}
              />
            }

            <div className='overflow-hidden bg-grayest flex-auto flex-col aitems-center position-relative bor-4-primary'>
              { mapGrid.map((mapRowData, rowIdx) => {
                return (
                  <div
                    className='flex-row flex-grow-only'
                    key={`tile-map-row-${rowIdx}-key`}
                  >
                    {/* Cells */}
                    { mapRowData.map((cellData, colIdx) => {
                      const position = new Point(colIdx, rowIdx);

                      const tile = cellData === null ? null : (useCells ? cellData.tile : cellData);
                      // const style = useCells ? {
                      //   borderStyle: 'solid',
                      //   borderWidth: '2px',
                      //   borderLeftColor: cellData.get('left') ? 'black' : 'transparent',
                      //   borderRightColor: cellData.get('right') ? 'black' : 'transparent',
                      //   borderTopColor: cellData.get('top') ? 'black' : 'transparent',
                      //   borderBottomColor: cellData.get('bottom') ? 'black' : 'transparent',
                      // } : undefined;

                      return (
                        <TileItemComponent
                          key={`tile-item-${colIdx}-${rowIdx}-key`}
                          // -- props already in data
                          tile={tile}
                          position={position}
                          lightLevel={LIGHT_LEVEL.MAX}

                          // -- props from parent
                          tileSize={tileSize}
                          // onTileClick={this.handleOnClickTile}
                          onTileHover={this.handleOnHoverTile}
                          // onTileLeave={this.handleOnLeaveTile}
                        />
                      )
                    })}
                  </div>
                )})
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
  /**
   * @param {Point} point
   */
  handleOnClickTile(point) {
    const {
      selectedEditorTile,
      mapGrid,
    } = this.state;

    const translatedEditorTile = (() => {
      switch(selectedEditorTile) {
        case 'EMPTY_EDITOR_TILE':
          return TILE_ID.EMPTY;
        case 'GRASS_EDITOR_TILE':
          return TILE_ID.GRASS;
        case 'SIDEWALK_EDITOR_TILE':
          return TILE_ID.SIDEWALK;
        case 'ROAD_EDITOR_TILE':
          return TILE_ID.ROAD;
        case 'SWAMP_EDITOR_TILE':
          return TILE_ID.SWAMP;
        case 'PLANKS_EDITOR_TILE':
          return TILE_ID.PLANKS;
        case 'WOODS_EDITOR_TILE':
          return TILE_ID.WOODS;
        case 'WATER_EDITOR_TILE':
          return TILE_ID.WATER;
        case 'FOREST_EDITOR_TILE':
          return TILE_ID.FOREST;
        case 'NULL_EDITOR_TILE':
        default:
          return null;
      }
    })();

    // look at what's existing, if we're about to use the same type on a tile, then make it empty
    const existingTileId = array2d.get(mapGrid, point.y, point.x);
    const isIdentitical = existingTileId === translatedEditorTile;
    const nextTileId = !isIdentitical ? translatedEditorTile : TILE_ID.EMPTY;

    // update that tile
    array2d.set(mapGrid, point.y, point.x, nextTileId);
    this.setState({mapGrid: mapGrid});
  }
  /**
   *
   */
  handleOnHoverTile(position) {
    this.setState({hoveredTilePos: position});
  }
  /**
   *
   */
  handleOnLeaveTile(position) {

  }
  /**
   *
   */
  handleOnChangeHeightValue(newHeight) {
    this.setState({mapHeight: newHeight}, () => {
      this.updateGrid();
    });
  }
  /**
   *
   */
  handleOnChangeWidthValue(newWidth) {
    this.setState({mapWidth: newWidth}, () => {
      this.updateGrid();
    });
  }
  /**
   *
   */
  handleNewGrid(newGrid) {
    if (newGrid.length === 0) {
      return;
    }

    const newWidth = array2d.width(newGrid);
    const newHeight = array2d.height(newGrid);

    this.setState({
      mapGrid: newGrid,
      mapWidth: newWidth,
      mapHeight: newHeight,
      tileSize: this.getAutoAdjustedTileSize(newGrid),
    });
  }
  /**
   *
   */
  updateGrid() {
    const oldGrid = this.state.mapGrid;
    const newHeight = this.state.mapHeight;
    const newWidth = this.state.mapWidth;

    // go through and assign old data
    const newGrid = array2d.build(newWidth, newHeight, null);
    array2d.eachCell(newGrid, (tile, row, column) => {
      const oldTileData = array2d.get(oldGrid, row, column);
      if (oldTileData === null || oldTileData === undefined) {
        return;
      }

      array2d.set(newGrid, row, column, oldTileData);
    });

    this.setState({
      mapGrid: newGrid,
      mapHeight: newHeight,
      mapWidth: newWidth,
      tileSize: this.getAutoAdjustedTileSize(newGrid),
    });
  }
  /**
   *
   */
  handleOnChangeTileSizeValue(newValue) {
    this.setState({tileSize: newValue});
  }
  /**
   * @param {String} newValue
   */
  handleOnChangeEditorTile(newValue) {
    this.setState({selectedEditorTile: newValue});
  }
  /**
   * @param {Grid} matrix
   * @returns {Number}
   */
  getAutoAdjustedTileSize(matrix) {
    const minTileSize = 10;
    const maxTileSize = 45;

    const width = array2d.width(matrix);
    const height = array2d.height(matrix);

    const excessLimit = 5;
    const excessMapWidth = width > excessLimit ? (width - excessLimit) : 0;
    const excessMapHeight = height > excessLimit ? (height - excessLimit) : 0;
    const greatestExcess = Math.max(excessMapWidth, excessMapHeight);

    return Math.max(maxTileSize - greatestExcess, minTileSize);
  }
  /**
   * @param {Number} idx
   */
  onChangeMapHistoryIdx(idx) {
    const history = remoteAppState.get('history');
    const nextGrid = history[idx];
    this.setState({historyIdx: idx}, () => {
      this.handleNewGrid(nextGrid);
    });
  }
  /**
   *
   */
  onToggleAutoplayHistory() {
    const history = remoteAppState.get('history');

    const {isAutoplayHistory, historyIdx} = this.state;
    const isEndOfHistory = historyIdx === history.length - 1;

    this.setState({
      historyIdx: isEndOfHistory && !isAutoplayHistory ? 0 : historyIdx,
      isAutoplayHistory: !isAutoplayHistory,
    });
  }
  /**
   *
   */
  onClickRequestHistory() {
    connectionManager.socket.emit(SOCKET_EVENT.DEBUG.TO_SERVER.REQUEST_MAP_HISTORY);
    NotificationManager.info('Request sent, this might take a few seconds.');

    this.setState({loading: true}, () => {
      connectionManager.socket.on(SOCKET_EVENT.DEBUG.TO_CLIENT.SET_MAP_HISTORY, () => {
        NotificationManager.success('History received.');
        this.setState({loading: false});
      })
    })
  }
})
/**
 *
 */
class EditorPanel extends PureComponent {
  static defaultProps = {
    onChangeHeightValue: () => {},
    onChangeWidthValue: () => {},
    onChangeTileSizeValue: () => {},

    mapWidth: 10,
    mapHeight: 10,
    tileSize: 15,
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onExportClick = this.onExportClick.bind(this);
    this.onImportClick = this.onImportClick.bind(this);
    this.onClickModalOverlay = this.onClickModalOverlay.bind(this);

    this.onChangeExportType = this.onChangeExportType.bind(this);
    this.onChangeWidthValue = this.onChangeWidthValue.bind(this);
    this.onChangeHeightValue = this.onChangeHeightValue.bind(this);
    this.onChangeTileSizeValue = this.onChangeTileSizeValue.bind(this);

    this.onChangeUseLitTiles = this.onChangeUseLitTiles.bind(this);
    this.onSelectTileEditorType = this.onSelectTileEditorType.bind(this);

    this.createExportedGrid = this.createExportedGrid.bind(this);
    this.handleImportGrid = this.handleImportGrid.bind(this);

    this.state = {
      showModal: false,
      ModalContent: ImportModal,

      // -- form values
      useLitTiles: false,
      selectedExportType: 'EXPORT_TILE_ID',
    }
  }
  /** @override */
  render() {
    const {
      mapWidth,
      mapHeight,
      tileSize,
      selectedEditorTile,
    } = this.props;

    const {
      ModalContent,
      showModal,
      selectedExportType,
      useLitTiles,
    } = this.state;

    return (
      <div
        className='flex-col aitems-center color-white bg-primary pad-2'
        style={{
          width: '230px',
        }}
      >
        {/* Modal */}
        <ModalComponent
          className='flex-col-center bg-white pad-2 mar-v-5'
          style={{
            width: '500px',
            height: '500px',
          }}
          active={showModal}
          onClickOverlay={this.onClickModalOverlay}
        >
          <ModalContent />
        </ModalComponent>

        {/* Tile options */}
        <form
          className='adjacent-mar-t-3 width-full flex-row flexwrap-yes'
          onSubmit={e => e.preventDefault()}
        >
          <CheckboxComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={useLitTiles}
            value='USE_LIT_CHECKBOX'
            onChange={this.onChangeUseLitTiles}
          >
            Lit
          </CheckboxComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'NULL_EDITOR_TILE'}
            value='NULL_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            null
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'EMPTY_EDITOR_TILE'}
            value='EMPTY_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Empty
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'GRASS_EDITOR_TILE'}
            value='GRASS_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Grass
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'SIDEWALK_EDITOR_TILE'}
            value='SIDEWALK_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Sidewalk
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'ROAD_EDITOR_TILE'}
            value='ROAD_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Road
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'SWAMP_EDITOR_TILE'}
            value='SWAMP_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Swamp
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'PLANKS_EDITOR_TILE'}
            value='PLANKS_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Planks
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'WOODS_EDITOR_TILE'}
            value='WOODS_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Woods
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'WATER_EDITOR_TILE'}
            value='WATER_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Water
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 mar-t-1'
            style={{flex: '1 1 50%'}}
            checked={selectedEditorTile === 'FOREST_EDITOR_TILE'}
            value='FOREST_EDITOR_TILE'
            onChange={this.onSelectTileEditorType}
          >
            Forest
          </RadioButtonComponent>
        </form>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Map options */}
        <form
          className='adjacent-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <TextInputComponent
            value={mapWidth}
            onChange={this.onChangeWidthValue}
            type='number'
            label='Width'
          />

          <TextInputComponent
            value={mapHeight}
            onChange={this.onChangeHeightValue}
            type='number'
            label='Height'
          />

          <TextInputComponent
            value={tileSize}
            onChange={this.onChangeTileSizeValue}
            type='number'
            label='Tile Size'
          />
        </form>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Export options */}
        <form
          className='adjacent-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <RadioButtonComponent
            className='fsize-3 adjacent-mar-t-2'
            checked={selectedExportType === 'EXPORT_TILE_ID'}
            value='EXPORT_TILE_ID'
            onChange={this.onChangeExportType}
          >
            export with Tile ID
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 adjacent-mar-t-2'
            checked={selectedExportType === 'EXPORT_TILE_STRING'}
            value='EXPORT_TILE_STRING'
            onChange={this.onChangeExportType}
          >
            export with Tile Name
          </RadioButtonComponent>

          <ButtonComponent
            className='adjacent-mar-t-2'
            onClick={this.onExportClick}
          >
            Export
          </ButtonComponent>
        </form>

        <FontAwesomeIcon className='adjacent-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Import options */}
        <form
          className='adjacent-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <ButtonComponent
            className='adjacent-mar-t-3'
            onClick={this.onImportClick}
          >
            Import
          </ButtonComponent>
        </form>
      </div>
    );
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeExportType(e) {
    const value = e.target.value;
    this.setState({selectedExportType: value});
  }
  /**
   *
   */
  onExportClick() {
    const exportGridString = this.createExportedGrid();
    this.setState({
      showModal: true,
      ModalContent: () => (<ExportModal value={exportGridString} />),
    });
  }
  /**
   * @returns {String}
   */
  createExportedGrid() {
    const {mapGrid} = this.props;

    const {selectedExportType} = this.state;
    const useTileName = selectedExportType === 'EXPORT_TILE_STRING';

    let exportString = '[';

    mapGrid.forEach((matrixRow, rowIdx) => {
      exportString += '[';

      matrixRow.forEach((tileData, colIdx) => {
        if (tileData === undefined) {
          exportString += null;
        } else {
          exportString += useTileName ? TILE_ID_NAME_MAP[tileData] : tileData;
        }

        if (colIdx < matrixRow.length - 1) {
          exportString += ', ';
        }
      });

      exportString += ']';
      if (rowIdx < mapGrid.length - 1) {
        exportString += ',\n';
      }
    });

    exportString += ']';

    return exportString;
  }
  /**
   *
   */
  onImportClick() {
    this.setState({
      showModal: true,
      ModalContent: () => (<ImportModal onClickModalSubmit={this.handleImportGrid} />),
    });
  }
  /**
   *
   */
  handleImportGrid(matrixText) {
    const parseResult = JSON.parse(matrixText);
    if (!Array.isArray(parseResult)) {
      console.error('Did not import a 2D Array');
      return;
    }

    this.props.onNewGrid(parseResult);
    this.setState({showModal: false});
  }
  /**
   *
   */
  onClickModalOverlay() {
    this.setState({showModal: false});
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeWidthValue(e) {
    this.props.onChangeWidthValue(e.target.value);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeHeightValue(e) {
    this.props.onChangeHeightValue(e.target.value);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeTileSizeValue(e) {
    this.props.onChangeTileSizeValue(e.target.value);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onChangeUseLitTiles(e) {
    const checked = e.target.checked;
    this.setState({useLitTiles: checked});
  }
  /**
   * @param {SyntheticEvent} e
   */
  onSelectTileEditorType(e) {
    const value = e.target.value;
    this.props.onChangeEditorTile(value);
  }
}
class ExportModal extends Component {
  render() {
    const {
      value,
    } = this.props;

    return (
      <Fragment>
        <span className='color-black fsize-4'>Export Result</span>
        <textarea
          className='color-black pad-2 width-full height-full boxsizing-border bor-1-gray'
          defaultValue={value}
        />
      </Fragment>
    )
  }
}
class ImportModal extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.state = {
      value: undefined,
    }
  }
  /** @override */
  render() {
    return (
      <Fragment>
        <span className='color-black fsize-4'>Import</span>
        <textarea
          className='color-black pad-2 width-full height-full boxsizing-border bor-1-gray'
          placeholder='I want a Grid'
          onChange={this.handleOnChangeTextarea.bind(this)}
        />

        <ButtonComponent
          className='mar-t-2'
          onClick={this.onClickSubmit.bind(this)}
        >
          Submit
        </ButtonComponent>
      </Fragment>
    )
  }
  /**
   * @param {SyntheticEvent} evt
   */
  handleOnChangeTextarea(evt) {
    this.setState({value: evt.target.value});
  }
  /**
   *
   */
  onClickSubmit() {
    const {value} = this.state;
    if (value === undefined || value === null || value === '') {
      return;
    }

    this.props.onClickModalSubmit(value);
  }
}
