import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class RadioButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row',
    /** @type {String} */
    className: '',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      children,
      className,
      style,
      ...otherProps
    } = this.props;

    return (
      <label
        className={combineClassNames(baseClassName, className)}
        style={style}
      >
        <input
          type='radio'
          className='mar-r-1'
          {...otherProps}
        />

        {children}
      </label>
    )
  }
}
