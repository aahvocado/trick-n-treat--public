import React, { PureComponent } from 'react';

import ButtonComponent from 'common-components/ButtonComponent';
import FixedMenuComponent from 'common-components/FixedMenuComponent';

/**
 * slidey menu for inventory
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
      onClickUseItem,
      ...otherProps
    } = this.props;

    return (
      <FixedMenuComponent
        className='bg-secondary flex-col aitems-center width-full talign-center'
        style={{
          boxShadow: '0 5px 3px 3px rgba(0, 0, 0, 0.4)',
          width: '150px',
        }}
        direction='right'
        location='right'
        {...otherProps}
      >
        <InventoryList
          inventoryList={inventoryList}
          onClickUseItem={onClickUseItem}
        />
      </FixedMenuComponent>
    )
  }
}
/**
 * displays list of inventory items
 */
export class InventoryList extends PureComponent {
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
