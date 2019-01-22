import * as THREE from 'three';
import {
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
import {
  createPlayerMesh,
  createTileMesh,
  createHouseMesh,
  createSpecialMesh
} from 'geometry/threeGeometry.js';
import { initInput } from 'helpers/input';
import { gamestate } from 'managers/eventManager';
import consoleLog from 'helpers/debug';
import map from 'data/map.json';

// Variable declaration

// Browser
let width = window.innerWidth;
let height = window.innerHeight;

// Three
let screen;
let sceneThree;
let camera;
let renderer;
let lights;

// Game
let currentFocus;
var currentPlayer;
let players;
let tiles;
let houses;
let specials;

// Animation
let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

// Init Game
screen = initScreen();

// Functions
function initScreen() {
  initScene();
  initGame();
  render();
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
  camera = new THREE.OrthographicCamera( width/-2, width/2, height / 2, height / -2, 0.1, 10000 );
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
    antialias: RENDERER.ANTIALIAS
  });

  renderer.shadowMap.enabled = RENDERER.SHADOW_MAP_ENABLED;
  renderer.shadowMap.type = RENDERER.SHADOW_MAP_TYPE;
  renderer.setSize( RENDERER.SIZE_X, RENDERER.SIZE_Y );
  renderer.setClearColor(SCENE.BACKGROUND_COLOR);
  document.body.appendChild( renderer.domElement );
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
function initGame() {
  players = initPlayers();

  players.forEach(function(player) {
    sceneThree.add(player);
  });

  previousTimestamp = null;
  startMoving = false;

  currentPlayer.position.set(SCENE.ORIGIN_POS.x, SCENE.ORIGIN_POS.y, PLAYER.POSITION_HEIGHT);
  initInput();
}
function initPlayers(playerIds = [1]) {
  let players = [];
  playerIds.forEach(function(playerId) {
    players.push(new player(playerId));
  });
  currentFocus = players[0];
  currentPlayer = players[0];
  return players;
}
function player(playerId) {
  const player = new THREE.Group();
  player.playerId = playerId;
  player.pos = { x: 0 , y: 0 };
  player.moves = [];
  const playerMesh = createPlayerMesh();
  player.add(playerMesh);
  return player;
}
function generateTiles() {
  tiles = {};
  houses = {};
  specials = {};
  consoleLog(false, ['map: ', map]);
  map.mapData.forEach(function(row, y) {
    row.forEach(function(col, x) {
      if (col > 0) {
        let xVal = x - Math.ceil(row.length/2);
        let yVal = Math.ceil(map.mapData.length/2) - y;
        console.log(x, Math.ceil(row.length/2), y,  Math.ceil(map.mapData.length/2));
        console.log({ x: xVal, y: yVal }, map.mapData.length, row.length);
        addTile({ x: xVal, y: yVal });

        if (col == 2) {
          addHouse({ x: xVal, y: yVal });
        }
        if (col == 3) {
          addSpecial({ x: xVal, y: yVal });
        }
      }
    });
  });
  // addTile(SCENE.ORIGIN_POS);
  return tiles;
}
function addTile(pos) {
  let tile = new Tile(pos);
  tile.position.z = 1.5*SCENE.ZOOM;
  tile.position.x = pos.x*(TILES.TILE_SIZE*2);
  tile.position.y = pos.y*(TILES.TILE_SIZE*2);
  sceneThree.add(tile);
  tiles['x' + pos.x + 'y' + pos.y] = tile;
  sceneThree.add(tile);
  return tile;
}
function Tile(pos, dir, type) {
  const tile = new THREE.Group();
  tile.pos = pos;
  const tileMesh = createTileMesh();
  tile.add(tileMesh);
  return tile;
}
function addHouse(pos) {
  let house = new House(pos);
  house.position.z = 1.5*SCENE.ZOOM;
  house.position.x = pos.x*(TILES.TILE_SIZE*2);
  house.position.y = pos.y*(TILES.TILE_SIZE*2);
  sceneThree.add(house);
  houses['x' + pos.x + 'y' + pos.y] = house;
  sceneThree.add(house);
  return house;
}
function House(pos, dir, type) {
  const house = new THREE.Group();
  house.pos = pos;
  const houseMesh = createHouseMesh();
  house.add(houseMesh);
  return house;
}
function addSpecial(pos) {
  let special = new Special(pos);
  special.position.z = 3*SCENE.ZOOM;
  special.position.x = pos.x*(TILES.TILE_SIZE*2);
  special.position.y = pos.y*(TILES.TILE_SIZE*2);
  sceneThree.add(special);
  specials['x' + pos.x + 'y' + pos.y] = special;
  sceneThree.add(special);
  return special;
}
function Special(pos, dir, type) {
  const special = new THREE.Group();
  special.pos = pos;
  const specialMesh = createSpecialMesh();
  special.add(specialMesh);
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
  consoleLog(false, ["finalPosition: ", finalPosition]);

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
      const moveDeltaTime = timestamp - stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*TILES.TILE_SIZE*SCENE.ZOOM;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/ANIMATION.STEP_TIME,1)*Math.PI)*12*SCENE.ZOOM+PLAYER.POSITION_HEIGHT;
      switch(currentPlayer.moves[0]) {
          case TILE_DIRECTIONS.FORWARD: {
              currentPlayer.position.y = currentPlayer.pos.y*TILES.TILE_SIZE*SCENE.ZOOM + moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y + currentFocus.pos.y*TILES.TILE_SIZE*SCENE.ZOOM + moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.BACKWARD: {
              currentPlayer.position.y = currentPlayer.pos.y*TILES.TILE_SIZE*SCENE.ZOOM - moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.y = CAMERA.INITIAL_CAMERA_POSITION_Y + currentFocus.pos.y*TILES.TILE_SIZE*SCENE.ZOOM - moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.LEFT: {
              currentPlayer.position.x = currentPlayer.pos.x*TILES.TILE_SIZE*SCENE.ZOOM - moveDeltaDistance; // initial player position is 0
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X + currentFocus.pos.x*TILES.TILE_SIZE*SCENE.ZOOM - moveDeltaDistance;
              break;
          }
          case TILE_DIRECTIONS.RIGHT: {
              currentPlayer.position.x = currentPlayer.pos.x*TILES.TILE_SIZE*SCENE.ZOOM + moveDeltaDistance;
              currentPlayer.position.z = jumpDeltaDistance;
              camera.position.x = CAMERA.INITIAL_CAMERA_POSITION_X + currentFocus.pos.x*TILES.TILE_SIZE*SCENE.ZOOM + moveDeltaDistance;
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
  renderer.render(sceneThree, camera);
}