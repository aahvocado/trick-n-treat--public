import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { TAG_ID_LIST } from 'constants.shared/tagConstants';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TagListDropdown(props) {
  return (
    <DropdownComponent
      options={TAG_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
