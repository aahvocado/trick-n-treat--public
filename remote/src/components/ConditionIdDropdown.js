import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { CONDITION_ID_LIST } from 'constants.shared/conditionConstants';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function ActionListDropdown(props) {
  return (
    <DropdownComponent
      options={CONDITION_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
