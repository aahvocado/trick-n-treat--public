import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class TextInputComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'pad-1 flex-auto borradius-1',
    /** @type {String} */
    className: '',
    /** @type {String} */
    containerClassName: '',
    /** @type {Boolean} */
    disabled: false,
    /** @type {String} */
    label: '',
  };
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
      disabled ? 'color-black bg-light-gray bor-1-gray resize-none' : 'bg-white color-black bor-1-gray hover:borcolor-fourth',
    ];

    return (
      <label
        className={combineClassNames('flex-col adjacent-mar-t-2', containerClassName)}
      >
        {label}

        <input
          className={combineClassNames(baseClassName, className, modifierClassNames)}
          type='text'
          disabled={disabled}
          {...otherProps}
        />
      </label>
    )
  }
}
