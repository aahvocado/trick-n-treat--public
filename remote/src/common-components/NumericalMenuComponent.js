import React, { PureComponent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import ButtonComponent, { BUTTON_THEME } from 'common-components/ButtonComponent';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class NumericalMenuComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'overflow-auto flex-row-center pad-1 mar-h-2 boxsizing-border',
    /** @type {String} */
    className: '',

    /** @type {Number} */
    defaultIdx: 0,
    /** @type {Number} */
    minIdx: 0,
    /** @type {Number} */
    maxIdx: 5,

    /** @type {Number} */
    maxToShow: 5,
    /** @type {Function} */
    onChange: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.onChangeIdx = this.onChangeIdx.bind(this);
    this.onClickDecrement = this.onClickDecrement.bind(this);
    this.onClickIncrement = this.onClickIncrement.bind(this);

    this.onClickDisplayItem = this.onClickDisplayItem.bind(this);

    this.state = {
      /** @type {Number} */
      currentIdx: props.defaultIdx,
    }
  }
  /** @override */
  componentDidUpdate(prevProps, prevState) {
    // if this received new props that define the defaultIdx, update the selection to that
    if (prevProps.defaultIdx !== this.props.defaultIdx) {
      this.setState({currentIdx: this.props.defaultIdx});
    }
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,

      minIdx,
      maxIdx,
    } = this.props;

    const {
      currentIdx,
    } = this.state;


    return (
      <div
        className={combineClassNames(baseClassName, className)}
      >
        <ButtonComponent
          theme={BUTTON_THEME.GHOST_WHITE}
          disabled={currentIdx <= minIdx}
          onClick={this.onClickDecrement}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </ButtonComponent>

        { this.renderNumberList() }

        <ButtonComponent
          theme={BUTTON_THEME.GHOST_WHITE}
          disabled={currentIdx >= maxIdx}
          onClick={this.onClickIncrement}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </ButtonComponent>
      </div>
    )
  }
  /**
   * @todo - geezus the calculations here are ugly, gotta clean up up some day
   *
   * @returns {React.Component}
   */
  renderNumberList() {
    const {
      minIdx,
      maxIdx,
      maxToShow,
    } = this.props;

    const {
      currentIdx,
    } = this.state;

    // nothing here
    if (maxIdx <= -1) {
      return <div>?</div>
    }

    // to be returned
    const numberList = [];

    // calculate the indices so we can show the selected item in the middle
    const halfMax = Math.floor(maxToShow / 2);

    const potentialMin = currentIdx - halfMax;
    const potentialMax = currentIdx + halfMax;

    const excessMin = potentialMin < minIdx ? Math.abs((minIdx - Math.abs(potentialMin))) : 0;
    const excessMax = potentialMax > maxIdx ? Math.abs((maxIdx - Math.abs(potentialMax))) : 0;

    // determine range of indices
    const minToUse = Math.max(minIdx, potentialMin - excessMax);
    const maxToUse = Math.min(maxIdx, potentialMax + excessMin);

    // is it so far that we want to show the extremes
    const showFirstItem = minToUse - minIdx >= maxToShow;
    const showLastItem = maxIdx - maxToUse >= maxToShow;

    if (showFirstItem) {
      numberList.push(
        <NumericalDisplayItem
          key={`numerical-menu-display-item-${minIdx}-key`}
          children={`${minIdx}...`}
          onClickItem={() => {
            this.onClickDisplayItem(minIdx);
          }}
        />
      )
    }

    for (let i = minToUse + (showFirstItem ? 1 : 0); i <= maxToUse - (showLastItem ? 1 : 0); i++) {
      numberList.push(
        <NumericalDisplayItem
          key={`numerical-menu-display-item-${i}-key`}
          children={i}
          isSelected={i === currentIdx}
          onClickItem={() => {
            this.onClickDisplayItem(i);
          }}
        />
      )
    }

    if (showLastItem) {
      numberList.push(
        <NumericalDisplayItem
          key={`numerical-menu-display-item-${maxIdx}-key`}
          children={`...${maxIdx}`}
          onClickItem={() => {
            this.onClickDisplayItem(maxIdx);
          }}
        />
      )
    }

    return numberList;
  }
  /**
   *
   */
  onClickDecrement() {
    const {minIdx} = this.props;
    const {currentIdx} = this.state;

    const nextIdx = currentIdx - 1;
    if (nextIdx < minIdx) {
      return;
    }

    this.setState({currentIdx: nextIdx}, this.onChangeIdx);
  }
  /**
   *
   */
  onClickIncrement() {
    const {maxIdx} = this.props;
    const {currentIdx} = this.state;

    const nextIdx = currentIdx + 1;
    if (nextIdx > maxIdx) {
      return;
    }

    this.setState({currentIdx: nextIdx}, this.onChangeIdx);
  }
  /**
   *
   */
  onChangeIdx() {
    const {currentIdx} = this.state;
    this.props.onChange(currentIdx);
  }
  /**
   * @param {Number} idx
   */
  onClickDisplayItem(idx) {
    this.setState({currentIdx: idx}, this.onChangeIdx);
  }
}
/**
 *
 */
function NumericalDisplayItem(props) {
  const {
    children,
    className,
    isSelected,
    onClickItem,
  } = props;

  const textClassName = isSelected ? 'color-fourth text-stroke' : null;

  return (
    <ButtonComponent
      className={combineClassNames('adjacent-mar-l-1 pad-1', className)}
      theme={BUTTON_THEME.GHOST_WHITE}
      onClick={onClickItem}
    >
      <div className={textClassName}>
        {children}
      </div>
    </ButtonComponent>
  )
}
