import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

export const BUTTON_THEME = {
  WHITE: {
    base: 'color-black bg-white hover:color-fourth focus:color-fourth cursor-pointer',
    disabled: 'color-grayer bg-gray',
  },
  PURPLE: {
    base: 'color-white bg-secondary borradius-1 borcolor-primary hover:bg-secondary-lighter focus:bg-secondary-lighter cursor-pointer',
    disabled: 'color-grayer borradius-1 bg-secondary-darker',
  },
}

/**
 *
 */
export default class ClassicButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'borwidth-1 talign-center pad-2',
    /** @type {String} */
    className: '',
    /** @type {Boolean} */
    disabled: false,
    /** @type {Function} */
    onClick: () => {},

    /** @type {Object} */
    theme: BUTTON_THEME.PURPLE,
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      disabled,
      theme,
      ...otherProps
    } = this.props;

    const modifiedClassName = disabled ? theme.disabled : theme.base;

    return (
      <button
        className={combineClassNames(baseClassName, className, modifiedClassName)}
        disabled={disabled}
        {...otherProps}
      />
    )
  }
}
