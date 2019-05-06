import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class LetterIconComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'display-inline-block pad-v-1 pad-h-2 fsize-3 color-white bg-grayest bor-1-grayer borradius-1 box-sizing-border',
    /** @type {String} */
    className: '',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      ...otherProps
    } = this.props;

    return (
      <i
        className={combineClassNames(baseClassName, className)}
        style={{
          fontFamily: 'serif',
          minWidth: '28px',
        }}
        {...otherProps}
      />
    )
  }
}
