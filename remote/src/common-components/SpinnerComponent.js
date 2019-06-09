import React from 'react';

import combineClassNames from 'utilities/combineClassNames';

/**
 * https://github.com/icarus-sullivan/react-spinner-material/blob/master/src/index.tsx
 *
 * @param {Object} props
 * @returns {React.Component}
 */
export default function Spinner(props) {
  const {
    className,
    spinnerColor = '#FFF',
    spinnerWidth = 5,
    size = 40,
    ...otherProps
  } = props;

  return (
    <div
      {...otherProps}
      className={combineClassNames('spinner', className)}
      style={{
        width: size,
        height: size,
        borderColor: spinnerColor,
        borderWidth: spinnerWidth
      }}
    />
  )
}
