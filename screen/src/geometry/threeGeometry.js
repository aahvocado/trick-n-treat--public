import * as THREE from 'three';
import {
  SCENE,
  TILES,
  PLAYER,
  HOUSE,
  SPECIAL
} from 'constants/three.js';

export function createPlayerMesh() {
  const playerMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( PLAYER.SIZE*SCENE.ZOOM, PLAYER.SIZE*SCENE.ZOOM, 20*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: PLAYER.COLOR } )
  );
  playerMesh.position.z = PLAYER.POSITION_HEIGHT;
  playerMesh.castShadow = PLAYER.CAST_SHADOW;
  playerMesh.receiveShadow = PLAYER.RECEIVE_SHADOW;
  return playerMesh;
}
export function createTileMesh() {
  const tileMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_HEIGHT*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: TILES.COLOR } )
  );
  tileMesh.position.z = TILES.POSITION_HEIGHT;
  tileMesh.castShadow = TILES.CAST_SHADOW;
  tileMesh.receiveShadow = TILES.RECEIVE_SHADOW;
  return tileMesh;
}
export function createHouseMesh() {
  const tileMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( HOUSE.HOUSE_SIZE*SCENE.ZOOM, HOUSE.HOUSE_SIZE*SCENE.ZOOM, HOUSE.HOUSE_SIZE*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: HOUSE.COLOR } )
  );
  tileMesh.position.z = HOUSE.POSITION_HEIGHT;
  tileMesh.castShadow = HOUSE.CAST_SHADOW;
  tileMesh.receiveShadow = HOUSE.RECEIVE_SHADOW;
  return tileMesh;
}
export function createSpecialMesh() {
  const tileMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry( TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_SIZE*SCENE.ZOOM, TILES.TILE_HEIGHT*SCENE.ZOOM ),
    new THREE.MeshPhongMaterial( { color: SPECIAL.COLOR } )
  );
  tileMesh.position.z = SPECIAL.POSITION_HEIGHT;
  tileMesh.castShadow = SPECIAL.CAST_SHADOW;
  tileMesh.receiveShadow = SPECIAL.RECEIVE_SHADOW;
  return tileMesh;
}