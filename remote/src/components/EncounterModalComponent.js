import React, { PureComponent } from 'react';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';
import ModalComponent from 'common-components/ModalComponent';

import TriggerDisplayComponent from 'components/TriggerDisplayComponent';

/**
 *
 */
export default class EncounterModalComponent extends PureComponent {
  static defaultProps = {
    /** @type {Boolean} */
    active: false,
    /** @type {Function} */
    onClickAction: () => {},

    /** @type {Object} */
    encounterData: {},
  };
  /** @override */
  render() {
    const {
      encounterData,
      onClickAction,
      ...otherProps
    } = this.props;

    const {
      actionList = [],
      content,
      title,
      triggerList = [],
    } = encounterData;

    const triggersToShow = triggerList.filter((triggerData) => triggerData.canBeTriggered);

    return (
      <ModalComponent
        className='color-white flex-col aitems-center bg-secondary bor-5-white pad-2 mar-v-5'
        style={{
          width: '300px',
          height: '80%',
        }}
        {...otherProps}
      >
        <h2 className='talign-center adjacent-mar-t-2'>{title}</h2>

        {/* trigger display */}
        { triggersToShow.length > 0 &&
          <div className='flex-col-center boxsizing-border bg-primary-darker width-full pad-3 mar-h-2 adjacent-mar-t-2'>
            { triggersToShow.map((triggerData, idx) => (
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
          className='fsize-5 width-full overflow-auto whitespace-pre-line talign-center flex-col flex-auto pad-3 boxsizing-border bg-primary-darker adjacent-mar-t-2'
        >
          {`${content}`}
        </div>

        {/* action buttons */}
        <div className='width-full flex-col adjacent-mar-t-2'>
          { actionList.map((actionData, idx) => {
            return (
              <ChoiceButton
                key={`encounter-modal-action-button-${actionData.choiceId}-${idx}-key`}
                actionData={actionData}
                disabled={!actionData.canUseAction}
                onClick={onClickAction}
              />
            )
          })}
        </div>
      </ModalComponent>
    )
  }
}
/**
 *
 */
class ChoiceButton extends PureComponent {
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
      choiceId,
      // gotoId,
      label,
    } = actionData;

    return (
      <ButtonComponent
        {...otherProps}
        className='fsize-4 pad-2 f-bold adjacent-mar-t-1'
        theme={BUTTON_THEME.ORANGE}
        id={choiceId}
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
