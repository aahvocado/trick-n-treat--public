import React, { PureComponent } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import combineClassNames from 'utilities/combineClassNames';

/**
 * ughhh
 */
export default class DropdownComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bor-1-gray flex-col position-relative sibling-mar-t-2',
    /** @type {String} */
    className: 'fsize-3',
    /** @type {Number} */
    maxHeight: 200,

    /** @type {Number | null} */
    defaultFocusIdx: null,

    /** @type {Function} */
    onSelect: () => {},
    /** @type {Array} */
    options: [],
    /** @type {* | null} */
    value: null,
  };
  /** @override */
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();
    this.listRef = React.createRef();

    this.onClickDocument = this.onClickDocument.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onChangeFocusIdx = this.onChangeFocusIdx.bind(this);

    this.onClickControl = this.onClickControl.bind(this);
    this.onSelectHandler = this.onSelectHandler.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);

    this.state = {
      /** @type {Boolean} */
      isOpen: props.active,

      /** @type {Number} */
      focusedIdx: props.defaultFocusIdx,
    }
  }
  /** @override */
  componentDidMount() {
    document.addEventListener('mousedown', this.onClickDocument);

    document.addEventListener('keydown', this.handleKeyDown);
  }
  /** @override */
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickDocument);

    document.removeEventListener('keydown', this.handleKeyDown);
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      maxHeight,
      options,
      placeholder,
      value,

      // ...otherProps
    } = this.props;

    const {
      isOpen,
    } = this.state;

    const controlClassName = isOpen ? 'color-grayest' : 'color-black';

    // search for the option in the list to display the `label` text
    const matchingOption = options.find((item) => (item && value && (item.id === value.id || item.label === value)));
    const displayLabel = (matchingOption && matchingOption.label) || placeholder || 'Select...';

    return (
      <div
        ref={this.containerRef}
        className={combineClassNames(baseClassName, className)}
      >
        {/* Control display */}
        <button
          className={combineClassNames('pad-1 bg-white hover:color-tertiary flex-row-center cursor-pointer', controlClassName)}
          onClick={this.onClickControl}
          aria-haspopup="listbox"
        >
          <div className='flex-auto text-ellipsis'>{ displayLabel }</div>

          <FontAwesomeIcon className='mar-l-1 color-grayest flex-none fsize-3' icon={faChevronDown} />
        </button>

        {/* Options List Menu */}
        <div
          className={combineClassNames('position-absolute bor-1-gray box-sizing-border width-full bg-white zindex-9', isOpen ? 'flex-col' : 'display-none')}
          style={{
            top: '30px',
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 3px 3px 0',
            maxHeight: `${maxHeight}px`,
            minWidth: '200px',
            overflow: 'auto',
          }}
          role='listbox'
          ref={this.listRef}
        >
          { options.map((item, idx) => (
            <DropdownItem
              key={`dropdown-component-item-${item.id}-${idx}-key`}
              isSelected={matchingOption && matchingOption.id === item.id}
              isOpen={isOpen}
              onClick={() => {
                this.onSelectHandler(item);
              }}
              {...item}
            />
          ))}
        </div>
      </div>
    )
  }
  // -- local control
  /**
   * clicked the always visible Control
   *
   * @param {Boolean} [shouldShow]
   */
  toggleDropdown(shouldShow) {
    const toVisible = shouldShow !== undefined ? shouldShow : !this.state.isOpen;
    this.setState({isOpen: toVisible});
  }
  // --
  /**
   * clicked outside of Dropdown
   *
   * @param {SyntheticEvent} e
   */
  onClickDocument(e) {
    // close this if clicked elsewhere
    if (!this.containerRef.current.contains(e.target)) {
      this.toggleDropdown(false);
    }
  }
  /**
   * clicked the always visible Control
   */
  onClickControl() {
    // this.props.onClickControl();
    this.toggleDropdown();
  }
  /**
   * clicked an Option
   *  pass the data back up
   *
   * @param {*} item
   */
  onSelectHandler(item) {
    this.props.onSelect(item.data);
    this.toggleDropdown();
  }
  /**
   * keydown
   *
   * @param {Event} e
   */
  handleKeyDown(e) {
    // do nothing if dropdown is not open
    if (!this.state.isOpen) {
      return;
    }

    // esc
    if (e.keyCode === 27) {
      e.preventDefault();
      this.setState({isOpen: false});
    }
    // enter
    if (e.keyCode === 13) {
      // e.preventDefault();
      // this.onSelectHandler(this.getFocusedItem());
    }

    const {focusedIdx} = this.state;

    // up
    if (e.keyCode === 38) {
      e.preventDefault();

      if (focusedIdx === null) {
        this.onChangeFocusIdx(this.props.options.length - 1);
      } else {
        this.onChangeFocusIdx(focusedIdx - 1);
      }
    }
    // down
    if (e.keyCode === 40) {
      e.preventDefault();

      if (focusedIdx === null) {
        this.onChangeFocusIdx(0);
      } else {
        this.onChangeFocusIdx(focusedIdx + 1);
      }
    }
    // left
    if (e.keyCode === 37) {
      // e.preventDefault();
    }
    // right
    if (e.keyCode === 37) {
      // e.preventDefault();
    }
  }
  /**
   * @param {Number} idx
   */
  onChangeFocusIdx(idx) {
    const {options} = this.props;

    const highestIdx = options.length - 1;

    // handle going too low
    if (idx < 0) {
      return this.onChangeFocusIdx(highestIdx);
    }

    // handle going too high
    if (idx > highestIdx) {
      return this.onChangeFocusIdx(0);
    }

    // focus that element
    const itemElement = this.listRef.current.children[idx];
    if (itemElement !== undefined) {
      itemElement.focus();
    }

    // valid, set it
    this.setState({focusedIdx: idx});
  }
  /**
   * gets the data of whatever is currently focused
   *
   * @returns {*}
   */
  getFocusedItem() {
    const {options} = this.props;
    const {focusedIdx} = this.state;

    return options[focusedIdx];
  }
}
/**
 *
 */
class DropdownItem extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'sibling-mar-t-1 pad-h-1 pad-v-2 bg-white color-black hover:color-fourth cursor-pointer',
    /** @type {String} */
    className: '',

    /** @type {Boolean} */
    isSelected: false,
  };
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      isSelected,
      label,
      options,

      id,
      isOpen,

      ...otherProps
    } = this.props;

    return (
      <button
        className={combineClassNames(baseClassName, className)}
        style={{
          backgroundColor: isSelected ? '#cde3ea' : undefined,
        }}
        role='option'
        aria-selected={isSelected ? true : false}
        tabIndex={isOpen ? 0 : -1}
        {...otherProps}
      >
        { label }
      </button>
    )
  }
}
