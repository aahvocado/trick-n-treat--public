import React, { Component } from 'react';
import {observer} from 'mobx-react';

import {appStore} from 'data/remoteAppState';

import * as connectionManager from 'managers/connectionManager';

/**
 * page for testing
 */
class DebugPage extends Component {
  /** @override */
  constructor(props) {
    super(props);

    this.handleOnActionClick = this.handleOnActionClick.bind(this);
  }
  /** @override */
  render() {
    const { gamestate, userId } = this.props;
    if (gamestate === undefined) {
      return null;
    }

    const {
      tileMapModel,
      fogMapModel,
      users,
      characters,
    } = gamestate;

    const currentUser = users.find(user => (user.userId === userId));
    const {
      canMoveLeft,
      canMoveRight,
      canMoveUp,
      canMoveDown,
      canTrick,
      canTreat,
    } = currentUser;

    const currentCharacter = characters.find(character => (character.characterId === currentUser.characterId));
    const {
      candies,
      health = {},
    } = currentCharacter;

    return (
      <div className='bg-secondary flex-grow flex-centered flex-col width-full text-center'>
        <h2 className='pad-v-2 flex-none'>Debug Page</h2>

        <div className='pad-v-2 flex-none'>
          {`Health: ${health.value || 0}`}
        </div>
        <div className='pad-v-2 flex-none'>
          {`Candies: ${candies || 0}`}
        </div>

        <div className='pad-v-2 flex-none'>
          <DebugActionButton
            actionId='left'
            disabled={!canMoveLeft}
            onActionClick={this.handleOnActionClick}
          >
            left
          </DebugActionButton>
          <DebugActionButton
            actionId='right'
            disabled={!canMoveRight}
            onActionClick={this.handleOnActionClick}
          >
            Right
          </DebugActionButton>
          <DebugActionButton
            actionId='up'
            disabled={!canMoveUp}
            onActionClick={this.handleOnActionClick}
          >
            Up
          </DebugActionButton>
          <DebugActionButton
            actionId='down'
            disabled={!canMoveDown}
            onActionClick={this.handleOnActionClick}
          >
            Down
          </DebugActionButton>
          <DebugActionButton
            actionId='trick'
            disabled={!canTrick}
            onActionClick={this.handleOnActionClick}
          >
            Can Trick
          </DebugActionButton>
          <DebugActionButton
            actionId='treat'
            disabled={!canTreat}
            onActionClick={this.handleOnActionClick}
          >
            Can Treat
          </DebugActionButton>

        </div>

        <World
          mapMatrix={tileMapModel.matrix}
          fogMatrix={fogMapModel.matrix}
          characters={characters}
        />
      </div>
    )
  }
  handleOnActionClick(actionId) {
    connectionManager.socket.emit('USER_ACTION', {
      actionId: actionId,
      userId: this.props.userId,
    });
  }
}
const ObservingDebugPage = observer(() => {
  return (
    <DebugPage
      userId={appStore.userId}
      gamestate={appStore.gamestate}
    />
  )
});


class DebugActionButton extends React.PureComponent {
  render() {
    const {
      disabled,
    } = this.props;

    return (
      <button
        className={`pad-2 bg-fourth sibling-mar-l-1 ${!disabled ? 'color-white' : 'color-black'}`}
        disabled={ disabled }
        onClick={this.onActionDidClick.bind(this)}
      >
        { this.props.children }
      </button>
    )
  }

  onActionDidClick() {
    this.props.onActionClick(this.props.actionId);
  }
}

class World extends Component {
  render() {
    const {
      mapMatrix,
      fogMatrix,
      characters,
    } = this.props;

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
                    fogType={fogMatrix[row][col]}
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

const TILE_SIZE = '15px';
const TILE_TYPE_STYLES = {
  //'start',
  '*': { backgroundColor: 'yellow' },
  //'empty',
  0: { backgroundColor: '#313131' },
  //'path',
  1: { backgroundColor: 'lightgreen' },
  //'house',
  2: {
    backgroundColor: '#33c3ff',
    border: '1px solid #299fd0',
  },
  //'encounter',
  4: {
    backgroundColor: '#d0ffd0',
  },
  //'special',
  9: { backgroundColor: '#da5cff' },
}
const FOG_STYLES = {
  //'hidden',
  0: {
    opacity: 0,
  },
  //'visible',
  1: {},
  //'partial',
  2: {
    opacity: 0.5,
  },
}
class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    }
  }
  render() {
    const { fogType, tileType, pos } = this.props;
    const { isFocused } = this.state;
    const charactersHere = this.getCharactersHere();
    const characterDisplay = charactersHere.length > 1 ? `[${charactersHere.length}]` : (charactersHere[0] && charactersHere[0].name[0]);

    // make hidden tiles just look like empty tiles
    const isHidden = fogType === 0;
    const modifierStyles = isHidden ? TILE_TYPE_STYLES[0] : {
      ...TILE_TYPE_STYLES[tileType],
      ...FOG_STYLES[fogType],
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
              pointerEncounters: 'none',
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

export default ObservingDebugPage;
