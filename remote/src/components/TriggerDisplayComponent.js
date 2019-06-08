import React, { PureComponent } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons'

import * as itemDataHelper from 'helpers.shared/itemDataHelper';

import GameIconComponent from 'components/GameIconComponent';

import combineClassNames from 'utilities/combineClassNames';

import * as triggerLogicUtils from 'utilities.shared/triggerLogicUtils';

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
      targetId,
      triggerLogicId,
      value,
    } = data;

    // some triggers aren't displayed
    if (triggerLogicUtils.isHiddenTrigger(triggerLogicId)) {
      return null;
    }

    const isItem = itemId !== undefined;
    const itemDataObject = itemDataHelper.getItemDataById(itemId);

    return (
      <div className={combineClassNames(baseClassName, className)}>
        { triggerLogicUtils.isAddTriggerLogic(triggerLogicId) &&
          <FontAwesomeIcon className='fsize-2 flex-none adjacent-mar-l-1' icon={faPlus} />
        }

        { triggerLogicUtils.isSubtractTriggerLogic(triggerLogicId) &&
          <FontAwesomeIcon className='fsize-2 flex-none adjacent-mar-l-1' icon={faMinus} />
        }

        <div className='flex-none adjacent-mar-l-1'>{value}</div>

        { isItem &&
          <div className='flex-none adjacent-mar-l-1'>{itemDataObject.name}</div>
        }

        <GameIconComponent className='adjacent-mar-l-1' targetId={targetId} />
      </div>
    )
  }

}
