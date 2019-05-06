import React, { PureComponent } from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class ModalComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'cursor-auto mar-h-auto borradius-2',
    /** @type {String} */
    className: '',
    /** @type {Boolean} */
    active: false,
    /** @type {Object} */
    style: {},
    /** @type {Function} */
    onClickOverlay: () => {},
  };
  /** @default */
  constructor(props) {
    super(props);

    this.onClickModalContent = this.onClickModalContent.bind(this);
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
      style,
    } = this.props;

    const { isDisabled } = this.state;

    return (
      <div
        className='position-fixed flex-center pos-0 zindex-10 pointer-cursor'
        style={{
          transition: isDisabled ? 'none' : 'opacity 300ms',
          backgroundColor: 'rgba(0, 0, 0, .33)',
          opacity: (isDisabled || !active) ? 0 : 1,
          pointerEvents: !active ? 'none' : 'initial',
        }}
        onClick={this.onClickOverlay}
      >
        <div
          className={combineClassNames(baseClassName, className)}
          style={{
            transition: 'transform 300ms',
            transform: active ?
              'translate3d(0px, 0px, 0px) scale3d(1, 1, 1)' :
              'translate3d(0px, -30px, -50px) scale3d(0.9, 0.9, 0.9)',
            ...style,
          }}
          onClick={this.onClickModalContent}
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
    this.props.onClickOverlay();
  }
  /**
   * catches the clicking inside to prevent it from triggering `onClickOverlay()`
   * @param {Event} e
   */
  onClickModalContent(e) {
    e.stopPropagation();
  }
}
