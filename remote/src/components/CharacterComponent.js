import React, { PureComponent } from 'react';

const demoInventory = ['item 1', 'item 2', 'item 3', 'item 4'];

/**
 * displays character data
 */
export class CharacterComponent extends PureComponent {
  static defaultProps = {

  }
  /** @override */
  render() {
    return (
      <div className='position-relative width-full mar-v-2'>
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
        className='fsize-4 color-primary text-center f-bold borradius-2 bg-fifth boxshadow-b-2-fourth pad-2 sibling-mar-l-1 cursor-pointer'
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
  /** @override */
  render() {
    return (
      <div
        className='mar-1 borradius-2 bg-secondary-lighter boxshadow-b-1-primary cursor-pointer flex-row-center'
        style={{
          height: '100px',
          width: '100px',
          margin: '5px auto',
        }}
      >
        { this.props.model }
      </div>
    )
  }
}
export default CharacterComponent;
