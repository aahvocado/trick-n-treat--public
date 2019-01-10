import * as THREE from 'three';
import * as _ from 'lodash';
import {
  CAMERA,
  SCENE,
  RENDERER,
  TILES,
  HEMI_LIGHT,
  DIR_LIGHT,
  BACK_LIGHT,
  TILES_SIDES,
  TILE_DIRECTIONS,
  TILE_REVERSE_DIRECTIONS,
  PLAYER,
  ANIMATION

} from 'constants/three.js';
import consoleLog from 'debug/debug';
import { initInput } from 'input/input';
import { add } from '../helpers/utilities';

// Variable declaration
const scene = initScene();

let players;
let tiles;
let camera;
let lights;

let currentFocus;
var currentPlayer;

let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

// Init Game

// Functions
function initScreen() {
  initScene();
  initGame();
  requestAnimationFrame( animate );
}

function initScene() {
  const sceneThree = new THREE.Scene();

  camera = new THREE.Camera();
  configureCamera();
  const renderer = initRenderer();
  lights = initLights();

  sceneThree.add(lights.hemiLight)
  sceneThree.add(lights.dirLight);
  sceneThree.add(lights.backLight);
  // sceneThree.add(player);

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

function configureCamera() {
  camera.rotation.x = CAMERA.CAMERA_ROTATION_X;
  camera.rotation.y = CAMERA.CAMERA_ROTATION_X;
  camera.rotation.z = CAMERA.CAMERA_ROTATION_X;
  camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y;
  camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X;
  camera.position.z = CAMERA.DISTANCE;
}
function initRenderer() {
  const renderer = new THREE.WebGLRenderer({
    alpha: RENDERER.APLHA,
    antialias: RENDERER.ANTIALIAS
  });

  renderer.shadowMap.enabled = RENDERER;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize( RENDERER.SIZE_X, RENDERER.SIZE_Y );
  document.body.appendChild( renderer.domElement );
  return renderer;
}
function initLights() {
  const hemiLight = new THREE.HemisphereLight(HEMI_LIGHT.SKY_COLOR, HEMI_LIGHT.GROUND_COLOR, HEMI_LIGHT.INTESITY);

  const dirLight = new THREE.DirectionalLight(DIR_LIGHT.COLOR, DIR_LIGHT.INTESITY);
  dirLight.position.set(DIR_LIGHT.POSITION);
  dirLight.castShadow = DIR_LIGHT.CAST_SHADOW;

  dirLight.shadow.mapSize.width = DIR_LIGHT.SHADOW_MAP_SIZE_WIDTH;
  dirLight.shadow.mapSize.height = DIR_LIGHT.SHADOW_MAP_SIZE_HEIGHT;
  dirLight.shadow.camera.left = - DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.right = DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.top = DIR_LIGHT.SHADOW_CAMERA_VALUE;
  dirLight.shadow.camera.bottom = - DIR_LIGHT.SHADOW_CAMERA_VALUE;

  const backLight = new THREE.DirectionalLight(BACK_LIGHT.COLOR, BACK_LIGHT.INTESITY);
  backLight.position.set(BACK_LIGHT.POSITION);
  backLight.castShadow = BACK_LIGHT.CAST_SHADOW;

  lights = {
    hemiLight: hemiLight,
    dirLight: dirLight,
    backLight: backLight,
  }
  return lights;
}
function initGame() {
  tiles = generateTiles();
  // players = initPlayers();

  previousTimestamp = null;

  startMoving = false;
  stepStartTimestamp;

  // player.position.x = 0;
  // player.position.y = 0;

  camera.position.y = initialCameraPositionY;
  camera.position.x = initialCameraPositionX;

  initInput();
}
// function initPlayers(playerIds = [1]) {
//   let players = [];
//   _.each(playerIds, function(playerId) {
//     players.push(new player(playerId));
//   });
//   currentFocus = players[0];
//   currentPlayer = players[0];
//   return players;
// }
// function player(playerId) {
//   const player = new THREE.Group();
  // player.id = playerId;
  // player.pos = { x: 0 , y: 0 };
  // player.moves = [];
  // const playerMesh = createPlayerMesh();
  // player.add(playerMesh);
//   return player;
// }
function createPlayerMesh() {
  const playerMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( PLAYER.SIZE*SCENE.ZOOM, PLAYER.SIZE*SCENE.ZOOM, 20*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: PLAYER.COLOR, flatShading: PLAYER.FLAT_SHADING } )
  );
  playerMesh.position.z = PLAYER.POSITION_HEIGHT;
  playerMesh.castShadow = PLAYER.CAST_SHADOW;
  playerMesh.receiveShadow = PLAYER.RECEIVE_SHADOW;
  return playerMesh;
}
function generateTiles() {
  tiles = {};
  addTile(SCENE.ORIGIN_POS);
  return tiles;
}
function addTile(pos){
  let tile = new Tile(pos);
  tile.position.z = 1.5*SCENE.ZOOM;
  tile.position.x = pos.x*(TILES.TILE_SIZE*2);
  tile.position.y = pos.y*(TILES.TILE_SIZE*2);
  scene.add(tile);
  tiles['x' + pos.x + 'y' + pos.y] = tile;
  consoleLog(false, ['addTile() Tile: ', tile]);
  return tile;
}
function Tile(pos, dir, type) {
  const tile = new THREE.Group();
  tile.pos = pos;
  const tileMesh = createTileMesh();
  tile.add(body);
  return tile;
}
function createTileMesh() {
  const tileMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_HEIGHT*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: TILES.COLOR, flatShading: TILES.FLAT_SHADING } )
  );
  tileMesh.position.z = TILES.POSITION_HEIGHT;
  tileMesh.castShadow = TILES.CAST_SHADOW;
  tileMesh.receiveShadow = TILES.RECEIVE_SHADOW;
  return tile;
}
export function move(direction) {
  currentPlayer.moves.push(direction);
  const finalPosition = currentPlayer.moves.reduce((position, move) => {
      // consoleLog(false, ["reduce: ", position, move]);
      if(move === TILE_DIRECTIONS.FORWARD) return {x: position.x, y: position.y+1};
      if(move === TILE_DIRECTIONS.BACKWARD) return { x: position.x, y: position.y-1};
      if(move === TILE_DIRECTIONS.LEFT) return {x: position.x-1, y: position.y};
      if(move === TILE_DIRECTIONS.RIGHT) return { x: position.x+1, y: position.y};
  }, { x: currentPlayer.pos.x, y: currentPlayer.pos.y});
  let targetTile = tiles['x' + finalPosition.x + 'y' + finalPosition.y];
  // consoleLog(false, ['adjacent tiles: ', forward, right, backward, left, 'x' + (finalPosition.x-1) + 'y' + finalPosition.y]);
  consoleLog(false, ["finalPosition: ", finalPosition]);
  // consoleLog(false, ["playerPos: ", currentPlayer.pos]);
  // consoleLog(false, ["moves: ", moves]);

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
    addTile(finalPosition, direction);
  }
}
function animate(timestamp) {
  requestAnimationFrame( animate );

  if(!previousTimestamp) previousTimestamp = timestamp;
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  if(startMoving) {
      stepStartTimestamp = timestamp;
      startMoving = false;
  }

  if(stepStartTimestamp) {
      const moveDeltaTime = timestamp - stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*positionWidth*SCENE.ZOOM;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*Math.PI)*8*SCENE.ZOOM;
      switch(currentPlayer.moves[0]) {
          case TILE_DIRECTIONS.FORWARD: {
              currentPlayer.position.y = currentPlayer.pos.y*positionWidth*SCENE.ZOOM + moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y + currentFocus.pos.y*positionWidth*SCENE.ZOOM + moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.Backward: {
              currentPlayer.position.y = currentPlayer.pos.y*positionWidth*SCENE.ZOOM - moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y + currentFocus.pos.y*positionWidth*SCENE.ZOOM - moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.LEFT: {
              currentPlayer.position.x = currentPlayer.pos.x*positionWidth*SCENE.ZOOM - moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X + currentFocus.pos.x*positionWidth*SCENE.ZOOM - moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.RIGHT: {
              currentPlayer.position.x = currentPlayer.pos.x*positionWidth*SCENE.ZOOM + moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X + currentFocus.pos.x*positionWidth*SCENE.ZOOM + moveDeltaDistance;
              break;
          }
      }
      // Once a step has ended
      if(moveDeltaTime > ANIMATION.STEP_TIME) {
          switch(currentPlayer.moves[0]) {
              case TILE_DIRECTIONS.FORWARD: {
                  currentPlayer.pos.y++;
                  break;
              }
              case TILE_DIRECTIONS.BACKWARD: {
                  currentPlayer.pos.y--;
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
  renderer.render( scene, camera );
}
