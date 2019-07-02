import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { ITEM_DATA } from 'helpers.shared/itemDataHelper';

/**
 *
 */
export default function ItemListDropdown(props) {
  return (
    <DropdownComponent
      options={ITEM_DATA.map((item) => ({
        data: item,
        id: item.id,
        label: item.name,
      }))}
      {...props}
    />
  )
}
