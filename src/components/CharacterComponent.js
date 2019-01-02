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
        <CharacterNameComponent name='Daidan' />

        <CharacterMenuComponent />

        <div>
          hello world
        </div>

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
      <div className='position-absolute pos-l-0 pos-t-0 pad-2 bg-fourth fsize-6 color-primary text-center f-bold borradius-r-2 boxshadow-b-2-fifth'>
        { name }
      </div>
    )
  }
}
/**
 *
 */
export class CharacterMenuComponent extends PureComponent {
  static defaultProps = {

  }
  /** @override */
  render() {

    return (
      <div className='position-absolute pos-r-0 pos-t-0 flex-col'>
        <CharacterButtonComponent>
          Inventory
        </CharacterButtonComponent>

        <CharacterButtonComponent>
          Friends
        </CharacterButtonComponent>

        <CharacterButtonComponent>
          Stats
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
      <button className='bg-fourth fsize-4 color-primary text-left f-bold borradius-l-2 boxshadow-b-2-fifth pad-2 sibling-mar-t-4 cursor-pointer'>
        { this.props.children }
      </button>
    )
  }
}

export default CharacterComponent;
