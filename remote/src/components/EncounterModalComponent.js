import React, { PureComponent } from 'react';

import ButtonComponent from 'common-components/ButtonComponent';
import ModalComponent from 'common-components/ModalComponent';

import TriggerDisplayComponent from 'components/TriggerDisplayComponent';

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
    /** @type {EncounterData.triggerList} */
    triggerList: [],
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
      triggerList,

      ...otherProps
    } = this.props;

    const hasTriggers = triggerList.length > 0;

    return (
      <ModalComponent
        className='color-white flex-col aitems-center bg-secondary bor-5-white pad-2 mar-v-5'
        style={{
          width: '300px',
          height: '80%',
        }}
        {...otherProps}
      >
        <h2 className='adjacent-mar-t-2'>{ title }</h2>

        {/* trigger display */}
        { hasTriggers &&
          <div className='flex-col-center boxsizing-border bg-primary-darker width-full pad-3 mar-h-2 adjacent-mar-t-2'>
            { triggerList.map((triggerData, idx) => (
              <TriggerDisplayComponent
                key={`encounter-modal-trigger-list-${idx}-key`}
                className='adjacent-mar-t-1'
                data={triggerData}
              />
            ))}
          </div>
        }

        {/* narrative text */}
        <div
          className='fsize-5 talign-center flex-col-center flex-grow-only pad-3 boxsizing-border bg-primary-darker width-full mar-h-2 adjacent-mar-t-2'
        >
          { content }
        </div>

        <div className='flex-row adjacent-mar-t-2'>
          { actionList.map((actionData, idx) => {
            return (
              <EncounterActionButton
                key={`encounter-modal-action-button-${actionData.actionId}-${idx}-key`}
                actionData={actionData}
                disabled={!actionData._doesMeetConditions}
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
        className='fsize-4 pad-2 f-bold adjacent-mar-l-2'
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
