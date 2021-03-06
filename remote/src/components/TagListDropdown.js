import React from 'react';

import DropdownComponent from 'common-components/DropdownComponent';

import {DESCRIPTORS_TAG_ID_LIST} from 'constants.shared/tagIds';

import l10n from 'utilities.shared/l10n';

/**
 *
 */
export default function TagListDropdown(props) {
  return (
    <DropdownComponent
      options={DESCRIPTORS_TAG_ID_LIST.map((item) => ({
        data: item,
        id: item,
        label: l10n(item),
      }))}
      {...props}
    />
  )
}
