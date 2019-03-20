import React, { PureComponent } from 'react';

/**
 *
 */
export class BasicButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'fsize-4 text-center f-bold borradius-2 boxshadow-b-2-fourth pad-2 sibling-mar-l-1 cursor-pointer',
    /** @type {String} */
    className: '',
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

    const modClassname = disabled ? 'color-tertiary bor-2-fourth bg-transparent' : 'color-primary bg-fifth';

    return (
      <button
        className={baseClassName + ' ' + className + ' ' + modClassname}
        style={style}
        onClick={this.props.onClick}
        disabled={disabled}
      >
        { this.props.children }
      </button>
    )
  }
}
