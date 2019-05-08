import constantsLocalization from 'data.shared/constantsLocalization.json';

/**
 * gets you the localized string
 *
 * @param {String} key
 * @returns {String}
 */
export default function l10n(key) {
  const localizedString = constantsLocalization[key];

  // if no translation was found we just return the key
  if (localizedString === undefined) {
    return key;
  }

  return localizedString;
}
