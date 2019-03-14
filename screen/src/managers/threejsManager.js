import * as THREE from 'three';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  CAMERA,
  SCENE,
  RENDERER,
  TILES,
  HEMI_LIGHT,
  DIR_LIGHT,
  BACK_LIGHT,
  TILE_DIRECTIONS,
  PLAYER,
  ANIMATION
} from 'constants/three.js';
import * as threeGeometry from 'geometry/threeGeometry.js';
import { FOG_TYPES, TILE_TYPES, isWalkableTile } from 'constants/tileTypes';
import { initInput } from 'helpers/input';
import * as connectionManager from 'managers/connectionManager';

// Variable declaration
let htmlContainer;

// Three
let sceneThree;
let camera;
let renderer;
let lights;

// Game
let currentFocus;
var currentPlayer; // TODO rename to character?
let players;
let tiles = {};
let houses = {};
let specials = {};

// Animation
let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

// Functions
export function initScreen() {
  htmlContainer = document.getElementById('canvas-container');

  // temporary implementation
  const socket = connectionManager.socket;
  socket.on('GAMESTATE_UPDATE', (gamestate) => {
    console.log('GAMESTATE_UPDATE');
    // if first time, create a new game
    if (sceneThree === undefined) {
      initGame(gamestate);
      return;
    }

    // update tiles
    generateTiles(gamestate.tileMapModel.matrix, gamestate.fogMapModel.matrix);
  });
}

function initScene() {
  sceneThree = new THREE.Scene();

  camera = initCamera();
  renderer = initRenderer();
  lights = initLights();

  sceneThree.add(lights.hemiLight)
  sceneThree.add(lights.dirLight);
  sceneThree.add(lights.backLight);

  const scene = {
    scene: sceneThree,
    camera: camera,
    renderer: renderer,
    hemiLight: lights.hemiLight,
    dirLight: lights.dirLight,
    backLight: lights.backLight
  }
  return scene;
}
function render() {
  requestAnimationFrame(animate);
}

function initCamera() {
  camera = new THREE.OrthographicCamera( GAME_WIDTH/-2, GAME_WIDTH/2, GAME_HEIGHT / 2, GAME_HEIGHT / -2, 0.1, 10000 );
  camera.rotation.x = CAMERA.CAMERA_ROTATION_X;
  camera.rotation.y = CAMERA.CAMERA_ROTATION_Y;
  camera.rotation.z = CAMERA.CAMERA_ROTATION_Z;
  camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y;
  camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X;
  camera.position.z = CAMERA.DISTANCE;
  return camera;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({
    alpha: RENDERER.APLHA,
    antialias: RENDERER.ANTIALIAS,
  });

  renderer.shadowMap.enabled = RENDERER.SHADOW_MAP_ENABLED;
  renderer.shadowMap.type = RENDERER.SHADOW_MAP_TYPE;
  renderer.setSize( RENDERER.SIZE_X, RENDERER.SIZE_Y );
  renderer.setClearColor(SCENE.BACKGROUND_COLOR);
  renderer.domElement.style = 'border: 5px solid gray;';

  htmlContainer.appendChild(renderer.domElement);
  return renderer;
}
function initLights() {
  let hemiLight = new THREE.HemisphereLight(HEMI_LIGHT.SKY_COLOR, HEMI_LIGHT.GROUND_COLOR, HEMI_LIGHT.INTESITY);

  let dirLight = new THREE.DirectionalLight(DIR_LIGHT.COLOR, DIR_LIGHT.INTESITY);
  dirLight.position.copy(DIR_LIGHT.POSITION);
  dirLight.castShadow = DIR_LIGHT.CAST_SHADOW;

  dirLight.shadow.mapSize.width = DIR_LIGHT.SHADOW_MAP_SIZE_WIDTH;
  dirLight.shadow.mapSize.height = DIR_LIGHT.SHADOW_MAP_SIZE_HEIGHT;
  dirLight.shadow.camera.left = - DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.right = DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.top = DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.bottom = - DIR_LIGHT.SHADOW_CAMERA_VALUE;

  let backLight = new THREE.DirectionalLight(BACK_LIGHT.COLOR, BACK_LIGHT.INTESITY);
  backLight.position.copy(BACK_LIGHT.POSITION);
  backLight.castShadow = BACK_LIGHT.CAST_SHADOW;

  lights = {
    hemiLight: hemiLight,
    dirLight: dirLight,
    backLight: backLight,
  }
  return lights;
}
/**
 * start up game for the first time (?)
 */
function initGame(gamestate) {
  const {
    characters,
    fogMapModel,
    tileMapModel,
  } = gamestate;

  initInput();
  initScene();

  // create tiles
  generateTiles(tileMapModel.matrix, fogMapModel.matrix);

  players = characters.map(function(character) {
    const newPlayer = new Player(character.id, character.position);
    sceneThree.add(newPlayer);
    return newPlayer;
  });
  currentFocus = players[0];
  currentPlayer = players[0];

  startMoving = false;
  previousTimestamp = null;

  if (currentFocus) {
    moveCameraTo(currentFocus.position);
  }

  render();
}
function Player(playerId, position) {
  const playerObject = new THREE.Group();
  playerObject.playerId = playerId;
  playerObject.pos = position;
  const worldPos = convertMapPositionToWorldPosition(position);
  playerObject.position.set(worldPos.x, worldPos.y * -1, PLAYER.POSITION_HEIGHT);
  playerObject.moves = [];
  const playerMesh = threeGeometry.createPlayerMesh();
  playerObject.add(playerMesh);
  return playerObject;
}
/**
 *
 * @param {Matrix} mapMatrix
 * @param {Matrix} fogMatrix
 */
function generateTiles(mapMatrix, fogMatrix) {
  mapMatrix.forEach(function(row, y) {
    row.forEach(function(mapTile, x) {
      const mapPos = { x, y };
      const fogType = fogMatrix[y][x];
      const isHidden = fogType === FOG_TYPES.HIDDEN;

      // add a "blank" tile if hidden,
      // but don't add additional entities if hidden
      if (isHidden) {
        handleAddTile({
          fogType: fogType,
          mapPos: mapPos,
          tileType: mapTile,
        });
        return;
      }

      // add a tile if it is walkable
      if (isWalkableTile(mapTile)) {
        handleAddTile({
          fogType: fogType,
          mapPos: mapPos,
          tileType: mapTile,
        });
      }

      // add things on top of the tiles
      if (mapTile === TILE_TYPES.HOUSE) {
        addHouse(mapPos);
      }
      if (mapTile === TILE_TYPES.SPECIAL) {
        addSpecial(mapPos);
      }
    });
  });
}
/**
 * TODO - this can be its own class in its own file
 * @typedef Tile
 *
 * @param {Object} options
 * @returns Tile
 */
function handleAddTile(options) {
  const {
    fogType,
    mapPos,
    tileType,
  } = options;

  // if a Tile is already at this Point
  const existingTile = getTileObjectAtMapPos(mapPos);
  if (existingTile) {
    // and it is of the exact same tileType and visibility,
    // we don't have to add a tile or anything
    if (existingTile.tileType === tileType && existingTile.fogType === fogType) {
      return;
    }

    // otherwise, we need to remove it from the cache and scene
    handleRemoveTile(existingTile);
  }

  // create a new tile
  const tile = new Tile(options);
  tiles[tile._id] = tile;
  sceneThree.add(tile);
  return tile;
}
/**
 * TODO - this can be its own class in its own file
 * @typedef Tile
 *
 * @param {Object} options
 * @returns Tile
 */
function Tile(options) {
  const {
    fogType,
    mapPos,
    tileType,
  } = options;

  const tile = new THREE.Group();
  tile.fogType = fogType;
  tile.tileType = tileType;

  // positioning
  tile.mapPos = mapPos;
  const worldPos = convertMapPositionToWorldPosition(mapPos);
  tile.position.z = 1.5*SCENE.ZOOM;
  tile.position.x = worldPos.x;
  tile.position.y = worldPos.y * -1; // invert because Positive is Up for ThreeJS

  // determine mesh color based on type
  switch(fogType) {
    case FOG_TYPES.PARTIAL:
      tile.add(threeGeometry.createPartialTileMesh());
      break;
    case FOG_TYPES.HIDDEN:
      tile.add(threeGeometry.createHiddenTileMesh());
      break;
    case FOG_TYPES.VISIBLE:
    default:
      tile.add(threeGeometry.createTileMesh());
      break;
  }

  tile._id = makePointId(mapPos);
  return tile;
}
function addHouse(pos) {
  let house = new House(pos);
  house.position.z = 1.5*SCENE.ZOOM;
  house.position.x = pos.x*(TILES.TILE_SIZE*2);
  house.position.y = pos.y*(TILES.TILE_SIZE*2);
  sceneThree.add(house);
  houses[house._id] = house;
  sceneThree.add(house);
  return house;
}
function House(mapPos, dir, type) {
  const house = new THREE.Group();
  house.mapPos = mapPos;
  const houseMesh = threeGeometry.createHouseMesh();
  house.add(houseMesh);
  house._id = makePointId(mapPos); // todo change, its not good
  return house;
}
function addSpecial(pos) {
  let special = new Special(pos);
  special.position.z = 3*SCENE.ZOOM;
  special.position.x = pos.x*(TILES.TILE_SIZE*2);
  special.position.y = pos.y*(TILES.TILE_SIZE*2);
  sceneThree.add(special);
  specials[special._id] = special;
  sceneThree.add(special);
  return special;
}
function Special(mapPos, dir, type) {
  const special = new THREE.Group();
  special.mapPos = mapPos;
  const specialMesh = threeGeometry.createSpecialMesh();
  special.add(specialMesh);
  special._id = makePointId(mapPos); // todo change, its not good
  return special;
}
export function move(direction) {
  currentPlayer.moves.push(direction);
  const finalPosition = currentPlayer.moves.reduce((position, move) => {
      if(move === TILE_DIRECTIONS.FORWARD) return {x: position.x, y: position.y+1};
      if(move === TILE_DIRECTIONS.BACKWARD) return { x: position.x, y: position.y-1};
      if(move === TILE_DIRECTIONS.LEFT) return {x: position.x-1, y: position.y};
      if(move === TILE_DIRECTIONS.RIGHT) return { x: position.x+1, y: position.y};
  }, { x: currentPlayer.pos.x, y: currentPlayer.pos.y});
  let targetTile = tiles['x' + finalPosition.x + 'y' + finalPosition.y];

  if (direction === TILE_DIRECTIONS.FORWARD) {
    if (!stepStartTimestamp) startMoving = true;
  }
  else if (direction === TILE_DIRECTIONS.BACKWARD) {
    if (!stepStartTimestamp) startMoving = true;
  }
  else if (direction === TILE_DIRECTIONS.LEFT) {
    if (!stepStartTimestamp) startMoving = true;
  }
  else if (direction === TILE_DIRECTIONS.RIGHT) {
    if(!stepStartTimestamp) startMoving = true;
  }
  if (!targetTile) {
    // addTile(finalPosition, direction);
  }
}
function animate(timestamp) {
  requestAnimationFrame(animate);
  if(!previousTimestamp) {
    previousTimestamp = timestamp;
  }
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  if(startMoving) {
      stepStartTimestamp = timestamp;
      startMoving = false;
  }

  if(stepStartTimestamp) {
      const playerWorldPos = convertMapPositionToWorldPosition({
        x: currentPlayer.pos.x,
        y: currentPlayer.pos.y * -1,
      });
      const moveDeltaTime = timestamp - stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*TILES.TILE_SIZE*SCENE.ZOOM;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*Math.PI)*12*SCENE.ZOOM+PLAYER.POSITION_HEIGHT;
      switch(currentPlayer.moves[0]) {
          case TILE_DIRECTIONS.FORWARD: {
              currentPlayer.position.y = playerWorldPos.y + moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              moveCameraTo(currentFocus.position);
              break;
          }
          case TILE_DIRECTIONS.BACKWARD: {
              currentPlayer.position.y = playerWorldPos.y - moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              moveCameraTo(currentFocus.position);
              break;
          }
          case TILE_DIRECTIONS.LEFT: {
              currentPlayer.position.x = playerWorldPos.x - moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              moveCameraTo(currentFocus.position);
              break;
          }
          case TILE_DIRECTIONS.RIGHT: {
              currentPlayer.position.x = playerWorldPos.x + moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              moveCameraTo(currentFocus.position);
              break;
          }
      }
      // Once a step has ended
      if(moveDeltaTime > ANIMATION.STEP_TIME) {
          switch(currentPlayer.moves[0]) {
              case TILE_DIRECTIONS.FORWARD: {
                  currentPlayer.pos.y--; // invert because Positive is Up for ThreeJS
                  break;
              }
              case TILE_DIRECTIONS.BACKWARD: {
                  currentPlayer.pos.y++; // invert because Positive is Up for ThreeJS
                  break;
              }
              case TILE_DIRECTIONS.LEFT: {
                  currentPlayer.pos.x--;
                  break;
              }
              case TILE_DIRECTIONS.RIGHT: {
                  currentPlayer.pos.x++;
                  break;
              }
          }
          currentPlayer.moves.shift();
          // If more steps are to be taken then restart counter otherwise stop stepping
          stepStartTimestamp = currentPlayer.moves.length === 0 ? null : timestamp;
      }
  }
  renderer.render(sceneThree, camera);
}
/**
 * @param {Point} point
 * @returns {Point}
 */
function convertMapPositionToWorldPosition(point) {
  return {
    x: point.x * (TILES.TILE_SIZE * SCENE.ZOOM),
    y: point.y * (TILES.TILE_SIZE * SCENE.ZOOM),
  }
}
/**
 * I have no idea what the actual calculation should be so I just made it whatever looked right
 * todo: z axis?
 *
 * @param {Point} position
 * @returns {Point}
 */
function moveCameraTo(position) {
  camera.position.x = position.x + (TILES.TILE_SIZE * SCENE.ZOOM * 3);
  camera.position.y = position.y - (TILES.TILE_SIZE * SCENE.ZOOM * 6);
}
/**
 * I have no idea what the actual calculation should be so I just made it whatever looked right
 * todo: z axis?
 *
 * @param {Tile} tile
 * @returns {String}
 */
function makePointId(point) {
  return `point-${point.x}-${point.y}-id`;
}
/**
 * @param {Point} point
 * @returns {Tile | undefined}
 */
function getTileObjectAtMapPos(point) {
  const pointId = makePointId(point);
  return tiles[pointId];
  // const tileKeys = Object.keys(tiles);
  // tileKeys.forEach((tileKey) => {
  //   const tile = tiles[tileKey];
  //   if (tile.mapPos.x === point.x && tile.mapPos.y === point.y) {
  //     console.log('getTileObjectAtMapPos match!', tile.mapPos, point);
  //     return tile;
  //   }
  // });
}
/**
 * TODO this is overloaded and can be improved for removing the other entities
 *
 * @param {Tile} tile
 */
function handleRemoveTile(tile) {
  const pointId = tile._id;
  sceneThree.remove(tile);
  tiles[pointId] = null;

  const houseObj = houses[pointId];
  if (houseObj) {
    sceneThree.remove(tile);
    houses[pointId] = null;
  }

  const specialObj = specials[pointId];
  if (specialObj) {
    sceneThree.remove(tile);
    specials[pointId] = null;
  }
}
