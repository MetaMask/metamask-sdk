import { SDK_TYPE } from '../Constants';

export const getOtherAppsPath = () => {
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
