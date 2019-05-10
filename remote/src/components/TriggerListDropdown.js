import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import { ENCOUNTER_TRIGGER_ID_LIST } from 'constants.shared/encounterTriggers';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TriggerListDropdown(props) {
  return (
    <DropdownComponent
      options={ENCOUNTER_TRIGGER_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
