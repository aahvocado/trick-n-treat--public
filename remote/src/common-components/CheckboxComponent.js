import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class CheckboxComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row',
    /** @type {String} */
    className: '',

    // -- native props
    /** @type {Boolean} */
    disabled: false,
    /** @type {Boolean} */
    checked: false,
    /** @type {Function} */
    onChange: () => {},
  }
  /** @override */
  render() {
    const {
      baseClassName,
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <label
        className={combineClassNames(baseClassName, className)}
      >
        <input
          type='checkbox'
          className='mar-r-1'
          {...otherProps}
        />

        {children}
      </label>
    )
  }
}
