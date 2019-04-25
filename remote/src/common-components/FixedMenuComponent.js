import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class FixedMenuComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bg-white height-full pad-2',
    /** @type {String} */
    className: '',

    /** @type {Boolean} */
    active: false,

    /** @type {Boolean} */
    shouldUseOverlay: true,
    /** @type {Function} */
    onClickOverlay: () => {},
  };
  /** @default */
  constructor(props) {
    super(props);

    this.onClickContent = this.onClickContent.bind(this);
    this.onClickOverlay = this.onClickOverlay.bind(this);

    this.state = {
      /** @type {Boolean} */
      isDisabled: props.active === undefined ? false : !props.active,
    }
  };
  /** @default */
  componentDidUpdate() {
    // if we were disabled, but now we are active, we can not worry about being disabled anymore
    if (this.state.isDisabled && this.props.active) {
      this.setState({ isDisabled: false });
    }
  };
  /** @default */
  render() {
    const {
      active,
      baseClassName,
      className,
      shouldUseOverlay,
      style,
    } = this.props;

    const { isDisabled } = this.state;

    return (
      <div
        className='position-fixed flex-centered pos-0 zindex-10 pointer-cursor'
        style={{
          transition: isDisabled ? 'none' : 'opacity 500ms',
          backgroundColor: shouldUseOverlay ? 'rgba(0, 0, 0, .33)' : '',
          opacity: (isDisabled || !active) ? 0 : 1,
          pointerEvents: (!active || (active && !shouldUseOverlay)) ? 'none' : 'initial',
        }}
        onClick={this.onClickOverlay}
      >
        <div
          className={combineClassNames(baseClassName, className)}
          style={{
            pointerEvents: 'initial',
            transition: 'transform 300ms ease-out',
            transform: active ?
              'translateX(0px)':
              'translateX(-100%)',
            ...style,
          }}
          onClick={this.onClickContent}
        >
          {this.props.children}
        </div>
      </div>
    )
  };
  /**
   *
   * @param {Event} e
   */
  onClickOverlay(e) {
    const {shouldUseOverlay} = this.props;
    if (!shouldUseOverlay) {
      e.stopPropagation();
      return;
    }

    this.props.onClickOverlay();
  }
  /**
   * catches the clicking inside to prevent it from triggering `onClickOverlay()`
   * @param {Event} e
   */
  onClickContent(e) {
    e.stopPropagation();
  }
}
