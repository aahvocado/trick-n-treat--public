import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {TILE_ID_NAME_LIST} from 'constants.shared/tileIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TileListDropdown(props) {
  return (
    <DropdownComponent
      options={TILE_ID_NAME_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
