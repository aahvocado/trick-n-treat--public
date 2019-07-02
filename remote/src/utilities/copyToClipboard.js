/**
 * copies string to clipboard
 *
 * @param {String} text
 */
export default function copyToClipboard(text) {
  const inputEl = document.createElement("input");
  inputEl.value = text;

  const rootEl = document.getElementById('root');
  rootEl.appendChild(inputEl);
  inputEl.select();

  document.execCommand("copy");

  inputEl.remove();
}
