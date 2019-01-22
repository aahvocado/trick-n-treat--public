import React, { Component } from 'react';

import * as connectionManager from 'managers/connectionManager';

/**
 * page for testing
 */
export class DebugPage extends Component {
  /** @default */
  constructor(props) {
    super(props);

    this.state = {
      debug_gamestate: {
        tileMapModel: {
          matrix: [[]]
        },
        mapDataModel: {
          matrix: [[]]
        },
        users: [{}],
        characters: [{}],
      },
    }
  }
  /** @default */
  componentDidMount() {
    const socket = connectionManager.socket;

    // this design pattern is not the best, but serves for testing
    socket.on('GAMESTATE_UPDATE', (data) => {
      this.setState({debug_gamestate: data});
    });
  };
  /** @default */
  render() {
    const { debug_gamestate } = this.state;
    const {
      tileMapModel,
      mapDataModel,
      users,
      characters,
    } = debug_gamestate;

    const currentUser = users[0];
    const {
      canMoveLeft,
      canMoveRight,
      canMoveUp,
      canMoveDown,
      canTrick,
      canTreat,
    } = currentUser;

    return (
      <div className='bg-secondary flex-grow flex-centered flex-col width-full text-center'>
        <h2 className='pad-v-2 flex-none'>Debug Page</h2>

        <div className='pad-v-2 flex-none'>
          <DebugActionButton
            actionId='left'
            disabled={!canMoveLeft}
          >
            left
          </DebugActionButton>
          <DebugActionButton
            actionId='right'
            disabled={!canMoveRight}
          >
            Right
          </DebugActionButton>
          <DebugActionButton
            actionId='up'
            disabled={!canMoveUp}
          >
            Up
          </DebugActionButton>
          <DebugActionButton
            actionId='down'
            disabled={!canMoveDown}
          >
            Down
          </DebugActionButton>
          <DebugActionButton
            actionId='trick'
            disabled={!canTrick}
          >
            Can Trick
          </DebugActionButton>
          <DebugActionButton
            actionId='treat'
            disabled={!canTreat}
          >
            Can Treat
          </DebugActionButton>

        </div>

        <World
          mapMatrix={tileMapModel.matrix}
          dataMatrix={mapDataModel.matrix}
          characters={characters}
        />
      </div>
    )
  }
}
class DebugActionButton extends React.PureComponent {
  render() {
    const {
      disabled,
    } = this.props;

    return (
      <button
        className={`pad-2 bg-fourth sibling-mar-l-1 ${!disabled ? 'color-white' : 'color-black'}`}
        disabled={ disabled }
        onClick={this.handleActionOnClick.bind(this)}
      >
        { this.props.children }
      </button>
    )
  }

  handleActionOnClick() {
    connectionManager.socket.emit('USER_ACTION', this.props.actionId);
  }
}

const TILE_SIZE = '15px';
const TILE_TYPE_BG_COLOR = {
  '*': 'yellow', //'start',
  0: '#313131', //'empty',
  1: 'lightgreen', //'path',
  2: '#33c3ff', //'house',
  3: '#da5cff', //'special',
}
class World extends Component {
  render() {
    const { mapMatrix, dataMatrix, characters } = this.props;

    const isEmpty = mapMatrix.length <= 0 || mapMatrix[0].length <= 0;
    if (isEmpty) {
      return <div className='pad-2'>(waiting for map data)</div>
    }

    return (
      <div className='flex-col-centered position-relative mar-v-2 mar-h-auto bor-4-primary'>
        { mapMatrix.map((innerMatrix, row) => {
          return (
            <div className='flex-row' key={`row-${row}-key`} >
              { innerMatrix.map((tileType, col) => {
                return (
                  <Tile
                    key={`tile-${col}-${row}-key`}
                    tileType={tileType}
                    tileData={dataMatrix[row][col]}
                    characters={characters}
                    pos={{row, col}}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }
}
class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    }
  }
  render() {
    const { tileType, pos } = this.props;
    const { isFocused } = this.state;
    // const isEmpty = tileType === 0;
    const charactersHere = this.getCharactersHere();
    const characterDisplay = charactersHere.length > 1 ? `[${charactersHere.length}]` : (charactersHere[0] && charactersHere[0].name[0]);

    const modifierStyles = {
      backgroundColor: TILE_TYPE_BG_COLOR[tileType],
      borderColor: charactersHere.length ? '3px solid white' : '',
    }

    return (
      <div
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          boxSizing: 'border-box',
          ...modifierStyles,
        }}
        onMouseEnter={this.handleOnMouseEnter.bind(this)}
        onMouseLeave={this.handleOnMouseLeave.bind(this)}
      >
        { isFocused &&
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              pointerEvents: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '4px',
              color: 'white',
            }}
          >
            {`${pos.col}, ${pos.row}`}
          </span>
        }

        <span className='color-white text-stroke'>
          { characterDisplay }
        </span>
      </div>
    )
  }
  handleOnMouseEnter() {
    this.setState({ isFocused: true })
  }
  handleOnMouseLeave() {
    this.setState({ isFocused: false })
  }
  getCharactersHere() {
    const { characters, pos } = this.props;
    const charactersHere = characters.map((character) => {
      if (character) {
        const characterPos = character.position;
        if (characterPos.x === pos.col && characterPos.y === pos.row) {
          return character;
        }
      }
      return null;
    });

    return charactersHere.filter(Boolean);
  }
}

export default DebugPage;
