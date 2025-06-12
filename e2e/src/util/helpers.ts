/*
 * @deprecated until CI workflow is done
 * Dynamically infers the path of the other apps to be installed on the device
 * based on the SDK_TYPE environment variable
 */
export const getOtherAppsPath = () => {
  const SDK_TYPE = process.env.SDK_TYPE as string;

  const otherAppsPaths = [];
  switch (SDK_TYPE) {
    case 'js':
      otherAppsPaths.push(process.env.RN_TEST_APP_PATH ?? '');
      break;
    case 'androidsdk':
      otherAppsPaths.push(process.env.ANDROID_SDK_TEST_APP_PATH ?? '');
      break;
    default:
      break;
  }
  return otherAppsPaths;
};
