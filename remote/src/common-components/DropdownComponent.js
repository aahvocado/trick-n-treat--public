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
    baseClassName: 'flex-col position-relative sibling-mar-t-2',
    /** @type {String} */
    className: 'fsize-3',

    /** @type {Number} */
    maxHeight: 200,

    /** @type {Boolean} */
    active: false,
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
    this.onClickDocument = this.onClickDocument.bind(this);

    this.onClickControl = this.onClickControl.bind(this);
    this.onSelectHandler = this.onSelectHandler.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);

    this.state = {
      /** @type {Boolean} */
      showDropdown: props.active,

      /** @type {Number} */
      focusedIdx: 0,
    }
  }
  /** @override */
  componentDidMount() {
    document.addEventListener('mousedown', this.onClickDocument);
  }
  /** @override */
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickDocument);
  }
  /** @override */
  render() {
    const {
      // active,
      baseClassName,
      className,
      maxHeight,
      options,
      placeholder,
      value,

      // ...otherProps
    } = this.props;

    const {
      showDropdown,
    } = this.state;

    const controlClassName = showDropdown ? 'color-grayest' : 'color-black';

    // search for the option in the list to display the `label` text
    const matchingOption = options.find((item) => (item && item.id === value.id));
    const displayLabel = (matchingOption && matchingOption.label) || placeholder || 'Select...';

    return (
      <div
        ref={this.containerRef}
        className={combineClassNames(baseClassName, className)}
      >
        {/* Control display */}
        <button
          className={combineClassNames('bor-1-gray pad-1 borradius-1 bg-white hover:color-tertiary flex-row-center cursor-pointer', controlClassName)}
          onClick={this.onClickControl}
          aria-haspopup="listbox"
        >
          <div className='flex-auto text-ellipsis'>{ displayLabel }</div>

          <FontAwesomeIcon className='flex-none fsize-3' icon={faChevronDown} />
        </button>

        {/* Options List Menu */}
        <ul
          className={combineClassNames('position-absolute width-full bg-white zindex-9', showDropdown ? '' : 'display-none')}
          style={{
            top: '35px',
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 3px 3px 0',
            maxHeight: `${maxHeight}px`,
            overflow: 'auto',
          }}
          role='listbox'
        >
          { options.map((item, idx) => (
            <DropdownItem
              key={`dropdown-component-item-${item.id}-${idx}-key`}
              isSelected={value.id === item.id}
              onClick={() => {
                this.onSelectHandler(item);
              }}
              {...item}
            />
          ))}
        </ul>
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
    if (shouldShow === undefined) {
      this.setState({showDropdown: !this.state.showDropdown});
      return;
    }

    this.setState({showDropdown: shouldShow});
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
}
/**
 *
 */
class DropdownItem extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'pad-h-1 pad-v-2 bg-white color-black hover:color-fourth cursor-pointer',
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

      ...otherProps
    } = this.props;

    return (
      <li
        className={combineClassNames(baseClassName, className)}
        style={{
          backgroundColor: isSelected ? '#cde3ea' : undefined,
        }}
        role='option'
        aria-selected={isSelected ? true : false}
        tabIndex={-1}
        {...otherProps}
      >
        { label }
      </li>
    )
  }
}
