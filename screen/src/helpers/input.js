import { move } from 'managers/threejsManager';
import { TILE_DIRECTIONS } from 'constants/three.js';

export function initInput() {
  window.addEventListener("keydown", event => {
    if (event.keyCode == '38') {
        // up arrow
        move(TILE_DIRECTIONS.FORWARD);
    }
    else if (event.keyCode == '40') {
        // down arrow
        move(TILE_DIRECTIONS.BACKWARD);
    }
    else if (event.keyCode == '37') {
      // left arrow
      move(TILE_DIRECTIONS.LEFT);
    }
    else if (event.keyCode == '39') {
      // right arrow
      move(TILE_DIRECTIONS.RIGHT);
    }
  });
}