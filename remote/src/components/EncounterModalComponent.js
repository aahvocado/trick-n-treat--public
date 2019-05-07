import React, { PureComponent } from 'react';

// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// import {
//   faCircle,
// } from '@fortawesome/free-solid-svg-icons'

import ButtonComponent from 'common-components/ButtonComponent';
import ModalComponent from 'common-components/ModalComponent';

/**
 *
 */
export default class EncounterModalComponent extends PureComponent {
  static defaultProps = {
    // -- modal props
    /** @type {Boolean} */
    active: false,

    // -- encounter props
    /** @type {EncounterData.actionList} */
    actionList: [],
    /** @type {EncounterData.title} */
    title: 'default title',
    /** @type {EncounterData.content} */
    content: 'default description',

    /** @type {Function} */
    onClickAction: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onClickAction = this.onClickAction.bind(this);
  }
  /** @override */
  render() {
    const {
      actionList,
      content,
      title,

      ...otherProps
    } = this.props;

    return (
      <ModalComponent
        className='flex-col aitems-center bg-secondary bor-5-white pad-2 mar-v-5'
        style={{
          width: '300px',
          height: '80%',
        }}
        {...otherProps}
      >
        <h2 className='color-white sibling-mar-t-2'>{ title }</h2>

        <div
          className='fsize-5 text-center flex-col-center flex-grow-only pad-3 box-sizing-border color-white bg-primary-darker width-full mar-h-2 sibling-mar-t-2'
        >
          { content }
        </div>

        <div className='flex-row sibling-mar-t-2'>
          { actionList.map((actionData, idx) => {
            return (
              <EncounterActionButton
                key={`encounter-modal-action-button-${actionData.actionId}-${idx}-key`}
                actionData={actionData}
                onClick={this.onClickAction}
              />
            )
          })}
        </div>
      </ModalComponent>
    )
  }
  /**
   * @param {*} - data from `<EncounterActionButton />`
   */
  onClickAction(...args) {
    this.props.onClickAction(...args);
  }
}

class EncounterActionButton extends PureComponent {
  /** @override */
  static defaultProps = {
    /** @type {ActionData} */
    actionData: undefined,

    /** @type {Function} */
    onClick: () => {},
  };

  /** @override */
  render() {
    const {
      actionData,
      ...otherProps
    } = this.props;

    const {
      actionId,
      // gotoId,
      label,
    } = actionData;

    return (
      <ButtonComponent
        {...otherProps}
        className='fsize-4 pad-2 f-bold sibling-mar-l-2'
        id={actionId}
        onClick={this.onClickButton.bind(this)}
      >
        { label }
      </ButtonComponent>
    )
  }
  /**
   *
   */
  onClickButton() {
    this.props.onClick(this.props.actionData);
  }
}
