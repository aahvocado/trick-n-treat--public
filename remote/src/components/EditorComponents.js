import React, {Component} from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 * shared components for an Editor
 */

/**
 * this is the primary page container
 */
export class EditorPageContainer extends Component {
  /** @override */
  render() {
    const {
      children,
      className,
      header,
      ...otherProps
    } = this.props;

    return (
      <div
        className={combineClassNames('flex-center flex-col color-white fontfamily-secondary', className)}
        {...otherProps}
      >
        <h2 className='fsize-4 pad-v-1 width-full talign-center'>
          {header}
        </h2>

        <div className='flex-col height-full bg-primary-darker'>
          {children}
        </div>
      </div>
    )
  }
}
/**
 * the actionbar of the Editor
 */
export class EditorActionbarContainer extends Component {
  /** @override */
  render() {
    const {
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <div
        className={combineClassNames('flex-col color-white bg-primary pad-2', className)}
        {...otherProps}
      >
        {children}
      </div>
    )
  }
}
/**
 * the body of the Editor
 */
export class EditorBodyContainer extends Component {
  /** @override */
  render() {
    const {
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <div
        className={combineClassNames('mar-h-auto mar-v-2 flex-row fsize-3 color-black', className)}
        {...otherProps}
      >
        {children}
      </div>
    )
  }
}
/**
 * this is a tiny section of a Form
 */
export class SectionFormContainer extends Component {
  /** @override */
  render() {
    const {
      children,
      className,
      header,
      ...otherProps
    } = this.props;

    return (
      <section
        className={combineClassNames('pad-2 flex-col flex-none bor-3-tertiary borradius-2 bg-light-beige adjacent-mar-t-1', className)}
        {...otherProps}
      >
        <h3 className='fsize-3 f-bold color-grayer adjacent-mar-t-2'>
          {header}
        </h3>

        <div className='adjacent-mar-t-2'>
          {children}
        </div>
      </section>
    )
  }
}
