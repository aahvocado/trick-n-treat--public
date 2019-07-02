import React, { PureComponent } from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';

import keycodes from 'constants.shared/keycodes';

import combineClassNames from 'utilities/combineClassNames';

/**
 * ughhh
 */
export default class DropdownComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'color-black bg-white boxsizing-content flex-col position-relative',
    /** @type {String} */
    className: 'fsize-3 bor-1-gray',
    /** @type {Number} */
    maxHeight: 200,
    /** @type {Number} */
    inputSize: 10,

    /** @type {Array} */
    options: [],
    /** @type {Number | null} */
    selectedIdx: null,
    /** @type {Object | null} */
    selectedOption: null,

    /** @type {Boolean} */
    canSearch: true,
    /** @type {Boolean} */
    disabled: false,

    /** @type {Function} */
    onChange: () => {},
    /** @type {Function} */
    onSelect: () => {},
  };
  /** @override */
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();
    this.listRef = React.createRef();

    this.onClickDocument = this.onClickDocument.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.moveFocusDown = this.moveFocusDown.bind(this);
    this.moveFocusUp = this.moveFocusUp.bind(this);

    this.onBlurControl = this.onBlurControl.bind(this);
    this.onClickControl = this.onClickControl.bind(this);
    this.onFocusControl = this.onFocusControl.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onSelectHandler = this.onSelectHandler.bind(this);

    const selectedOptionIdx = props.selectedOption !== null ? props.options.findIndex((option) => {
      return option.id === props.selectedOption.id || option.label === props.selectedOption;
    }) : undefined;

    this.state = {
      /** @type {Boolean} */
      isOpen: props.active,
      /** @type {Boolean} */
      isFocused: false,

      /** @type {String} */
      searchValue: '',
      /** @type {Number} */
      focusedIdx: props.selectedIdx || selectedOptionIdx || null,
    }
  }
  /** @override */
  componentDidMount() {
    document.addEventListener('mousedown', this.onClickDocument);

    document.addEventListener('keydown', this.handleKeyDown);

    // search for the option in the list to display the `label` text
    this.resetSearchValue();
  }
  /** @override */
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClickDocument);

    document.removeEventListener('keydown', this.handleKeyDown);
  }
  /** @override */
  componentDidUpdate(prevProps, prevState) {
    //
    if (prevProps.options.length !== this.props.options.length && !this.state.isOpen) {
      this.setState({
        searchValue: '',
        focusedIdx: null,
      });
      return;
    }

    // if this received new props that define the value of the control, update to that
    if (prevProps.selectedIdx !== this.props.selectedIdx || prevProps.selectedOption !== this.props.selectedOption) {
      this.resetSearchValue();
    }
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      canSearch,
      disabled,
      inputSize,
      maxHeight,
      placeholder,
      style,
    } = this.props;

    const {
      focusedIdx,
      isOpen,
      searchValue,
    } = this.state;

    const readOnly = !canSearch;

    const filteredOptions = this.getFilteredOptions();
    const isOptionsEmpty = filteredOptions.length === 0;

    const readOnlyClassNames = 'hover:borcolor-fourth';
    const editableClassNames = 'hover:borcolor-fourth hover:color-fourth';
    const modifierClassNames = readOnly ? readOnlyClassNames : editableClassNames;

    return (
      <div
        ref={this.containerRef}
        className={combineClassNames(baseClassName, className, modifierClassNames)}
        style={style}
        aria-haspopup="listbox"
      >
        <DropdownControl
          disabled={disabled}
          value={searchValue}
          onClick={this.onClickControl}
          onFocus={this.onFocusControl}
          onBlur={this.onBlurControl}
          onChange={this.onChangeHandler}
          readOnly={readOnly}
          placeholder={placeholder || 'Select...'}
          size={inputSize}
        />

        {/* Options List Menu */}
        <div
          className={combineClassNames('position-absolute bor-1-gray boxsizing-border width-full bg-white zindex-9 overflow-auto', isOpen ? 'flex-col' : 'display-none')}
          style={{
            ...this.calculateDropdownPositionStyle(),
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 0px 3px 0',
            maxHeight: `${maxHeight}px`,
            minWidth: '200px',
          }}
          role='listbox'
          ref={this.listRef}
        >
          { filteredOptions.map((item, idx) => (
            <DropdownItem
              key={`dropdown-component-item-${item.id}-${idx}-key`}
              isOpen={isOpen}
              isSelected={focusedIdx === idx}
              onClick={() => {
                this.onSelectHandler(item);
              }}
              {...item}
            />
          ))}

          { isOptionsEmpty &&
            <div className='bor-t-1-light-gray pad-2'>Nothing Here 🥺</div>
          }
        </div>
      </div>
    )
  }
  /**
   * clicked the always visible Control
   *
   * @param {Boolean} [shouldShow]
   */
  toggleDropdown(shouldShow) {
    const toVisible = shouldShow !== undefined ? shouldShow : !this.state.isOpen;

    // if we're closing the dropdown, reset the search field
    if (!toVisible) {
      this.setState({isOpen: false}, () => {
        this.resetSearchValue();
      });
      return;
    }

    // if opening the dropdown, focus to the currently selected option
    this.setState({isOpen: true});
  }
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
    // this.props.onClickControl()
    this.toggleDropdown();
  }
  /**
   *
   */
  onBlurControl() {
    this.setState({
      isFocused: false,
    });
  }
  /**
   *
   */
  onFocusControl() {
    this.setState({isFocused: true});
  }
  /**
   * the input field value changed
   *
   * @param {SyntheticEvent) e
   */
  onChangeHandler(e) {
    this.props.onChange(e);
    this.setState({
      isOpen: true,
      searchValue: e.target.value,
    });
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
   * @param {Event} evt
   */
  handleKeyDown(evt) {
    const {
      focusedIdx,
      isFocused,
      isOpen,
    } = this.state;

    // enter
    if (evt.keyCode === keycodes.enter) {
      // if this is focused, we can open this if it is focused
      if (isFocused && !isOpen) {
        evt.preventDefault();
        this.toggleDropdown();
      }
    }

    // do nothing if dropdown is neither focused nor open
    if (!isFocused && !isOpen) {
      return;
    }

    // esc
    if (evt.keyCode === keycodes.escape) {
      evt.preventDefault();
      this.setState({isOpen: false});
    }

    // up
    if (evt.keyCode === keycodes.arrowup) {
      evt.preventDefault();
      this.setState({isOpen: true});

      if (focusedIdx === null) {
        this.moveFocusUp(this.props.options.length - 1);
      } else {
        this.moveFocusUp(focusedIdx - 1);
      }
    }
    // down
    if (evt.keyCode === keycodes.arrowdown) {
      evt.preventDefault();
      this.setState({isOpen: true});

      if (focusedIdx === null) {
        this.moveFocusDown(0);
      } else {
        this.moveFocusDown(focusedIdx + 1);
      }
    }

    // stop the bubbling of events while typing here
    evt.stopPropagation();
  }
  /**
   * @param {Number} idx
   */
  moveFocusUp(idx) {
    const filteredOptions = this.getFilteredOptions();
    const highestIdx = filteredOptions.length - 1;

    // handle going too low
    if (idx < 0) {
      return this.moveFocusUp(highestIdx);
    }

    // handle going too high
    if (idx > highestIdx) {
      return this.moveFocusUp(0);
    }

    // focus that element
    this.focusOption(idx);

    // valid, set it
    this.setState({focusedIdx: idx});
  }
  /**
   * @param {Number} idx
   */
  moveFocusDown(idx) {
    const filteredOptions = this.getFilteredOptions();
    const highestIdx = filteredOptions.length - 1;

    // handle going too low
    if (idx < 0) {
      return this.moveFocusDown(highestIdx);
    }

    // handle going too high
    if (idx > highestIdx) {
      return this.moveFocusDown(0);
    }

    // focus that element
    this.focusOption(idx);

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
  /**
   * finds the index of an option
   *
   * @param {Object} optionData
   * @returns {Number}
   */
  getIndexOfOption(optionData) {
    const {options} = this.props;
    return options.findIndex((option) => (option.id === optionData.id));
  }
  /**
   * @param {Number} idx
   */
  focusOption(idx) {
    const itemElement = this.listRef.current.children[idx];
    if (itemElement !== undefined) {
      itemElement.focus();
    }
  }
  /**
   * handles finding the `optionData` of using data of the currently selected
   *
   * @returns {Object | null | undefined}
   */
  findSelectedOption() {
    const {
      selectedIdx,
      selectedOption,
    } = this.props;

    if (selectedOption !== null && selectedOption !== undefined) {
      return this.findOptionHandler(selectedOption);
    }

    if (selectedIdx !== null && selectedIdx !== undefined) {
      return this.findOptionHandler(selectedIdx);
    }

    // nothing selected
    return null;
  }
  /**
   * handles determining which method to use to find the optionData
   *
   * @param {String | Object| Number} findParam
   * @returns {Object | null | undefined} - null means there was no way to find it, undefined means it was not found
   */
  findOptionHandler(findParam) {
    if (typeof findParam === 'string') {
      return this.findOptionByLabel(findParam);
    }

    if (typeof findParam === 'number') {
      return this.findOptionByIndex(findParam);
    }

    if (typeof findParam === 'object') {
      return this.findOptionByData(findParam);
    }

    // invalid way to find
    return null;
  }
  /**
   * @param {Object} optionData
   * @returns {*}
   */
  findOptionByData(optionData) {
    if (optionData === null) {
      return null;
    }

    const {options} = this.props;
    const foundOption = options.find((option) => (option.id === optionData.id));
    return foundOption;
  }
  /**
   * @param {Number} idx
   * @returns {*}
   */
  findOptionByIndex(idx) {
    if (idx === null) {
      return null;
    }

    const {options} = this.props;
    return options[idx];
  }
  /**
   * @param {String} label
   * @returns {*}
   */
  findOptionByLabel(label) {
    if (label === null) {
      return null;
    }

    const {options} = this.props;
    const foundOption = options.find((option) => (option.label === label));
    return foundOption;
  }
  /**
   * @param {Object | null} optionData
   * @returns {String | undefined}
   */
  findLabelOfOption(optionData) {
    if (optionData === null || optionData === undefined) {
      return undefined;
    }

    return optionData.label;
  }
  /**
   * @returns {Array}
   */
  getFilteredOptions() {
    const {
      options,
    } = this.props;

    const {
      searchValue,
    } = this.state;

    // find the selected option, which could be through many different ways
    //  check if none was found or the current option is invalid
    const selectedOption = this.findSelectedOption();
    const hasSelectedOption = selectedOption !== null && selectedOption !== undefined;

    // do not filter at all if nothing is typed
    //  or if the input value is the same as the selected option
    const useAllOptions = !hasSelectedOption ? false : selectedOption.label === searchValue;
    if (useAllOptions) {
      return options;
    }

    // we can filter by seeing if item's label contains the search value
    const filteredOptions = options.filter((option) => {
      const optionString = option.label.toLowerCase();
      const searchString = searchValue.toLowerCase();
      return optionString.includes(searchString);
    });

    return filteredOptions;
  }
  /**
   * find the y position to not obscure the dropdown
   *
   * @returns {Object}
   */
  calculateDropdownPositionStyle() {
    if (this.containerRef.current === null) {
      return undefined;
    }

    const dropdownOffset = this.containerRef.current.clientHeight + 5;

    const {maxHeight} = this.props;
    const containerRect = this.containerRef.current.getBoundingClientRect();

    // if list will be below the visible area of the window
    if (containerRect.bottom + maxHeight > window.innerHeight) {
      return {
        bottom: dropdownOffset,
      };
    }

    return {
      top: dropdownOffset,
    };
  }
  /**
   * sets the search value back to the selected value
   */
  resetSearchValue() {
    const selectedOption = this.findSelectedOption();
    const selectedOptionLabel = this.findLabelOfOption(selectedOption);

    const {options} = this.props;
    const selectedOptionIdx = (selectedOption !== null && selectedOption !== undefined) ? options.findIndex((option) => {
      return option.label === selectedOption || option.id === selectedOption.id;
    }) : undefined;

    this.setState({
      searchValue: selectedOptionLabel || '',
      focusedIdx: selectedOptionIdx || null,
    });
  }
}
/**
 * the visible input/button
 */
class DropdownControl extends PureComponent {
  static defaultProps = {
    /** @type {Boolean} */
    readOnly: false,
    /** @type {Function} */
    onClick: () => {},
  };
  /** @override */
  render() {
    const {
      onClick,
      readOnly,
      ...otherProps
    } = this.props;

    const controlModifierClassNames = readOnly ? 'cursor-pointer' : '';

    return (
      <div className='flex-row-center position-relative'>
        <input
          className={combineClassNames('flex-auto pad-1 text-ellipsis', controlModifierClassNames)}
          readOnly={readOnly}
          onClick={onClick}
          {...otherProps}
        />

        <div
          className='position-absolute pad-1 fsize-2 color-gray pevents-none flex-none'
          style={{right: '2px'}}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
    )
  }
}
/**
 * item in the list
 */
class DropdownItem extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'bor-t-1-light-gray pad-2 color-black hover:color-fourth focus:color-fourth cursor-pointer',
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

    const modifierClassNames = [
      isSelected ? 'bg-light-blue' : 'bg-white',
    ];

    return (
      <button
        className={combineClassNames(baseClassName, className, ...modifierClassNames)}
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
