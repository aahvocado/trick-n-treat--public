import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {
  TARGET_ID_LIST,
  CONDITION_TARGET_ID_LIST,
  TRIGGER_TARGET_ID_LIST,
} from 'constants.shared/targetIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TargetListDropdown(props) {
  return (
    <DropdownComponent
      options={TARGET_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
/**
 *
 */
export function ConditionTargetListDropdown(props) {
  return (
    <DropdownComponent
      options={CONDITION_TARGET_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
/**
 *
 */
export function TriggerTargetListDropdown(props) {
  return (
    <DropdownComponent
      options={TRIGGER_TARGET_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
