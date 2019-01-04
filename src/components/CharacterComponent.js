import React, { PureComponent } from 'react';

import {WeaponModel} from 'models/ItemModel';
const demoInventory = [
  new WeaponModel({name: 'weapon 1'}),
  new WeaponModel({name: 'weapon 2'}),
  new WeaponModel({name: 'weapon 3'}),
  new WeaponModel({name: 'weapon 4'}),
  new WeaponModel({name: 'weapon 5'}),
  new WeaponModel({name: 'weapon 6'}),
  new WeaponModel({name: 'weapon 7'}),
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
      <div className='flex-row-centered mar-b-3'>
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
        <h3 className='fsize-4 pad-2'>Inventory</h3>

        <div className='grid-cols-3'>
          { list.map((model) => (
            <InventoryItemComponent
              key={model.id}
              model={model}
            />
          ))}
        </div>
      </div>
    )
  }
}
/**
 *
 */
export class InventoryItemComponent extends PureComponent {
  static defaultProps = {
    /** @type {ItemModel} */
    model: undefined,
  }
  /** @override */
  render() {
    const { model } = this.props;

    return (
      <div
        className='mar-1 borradius-2 bg-secondary-lighter boxshadow-b-1-primary cursor-pointer flex-row-centered'
        style={{
          height: '100px',
          width: '100px',
          margin: '5px auto',
        }}
      >
        { model.get('name') }
      </div>
    )
  }
}
export default CharacterComponent;
