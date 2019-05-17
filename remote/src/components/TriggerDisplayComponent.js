import React, { PureComponent } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faBacon,
  faBreadSlice,
  faDove,
  faEye,
  faDice,
  faHeart,
  faRunning,
  faMapMarker,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons'

import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import { TRIGGER_ID } from 'constants.shared/triggerIds';

import combineClassNames from 'utilities/combineClassNames';

import * as triggerUtils from 'utilities.shared/triggerUtils';

/**
 * @param {TriggerId} triggerId
 * @returns {Font Awesome Icon}
 */
function getIconOfTrigger(triggerId) {
  if (triggerId === TRIGGER_ID.HEALTH.ADD) {
    return faHeart;
  }
  if (triggerId === TRIGGER_ID.HEALTH.SUBTRACT) {
    return faHeart;
  }

  if (triggerId === TRIGGER_ID.CANDY.ADD) {
    return faBacon;
  }
  if (triggerId === TRIGGER_ID.CANDY.SUBTRACT) {
    return faBacon;
  }

  if (triggerId === TRIGGER_ID.MOVEMENT.ADD) {
    return faRunning;
  }
  if (triggerId === TRIGGER_ID.MOVEMENT.SUBTRACT) {
    return faRunning;
  }

  if (triggerId === TRIGGER_ID.SANITY.ADD) {
    return faDove;
  }
  if (triggerId === TRIGGER_ID.SANITY.SUBTRACT) {
    return faDove;
  }

  if (triggerId === TRIGGER_ID.VISION.ADD) {
    return faEye;
  }
  if (triggerId === TRIGGER_ID.VISION.SUBTRACT) {
    return faEye;
  }

  if (triggerId === TRIGGER_ID.LUCK.ADD) {
    return faDice;
  }
  if (triggerId === TRIGGER_ID.LUCK.SUBTRACT) {
    return faDice;
  }

  if (triggerId === TRIGGER_ID.GREED.ADD) {
    return faBacon;
  }
  if (triggerId === TRIGGER_ID.GREED.SUBTRACT) {
    return faBacon;
  }

  if (triggerId === TRIGGER_ID.GIVE_ITEM) {
    return faBreadSlice;
  }

  if (triggerId === TRIGGER_ID.TAKE_ITEM) {
    return faBreadSlice;
  }

  if (triggerId === TRIGGER_ID.CHANGE_LOCATION) {
    return faMapMarker;
  }
}

/**
 *
 */
export default class TriggerDisplayComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row',
    /** @type {String} */
    className: '',
    /** @type {TriggerData} */
    data: {},
    /** @type {Function} */
    onEdit: () => {},
  };
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      data,
    } = this.props;

    const {
      itemId,
      triggerId,
      value,
    } = data;

    const isItem = itemId !== undefined;
    const itemDataObject = itemDataHelper.getItemDataById(itemId);

    return (
      <div className={combineClassNames(baseClassName, className)}>
        { triggerUtils.isAddTrigger(triggerId) &&
          <FontAwesomeIcon className='fsize-2 flex-none adjacent-mar-l-1' icon={faPlus} />
        }

        { triggerUtils.isSubtractTrigger(triggerId) &&
          <FontAwesomeIcon className='fsize-2 flex-none adjacent-mar-l-1' icon={faMinus} />
        }

        <div className='flex-none adjacent-mar-l-1'>{value}</div>

        { isItem &&
          <div className='flex-none adjacent-mar-l-1'>{itemDataObject.name}</div>
        }

        <FontAwesomeIcon className='flex-none adjacent-mar-l-1' icon={getIconOfTrigger(triggerId)} />
      </div>
    )
  }

}
