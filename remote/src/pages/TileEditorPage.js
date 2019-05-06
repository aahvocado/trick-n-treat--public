import React, { Component, Fragment, PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import Point from '@studiomoniker/point';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';
import CheckboxComponent from 'common-components/CheckboxComponent';
import TextInputComponent from 'common-components/TextInputComponent';
import ModalComponent from 'common-components/ModalComponent';
import RadioButtonComponent from 'common-components/RadioButtonComponent';

import {TileItemComponent} from 'components/TileMapComponent';

import {
  TILE_TYPES,
  TILE_TYPES_NAME,
  FOG_TYPES,
} from 'constants.shared/tileTypes';

import remoteAppState from 'state/remoteAppState';

import debounce from 'utilities/debounce';
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

      this.state = {
        selectedEditorTile: 'GRASS_EDITOR_TILE',
        focusedTile: new Point(-1, -1),
        mapMatrix: matrixUtils.createMatrix(10, 10, null),
        mapWidth: 10,
        mapHeight: 10,
        tileSize: 40,
      }
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
        mapMatrix,
        mapWidth,
        mapHeight,
        selectedEditorTile,
        tileSize,
      } = this.state;

      return (
        <div className='flex-center flex-col color-white bg-primary'>
          <h2 className='bg-secondary fsize-4 pad-v-1 width-full text-center'>Tile Editor</h2>

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
                className='flex-auto flex-col aitems-center position-relative bor-4-primary'
                style={{
                  overflow: 'hidden',
                  backgroundColor: '#d2d2d2',
                }}
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
                            fogType={FOG_TYPES.VISIBLE}
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
  }
)
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
          className='sibling-mar-t-3 width-full flex-row flex-wrap-yes'
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

        <FontAwesomeIcon className='sibling-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Map options */}
        <form
          className='sibling-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <TextInputComponent
            value={mapWidth}
            onChange={this.onChangeWidthValue}
          >
            <span className='mar-h-1 flex-grow-only color-white opacity-7'>Width</span>
          </TextInputComponent>

          <TextInputComponent
            value={mapHeight}
            onChange={this.onChangeHeightValue}
          >
            <span className='mar-h-1 flex-grow-only color-white opacity-7'>Height</span>
          </TextInputComponent>

          <TextInputComponent
            value={tileSize}
            onChange={this.onChangeTileSizeValue}
          >
            <span className='mar-h-1 flex-grow-only color-white opacity-7'>Tile Size</span>
          </TextInputComponent>
        </form>

        <FontAwesomeIcon className='sibling-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Export options */}
        <form
          className='sibling-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <RadioButtonComponent
            className='fsize-3 sibling-mar-t-2'
            checked={selectedExportType === 'EXPORT_TILE_ID'}
            value='EXPORT_TILE_ID'
            onChange={this.onChangeExportType}
          >
            export with Tile ID
          </RadioButtonComponent>

          <RadioButtonComponent
            className='fsize-3 sibling-mar-t-2'
            checked={selectedExportType === 'EXPORT_TILE_STRING'}
            value='EXPORT_TILE_STRING'
            onChange={this.onChangeExportType}
          >
            export with Tile Name
          </RadioButtonComponent>

          <ClassicButtonComponent
            className='sibling-mar-t-2'
            onClick={this.onExportClick}
          >
            Export
          </ClassicButtonComponent>
        </form>

        <FontAwesomeIcon className='sibling-mar-t-3 fsize-2 color-tertiary' icon={faCircle} />

        {/* Import options */}
        <form
          className='sibling-mar-t-3 width-full flex-col'
          onSubmit={e => e.preventDefault()}
        >
          <ClassicButtonComponent
            className='sibling-mar-t-3'
            onClick={this.onImportClick}
          >
            Import
          </ClassicButtonComponent>
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
          className='color-black pad-2 width-full height-full box-sizing-border bor-1-gray'
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
          className='color-black pad-2 width-full height-full box-sizing-border bor-1-gray'
          placeholder='I want a Matrix'
          onChange={this.handleOnChangeTextarea.bind(this)}
        />

        <ClassicButtonComponent
          className='mar-t-2'
          onClick={this.onClickSubmit.bind(this)}
        >
          Submit
        </ClassicButtonComponent>
      </Fragment>
    )
  }
  /**
   *
   */
  handleOnChangeTextarea(e) {
    this.setState({value: e.target.value});
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
