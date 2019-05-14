import React, { PureComponent } from 'react';

import ClassicButtonComponent from 'common-components/ClassicButtonComponent';

/**
 * displays list of inventory items
 */
export default class InventoryComponent extends PureComponent {
  static defaultProps = {
    /** @type {Array} */
    inventory: [],
    /** @type {Function} */
    onClickUseItem: () => {},
  }
  /** @override */
  render() {
    const {
      inventory,
      onClickUseItem
    } = this.props;

    return (
      <div className='position-relative width-full mar-v-2'>
        { inventory.map((itemData, idx) => (
          <InventoryItem
            key={`inventory-item-${idx}-key`}
            onClick={() => {
              onClickUseItem(itemData);
            }}
            {...itemData}
          />
        ))}
      </div>
    )
  }
}
/**
 *
 */
export class InventoryItem extends PureComponent {
  static defaultProps = {
    id: '',
    name: '',
    description: '',
    onClick: () => {},
  }
  /** @override */
  render() {
    const {
      // description,
      id,
      name,
      onClick,
    } = this.props;

    return (
      <div
        className='bor-1-gray bg-white flex-col pad-1'
      >
        <div className='flex-row'>
          <div className='flex-auto'>
            <div className='fsize-2 color-grayer'>{id}</div>
            <div className='fsize-4'>{name}</div>
          </div>

          <ClassicButtonComponent
            className='flex-none'
            onClick={onClick}
          >
            use
          </ClassicButtonComponent>
        </div>
      </div>
    )
  }
}
