import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class TextInputComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'sibling-mar-t-2',
    /** @type {String} */
    className: 'fsize-3',
    /** @type {String} */
    value: '',

    /** @type {String} */
    activeInputClassName: 'bor-1-fourth',
    /** @type {String} */
    baseInputClassName: 'bor-1-gray',
    /** @type {Boolean} */
    isEditing: false,

    /** @type {Function} */
    onBlur: () => {},
    /** @type {Function} */
    onClick: () => {},
    /** @type {Function} */
    onEnter: () => {},
    /** @type {Function} */
    onLeave: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onBlurHandler = this.onBlurHandler.bind(this);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onEnterHandler = this.onEnterHandler.bind(this);
    this.onLeaveHandler = this.onLeaveHandler.bind(this);

    this.state = {
      /** @type {Boolean} */
      isFocused: false,
    }
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      isEditing,
      value,

      activeInputClassName,
      baseInputClassName,

      // don't include these in `otherProps`
      children,
      onBlur,
      onClick,
      onEnter,
      onLeave,

      ...otherProps
    } = this.props;

    const {
      isFocused,
    } = this.state;

    const modifierClassNames = [
      (isFocused || isEditing) ? activeInputClassName : baseInputClassName,
    ];

    return (
      <label
        className={combineClassNames('flex-col', baseClassName, className)}
        onClick={this.onClickHandler}
      >
        <div className='color-grayer'>{ children }</div>

        <input
          className={combineClassNames('pad-1 bg-white flex-auto borradius-1 mar-t-1', modifierClassNames)}
          style={{fontFamily: 'sans-serif'}}
          onBlur={this.onBlurHandler}
          onMouseEnter={this.onEnterHandler}
          onMouseLeave={this.onLeaveHandler}
          type='text'
          value={value}
          {...otherProps}
        />
      </label>
    )
  }
  /**
   * @param {SyntheticEvent} e
   */
  onClickHandler(e) {
    this.setState({isFocused: true});
    this.props.onClick(e);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onBlurHandler(e) {
    this.setState({isFocused: false});
    this.props.onBlur(e);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onEnterHandler(e) {
    this.setState({isFocused: true});
    this.props.onEnter(e);
  }
  /**
   * @param {SyntheticEvent} e
   */
  onLeaveHandler(e) {
    this.setState({isFocused: false});
    this.props.onLeave(e);
  }
}
