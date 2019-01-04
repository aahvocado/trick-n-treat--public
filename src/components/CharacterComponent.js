import React, { PureComponent } from 'react';

import {WeaponModel} from 'models/ItemModel';
const demoInventory = [
  new WeaponModel({name: 'weapon 1'}),
  new WeaponModel({name: 'weapon 2'}),
  new WeaponModel({name: 'weapon 3'}),
]

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
        <CharacterMenuComponent />
        <CharacterInventoryComponent list={demoInventory} />
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
      <div className='flex-row-center mar-b-3'>
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
/**
 *
 */
export class CharacterInventoryComponent extends PureComponent {
  static defaultProps = {
    /** @type {Array<ItemModel>} */
    list: [],
  }
  /** @override */
  render() {
    const { list } = this.props;

    return (
      <div className='bg-secondary'>
        <h3>Inventory</h3>

        <div className='flex-row'>
          { list.map((model) => (
            <div>{model.get('name')}</div>
          ))}
        </div>
      </div>
    )
  }
}

export default CharacterComponent;
