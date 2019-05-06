import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'text-center borradius-t-2 borradius-b-1 bor-2-fourth pad-2',
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

    const baseTextClassName = 'color-primary bg-fifth hover:bg-fifth-lighter active:bg-fourth cursor-pointer';
    const disabledTextClassName = 'color-tertiary bg-secondary';
    const finalTextClassName = disabled ? disabledTextClassName : baseTextClassName;

    return (
      <button
        className={combineClassNames(baseClassName, className, finalTextClassName)}
        style={{borderBottomWidth: '8px'}}
        disabled={disabled}
        {...otherProps}
      />
    )
  }
}
