import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { CONDITION_LOGIC_ID_LIST } from 'constants.shared/conditionLogicIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function ConditionLogicDropdown(props) {
  return (
    <DropdownComponent
      options={CONDITION_LOGIC_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
