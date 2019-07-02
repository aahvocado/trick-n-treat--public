export const enableLogging = true;

export function consoleLog(override, ...values) {
  if (enableLogging || override) {
    console.log(values);
  }
}

export default consoleLog;
