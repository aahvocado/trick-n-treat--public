import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class InputFieldComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'sibling-mar-t-2 flex-row aitems-center borradius-1 fsize-3 bg-primary',
    /** @type {String} */
    className: '',
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
        {children}

        <input
          className='mar-h-1 flex-shrink-1 bor-l-1-tertiary pad-1 color-white width-full'
          {...otherProps}
        />
      </label>
    )
  }
}
