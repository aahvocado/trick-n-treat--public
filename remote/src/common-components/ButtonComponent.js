import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'text-center borradius-2 boxshadow-b-2-fourth cursor-pointer',
    /** @type {String} */
    className: 'fsize-4 pad-2 f-bold',
    /** @type {Object} */
    style: {},
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
      style,
    } = this.props;

    const baseTextClassName = 'color-primary bor-2-fourth bg-fifth';
    const disabledTextClassName = 'color-tertiary bor-2-fourth bg-transparent';
    const finalTextClassName = disabled ? disabledTextClassName : baseTextClassName;

    return (
      <button
        className={combineClassNames(baseClassName, className, finalTextClassName)}
        style={style}
        disabled={disabled}
        onClick={this.props.onClick}
      >
        { this.props.children }
      </button>
    )
  }
}
