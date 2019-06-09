import React, { Component, Fragment, PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import Point from '@studiomoniker/point';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'

import ButtonComponent from 'common-components/ButtonComponent';
import CheckboxComponent from 'common-components/CheckboxComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ModalComponent from 'common-components/ModalComponent';
import NumericalMenuComponent from 'common-components/NumericalMenuComponent';
import RadioButtonComponent from 'common-components/RadioButtonComponent';

import {TileItemComponent} from 'components/TileMapComponent';

import {LIGHT_LEVEL} from 'constants.shared/lightLevelIds';
import {
  TILE_TYPES,
  TILE_TYPES_NAME,
} from 'constants.shared/tileTypes';

import remoteAppState from 'state/remoteAppState';

import debounce from 'utilities.shared/debounce';
import * as matrixUtils from 'utilities.shared/matrixUtils';

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
    this.handleNewMatrix = this.handleNewMatrix.bind(this);
    this.updateMatrix = debounce(this.updateMatrix.bind(this), 350);

    this.handleOnClickTile = this.handleOnClickTile.bind(this);
    this.handleOnHoverTile = this.handleOnHoverTile.bind(this);
    this.handleOnLeaveTile = this.handleOnLeaveTile.bind(this);
    this.handleOnChangeEditorTile = this.handleOnChangeEditorTile.bind(this);

    this.onChangeMapHistoryIdx = this.onChangeMapHistoryIdx.bind(this);
    this.onToggleAutoplayHistory = this.onToggleAutoplayHistory.bind(this);

    const mapHistory = remoteAppState.get('mapHistory');
    const currentTileMatrix = remoteAppState.get('currentTileMatrix')
    const defaultMatrix = mapHistory[0] || currentTileMatrix || matrixUtils.createMatrix(10, 10, null);

    this.state = {
      selectedEditorTile: 'GRASS_EDITOR_TILE',
      focusedTile: new Point(-1, -1),
      mapMatrix: defaultMatrix,
      mapWidth: matrixUtils.getWidth(defaultMatrix),
      mapHeight: matrixUtils.getHeight(defaultMatrix),
      tileSize: this.getAutoAdjustedTileSize(defaultMatrix),

      /** @type {Boolean} */
      isAutoplayHistory: false,
      /** @type {Number} */
      mapHistoryIdx: 0,
    }
  }
  /** @override */
  componentDidMount() {
    setInterval(() => {
      if (this.state.isAutoplayHistory) {
        const mapHistory = remoteAppState.get('mapHistory');
        const nextIdx = this.state.mapHistoryIdx + 1;

        // if autoplay is about to go above idx, then we have to stop;
        if (nextIdx > mapHistory.length - 1) {
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
      focusedTile,
      isAutoplayHistory,
      mapMatrix,
      mapWidth,
      mapHeight,
      mapHistoryIdx,
      selectedEditorTile,
      tileSize,
    } = this.state;

    const mapHistory = remoteAppState.get('mapHistory');

    return (
      <div className='flex-center flex-col color-white bg-primary'>
        <h2 className='bg-secondary fsize-4 pad-v-1 width-full talign-center'>Tile Editor</h2>

        <div className='flex-row-center'>
          <div className='fsize-3 adjacent-mar-l-2'>
            Tile Map History
          </div>

          <NumericalMenuComponent
            className='fsize-4 adjacent-mar-l-2'
            defaultIdx={mapHistoryIdx}
            maxToShow={7}
            maxIdx={Math.max(mapHistory.length - 1, 0)}
            onChange={this.onChangeMapHistoryIdx}
          />

          <ButtonComponent
            className='flex-none adjacent-mar-l-2'
            disabled={mapHistory.length <= 0 || mapHistoryIdx >= mapHistory.length - 1}
            onClick={this.onToggleAutoplayHistory}
          >
            <FontAwesomeIcon className='fsize-3' icon={isAutoplayHistory ? faPause : faPlay} />
          </ButtonComponent>
        </div>

        <div className='flex-row height-full bg-primary-darker'>
          <EditorPanel
            mapMatrix={mapMatrix}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
            tileSize={tileSize}
            selectedEditorTile={selectedEditorTile}

            onChangeHeightValue={this.handleOnChangeHeightValue}
            onChangeWidthValue={this.handleOnChangeWidthValue}
            onChangeTileSizeValue={this.handleOnChangeTileSizeValue}
            onChangeEditorTile={this.handleOnChangeEditorTile}

            onNewMatrix={this.handleNewMatrix}
          />

          <div
            className='flex-row-center mar-h-auto mar-t-5'
          >
            <div
              className='overflow-hidden flex-auto flex-col aitems-center position-relative bor-4-primary'
              style={{backgroundColor: '#252525'}}
            >
              { mapMatrix.map((mapRowData, rowIdx) => {
                return (
                  <div className='flex-row flex-grow-only' key={`tile-map-row-${rowIdx}-key`} >
                    { mapRowData.map((tileData, colIdx) => {
                      const position = new Point(colIdx, rowIdx);

                      return (
                        <TileItemComponent
                          key={`tile-item-${colIdx}-${rowIdx}-key`}
                          {...tileData}
                          tileSize={tileSize}
                          position={position}
                          tileType={tileData}
                          lightLevel={LIGHT_LEVEL.MAX}
                          isSelected={focusedTile.equals(position)}


                          onTileClick={this.handleOnClickTile}
                          onTileHover={this.handleOnHoverTile}
                          onTileLeave={this.handleOnLeaveTile}
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
      mapMatrix,
    } = this.state;

    const translatedEditorTile = (() => {
      switch(selectedEditorTile) {
        case 'EMPTY_EDITOR_TILE':
          return TILE_TYPES.EMPTY;
        case 'GRASS_EDITOR_TILE':
          return TILE_TYPES.GRASS;
        case 'SIDEWALK_EDITOR_TILE':
          return TILE_TYPES.SIDEWALK;
        case 'ROAD_EDITOR_TILE':
          return TILE_TYPES.ROAD;
        case 'SWAMP_EDITOR_TILE':
          return TILE_TYPES.SWAMP;
        case 'PLANKS_EDITOR_TILE':
          return TILE_TYPES.PLANKS;
        case 'WOODS_EDITOR_TILE':
          return TILE_TYPES.WOODS;
        case 'WATER_EDITOR_TILE':
          return TILE_TYPES.WATER;
        case 'FOREST_EDITOR_TILE':
          return TILE_TYPES.FOREST;
        case 'NULL_EDITOR_TILE':
        default:
          return null;
      }
    })();

    // look at what's existing, if we're about to use the same type on a tile, then make it empty
    const existingTileType = matrixUtils.getTileAt(mapMatrix, point);
    const isIdentitical = existingTileType === translatedEditorTile;
    const nextTileType = !isIdentitical ? translatedEditorTile : TILE_TYPES.EMPTY;

    // update that tile
    matrixUtils.setTileAt(mapMatrix, point, nextTileType);
    this.setState({mapMatrix: mapMatrix});
  }
  /**
   *
   */
  handleOnHoverTile(position) {
    this.setState({focusedTile: position});
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
      this.updateMatrix();
    });
  }
  /**
   *
   */
  handleOnChangeWidthValue(newWidth) {
    this.setState({mapWidth: newWidth}, () => {
      this.updateMatrix();
    });
  }
  /**
   *
   */
  handleNewMatrix(newMatrix) {
    const newHeight = newMatrix[0].length;
    const newWidth = newMatrix.length;

    this.setState({
      mapMatrix: newMatrix,
      mapHeight: newHeight,
      mapWidth: newWidth,
      tileSize: this.getAutoAdjustedTileSize(newMatrix),
    });
  }
  /**
   *
   */
  updateMatrix() {
    const oldMatrix = this.state.mapMatrix;
    const newHeight = this.state.mapHeight;
    const newWidth = this.state.mapWidth;

    // go through and assign old data
    const newMatrix = matrixUtils.createMatrix(newWidth, newHeight, null);
    matrixUtils.forEach(newMatrix, (tile, position) => {
      const oldTileData = oldMatrix[position.y] && oldMatrix[position.y][position.x];
      if (oldTileData === null || oldTileData === undefined) {
        return;
      }

      newMatrix[position.y][position.x] = oldTileData;
    });

    this.setState({
      mapMatrix: newMatrix,
      mapHeight: newHeight,
      mapWidth: newWidth,
      tileSize: this.getAutoAdjustedTileSize(newMatrix),
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
   * @param {Matrix} matrix
   * @returns {Number}
   */
  getAutoAdjustedTileSize(matrix) {
    const minTileSize = 10;
    const maxTileSize = 45;

    const width = matrixUtils.getWidth(matrix);
    const height = matrixUtils.getHeight(matrix);

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
    const mapHistory = remoteAppState.get('mapHistory');
    const nextMatrix = mapHistory[idx];
    this.setState({mapHistoryIdx: idx}, () => {
      this.handleNewMatrix(nextMatrix);
    });
  }
  /**
   *
   */
  onToggleAutoplayHistory() {
    const {isAutoplayHistory} = this.state;
    this.setState({isAutoplayHistory: !isAutoplayHistory});
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

    this.createExportedMatrix = this.createExportedMatrix.bind(this);
    this.handleImportMatrix = this.handleImportMatrix.bind(this);

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
    const exportMatrixString = this.createExportedMatrix();
    this.setState({
      showModal: true,
      ModalContent: () => (<ExportModal value={exportMatrixString} />),
    });
  }
  /**
   * @returns {String}
   */
  createExportedMatrix() {
    const {mapMatrix} = this.props;

    const {selectedExportType} = this.state;
    const useTileName = selectedExportType === 'EXPORT_TILE_STRING';

    let exportString = '[';

    mapMatrix.forEach((matrixRow, rowIdx) => {
      exportString += '[';

      matrixRow.forEach((tileData, colIdx) => {
        if (tileData === undefined) {
          exportString += null;
        } else {
          exportString += useTileName ? TILE_TYPES_NAME[tileData] : tileData;
        }

        if (colIdx < matrixRow.length - 1) {
          exportString += ', ';
        }
      });

      exportString += ']';
      if (rowIdx < mapMatrix.length - 1) {
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
      ModalContent: () => (<ImportModal onClickModalSubmit={this.handleImportMatrix} />),
    });
  }
  /**
   *
   */
  handleImportMatrix(matrixText) {
    const parseResult = JSON.parse(matrixText);
    if (!Array.isArray(parseResult)) {
      console.error('Did not import a 2D Array');
      return;
    }

    this.props.onNewMatrix(parseResult);
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
          placeholder='I want a Matrix'
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
