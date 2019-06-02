import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { CHOICE_ID_LIST } from 'constants.shared/choiceIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function ActionListDropdown(props) {
  return (
    <DropdownComponent
      options={CHOICE_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
