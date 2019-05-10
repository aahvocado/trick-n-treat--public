import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class TextAreaComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'pad-1 boxsizing-border borradius-1 whitespace-pre-line',
    /** @type {String} */
    className: '',
    /** @type {String} */
    containerClassName: '',
    /** @type {Boolean} */
    disabled: false,
    /** @type {String} */
    label: '',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      containerClassName,
      disabled,
      label,

      ...otherProps
    } = this.props;

    const modifierClassNames = [
      disabled ? 'bg-light-gray bor-1-gray resize-none' : 'bg-white bor-1-gray hover:borcolor-fourth',
    ];

    return (
      <label
        className={combineClassNames('flex-col adjacent-mar-t-2', containerClassName)}
      >
        {label}

        <textarea
          className={combineClassNames(baseClassName, className, modifierClassNames)}
          disabled={disabled}
          {...otherProps}
        />
      </label>
    )
  }
}
