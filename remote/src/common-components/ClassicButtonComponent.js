import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ClassicButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'text-center borradius-2 cursor-pointer bor-1-primary borradius-1 pad-2',
    /** @type {String} */
    className: '',
    /** @type {Boolean} */
    disabled: false,
    /** @type {Function} */
    onClick: () => {},
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      disabled,
      ...otherProps
    } = this.props;

    const baseTextClassName = 'color-white bg-secondary hover:bg-secondary-lighter';
    const disabledTextClassName = 'color-grayer bg-secondary-darker';
    const finalTextClassName = disabled ? disabledTextClassName : baseTextClassName;

    return (
      <button
        className={combineClassNames(baseClassName, className, finalTextClassName)}
        disabled={disabled}
        {...otherProps}
      />
    )
  }
}
