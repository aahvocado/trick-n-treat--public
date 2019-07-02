import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {
  CONDITION_LOGIC_ID_LIST,
  ITEM_CONDITION_LOGIC_ID_LIST,
  NUMBER_CONDITION_LOGIC_ID_LIST,
} from 'constants.shared/conditionLogicIds';

import l10n from 'utilities.shared/l10n';

function getOptions(type) {
  if (type === 'item') {
    return ITEM_CONDITION_LOGIC_ID_LIST;
  }
  if (type === 'number') {
    return NUMBER_CONDITION_LOGIC_ID_LIST;
  }

  return CONDITION_LOGIC_ID_LIST;
}
/**
 *
 */
export default function ConditionLogicDropdown(props) {
  const options = getOptions(props.type);

  return (
    <DropdownComponent
      options={options.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
