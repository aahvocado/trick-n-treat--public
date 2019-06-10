import React, { PureComponent } from 'react';

import ButtonComponent from 'common-components/ButtonComponent';

/**
 * displays list of inventory items
 */
export default class InventoryComponent extends PureComponent {
  static defaultProps = {
    /** @type {Array<ItemData>} */
    inventoryList: [],
    /** @type {Function} */
    onClickUseItem: () => {},
  }
  /** @override */
  render() {
    const {
      inventoryList,
      onClickUseItem
    } = this.props;

    return (
      <div className='position-relative overflow-auto width-full mar-v-2'>
        { inventoryList.map((itemData, idx) => {
          return (
            <InventoryItem
              key={`inventory-item-${idx}-key`}
              onClick={() => {
                onClickUseItem(itemData);
              }}
              {...itemData}
            />
          )
        })}
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
      isUseable,
      name,
      onClick,
      canBeUsed,
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

          { isUseable &&
            <ButtonComponent
              className='flex-none'
              disabled={!canBeUsed}
              onClick={onClick}
            >
              use
            </ButtonComponent>
          }
        </div>
      </div>
    )
  }
}
