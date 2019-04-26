import {
  TILE_TYPES,
  FOG_TYPES,
  isWalkableTile,
  isLessLit,
} from 'constants.shared/tileTypes';

import * as matrixUtils from 'utilities.shared/matrixUtils';

/**
 * @todo - refactor
 *
 * @param {MapModel} fogMapModel
 * @param {MapModel} tileMapModel
 * @param {Point} startPoint
 */
export function updateFogPointToVisible(fogMapModel, tileMapModel, startPoint) {
  const nearbyPoints = tileMapModel.getPointsWithinPathDistance(startPoint, 3);
  nearbyPoints.forEach((nearbyFogPoint) => {
    // if already fully visibile, do nothing
    const existingFogType = fogMapModel.getTileAt(nearbyFogPoint);
    if (existingFogType === FOG_TYPES.VISIBLE) {
      return;
    }

    // get the visibility level based on the distance
    const getPotentialFogType = (distance) => {
      if (tileDistance === 1) {
        return FOG_TYPES.DIM;
      }

      if (tileDistance === 2) {
        return FOG_TYPES.DIMMER;
      }

      if (tileDistance === 3) {
        return FOG_TYPES.DIMMEST;
      }

      return FOG_TYPES.HIDDEN;
    };

    // find what FogType this can be
    const tileDistance = matrixUtils.getDistanceBetween(startPoint, nearbyFogPoint);
    const potentialFogType = getPotentialFogType(tileDistance);

    // don't replace fog if this would be less lit than what's already there
    if (isLessLit(potentialFogType, existingFogType)) {
      return;
    }

    // update it
    fogMapModel.setTileAt(nearbyFogPoint, potentialFogType);
  });
}
