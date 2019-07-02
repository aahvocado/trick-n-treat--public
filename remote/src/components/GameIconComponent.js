import React, {PureComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faCookie,
  faCube,
  faDice,
  faEye,
  faGrinTears,
  faHeartbeat,
  faKissBeam,
  faPlusSquare,
  faMapMarked,
  faRunning,
} from '@fortawesome/free-solid-svg-icons'

import {STAT_ID} from 'constants.shared/statIds';
import {TARGET_ID} from 'constants.shared/targetIds';

import combineClassNames from 'utilities/combineClassNames';

import * as statUtils from 'utilities.shared/statUtils';

/**
 * @param {StatId} statId
 * @returns {Font Awesome Icon}
 */
function getIconOfStat(statId) {
  if (statId === STAT_ID.HEALTH) {
    return faPlusSquare;
  }
  if (statId === STAT_ID.CANDIES) {
    return faCookie;
  }
  if (statId === STAT_ID.MOVEMENT) {
    return faRunning;
  }
  if (statId === STAT_ID.SANITY) {
    return faHeartbeat;
  }
  if (statId === STAT_ID.VISION) {
    return faEye;
  }
  if (statId === STAT_ID.LUCK) {
    return faDice;
  }
  if (statId === STAT_ID.GREED) {
    return faCrown;
  }
  if (statId === STAT_ID.TRICKY) {
    return faGrinTears;
  }
  if (statId === STAT_ID.TREATY) {
    return faKissBeam;
  }
  if (statId === STAT_ID.POSITION) {
    return faMapMarked;
  }
}
/**
 * @param {TargetId} targetId
 * @returns {Font Awesome Icon}
 */
function getIconOfTrigger(targetId) {
  if (targetId === TARGET_ID.ITEM.ALL) {
    return faCube;
  }

  const statId = statUtils.convertTargetToStat(targetId);
  if (statId !== undefined) {
    return getIconOfStat(statId);
  }
}
/**
 *
 */
export default class GameIconComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-none',
    /** @type {String} */
    className: '',
    /** @type {StatId | undefined} */
    statId: undefined,
    /** @type {TargetId | undefined} */
    targetId: undefined,
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      statId,
      targetId,
      ...otherProps
    } = this.props;

    const iconToUse = getIconOfStat(statId) || getIconOfTrigger(targetId);

    return (
      <FontAwesomeIcon
        className={combineClassNames(baseClassName, className)}
        icon={iconToUse}
        {...otherProps}
      />
    )
  }
}
