import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {TILE_ID_NAME_MAP, TILE_ID_STRING_LIST} from 'constants.shared/tileIds';

// import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TileListDropdown(props) {
  return (
    <DropdownComponent
      options={TILE_ID_STRING_LIST.map((item) => ({
        data: item,
        id: item,
        label: TILE_ID_NAME_MAP[item],
      }))}
      {...props}
    />
  )
}
