import React, { PureComponent } from 'react';

/**
 * displays character data
 */
export class CharacterComponent extends PureComponent {
  static defaultProps = {

  }
  /** @override */
  render() {
    return (
      <div className='position-relative width-full mar-ver-2'>

        <div className='mar-b-2'>
          hello world
        </div>

        <CharacterMenuComponent />

      </div>
    )
  }
}
/**
 *
 */
export class CharacterNameComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    name: '',
  }
  /** @override */
  render() {
    const { name } = this.props;

    return (
      <div className='position-absolute pos-l-0 pos-t-0 pad-2 bg-fourth fsize-6 color-primary text-center f-bold borradius-r-2 bor-1-primary'>
        { name }
      </div>
    )
  }
}
/**
 *
 */
export class CharacterMenuComponent extends PureComponent {
  /** @override */
  render() {

    return (
      <div className='flex-row-center'>
        <CharacterButtonComponent>
          Inventory
        </CharacterButtonComponent>

        <CharacterButtonComponent>
          Controller
        </CharacterButtonComponent>

        <CharacterButtonComponent>
          Friends
        </CharacterButtonComponent>
      </div>
    )
  }
}

/**
 *
 */
export class CharacterButtonComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    name: '',
  }
  /** @override */
  render() {

    return (
      <button
        className='bg-fourth fsize-4 color-primary text-center f-bold borradius-2 boxshadow-b-2-fifth pad-2 sibling-mar-l-1 cursor-pointer'
        style={{
          height: '120px',
          width: '100px',
        }}
      >
        { this.props.children }
      </button>
    )
  }
}

export default CharacterComponent;
