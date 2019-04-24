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
    /** @type {EncounterData.actions} */
    actions: [],
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
      actions,
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
          className='fsize-5 flex-col-centered color-white bg-primary-darker flex-grow-1 width-full mar-h-2 sibling-mar-t-2'
        >
          { content }
        </div>

        <div className='flex-row mar-b-2 sibling-mar-t-2'>
          { actions.map((encounterAction, idx) => {
            return (
              <EncounterActionButton
                {...encounterAction}
                key={`encounter-modal-action-button-${encounterAction.actionId}-${idx}-key`}
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
    /** @type {String} */
    label: '',
    /** @type {String} */
    actionId: '',
    /** @type {Function} */
    onClick: () => {},
  };

  /** @override */
  render() {
    const {
      label,
      actionId,
      ...otherProps
    } = this.props;

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
    const {actionId} = this.props;
    this.props.onClick(actionId);
  }
}
