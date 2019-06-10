import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

export const BUTTON_THEME = {
  WHITE: {
    base: 'bg-white',
    enabled: 'color-black hover:color-fourth focus:color-fourth',
    disabled: 'color-grayer bg-gray',
  },
  PURPLE: {
    base: 'borradius-1 borcolor-primary',
    enabled: 'color-white bg-secondary hover:bg-secondary-lighter focus:bg-secondary-lighter',
    disabled: 'color-grayer borradius-1 bg-secondary-darker',
  },
  ORANGE: {
    base: 'borradius-t-2 borradius-b-1 bor-l-2-fourth bor-r-2-fourth bor-t-2-fourth bor-b-5-fourth',
    enabled: 'color-primary bg-fifth hover:color-secondary focus:color-secondary active:color-secondary',
    disabled: 'color-tertiary bg-secondary',
  },
  GHOST_WHITE: {
    base: 'borradius-1 bg-transparent bor-1-transparent',
    enabled: 'color-white',
    disabled: 'color-grayer',
  },
  ORANGE_CIRCLE: {
    base: 'borradius-round bor-l-2-fourth bor-r-2-fourth bor-t-2-fourth bor-b-5-fourth',
    enabled: 'color-primary bg-fifth hover:color-secondary focus:color-secondary active:color-secondary',
    disabled: 'color-tertiary bg-secondary',
  },
}

/**
 *
 */
export default class ButtonComponent extends PureComponent {
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

    const cursorClassName = disabled ? null : 'cursor-pointer';
    const themeClassName = disabled ? theme.disabled : theme.enabled;

    return (
      <button
        className={combineClassNames(baseClassName, className, cursorClassName, theme.base, themeClassName)}
        disabled={disabled}
        {...otherProps}
      />
    )
  }
}
