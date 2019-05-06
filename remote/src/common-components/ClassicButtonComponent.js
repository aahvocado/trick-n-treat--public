import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ClassicButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'text-center borradius-2 bor-1-primary borradius-1 pad-2',
    /** @type {String} */
    className: '',
    /** @type {Boolean} */
    disabled: false,
    /** @type {Function} */
    onClick: () => {},

    /** @type {String} */
    activeClassName: 'color-white bg-secondary hover:bg-secondary-lighter cursor-pointer',
    /** @type {String} */
    disabledClassName: 'color-grayer bg-secondary-darker',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      disabled,
      disabledClassName,
      activeClassName,
      ...otherProps
    } = this.props;

    const modifiedClassName = disabled ? disabledClassName : activeClassName;

    return (
      <button
        className={combineClassNames(baseClassName, className, modifiedClassName)}
        disabled={disabled}
        {...otherProps}
      />
    )
  }
}
