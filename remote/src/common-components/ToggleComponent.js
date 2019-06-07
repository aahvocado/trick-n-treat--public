import React, { PureComponent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faToggleOn, faToggleOff} from '@fortawesome/free-solid-svg-icons'

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ToggleComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row cursor-pointer',
    /** @type {String} */
    className: '',
    /** @type {Boolean} */
    checked: false,
    /** @type {String} */
    children: '',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      checked,
      className,
      children,
      style,
      ...otherProps
    } = this.props;

    return (
      <label
        className={combineClassNames(baseClassName, className)}
        style={style}
      >
        <div className='flex-auto'>{children}</div>

        <input
          type='checkbox'
          className='display-none'
          checked={checked}
          {...otherProps}
        />

        <FontAwesomeIcon
          className='mar-l-1 flex-none'
          icon={checked ? faToggleOn : faToggleOff}
        />
      </label>
    )
  }
}
