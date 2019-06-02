import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {TRIGGER_LOGIC_ID_LIST} from 'constants.shared/triggerLogicIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TriggerLogicListDropdown(props) {
  return (
    <DropdownComponent
      options={TRIGGER_LOGIC_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
