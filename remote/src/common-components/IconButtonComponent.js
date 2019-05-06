import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 *
 */
export default class IconButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'pad-1 fsize-2 color-grayer hover:color-tertiary cursor-pointer',
    /** @type {String} */
    className: 'bor-1-gray borradius-1 bg-white',
  };
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      icon,
      ...otherProps
    } = this.props;

    return (
      <button
        className={combineClassNames(baseClassName, className)}
        {...otherProps}
      >
        <FontAwesomeIcon style={{padding: '2px'}} icon={icon} />
      </button>
    )
  }
}
