import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';

import { getDeviceCoordinates } from './utils';
import { ScreenPercentage, Coordinates } from './types';
import { Actions, ActionTypes, ActionSource } from './constants';

// Currently broken with the latest XCUITest
const swipeIOSByPercentage = async (
  from: ScreenPercentage,
  to: ScreenPercentage,
): Promise<void> => {
  const fromPercentage = (await getDeviceCoordinates(from)) as Coordinates;
  const toPercentage = (await getDeviceCoordinates(to)) as Coordinates;

  await driver
    .action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x: fromPercentage.x, y: fromPercentage.y })
    .down()
    .move({ x: toPercentage.x, y: toPercentage.y })
    .up()
    .perform();
};

const swipeAndroidByPercentage = async (
  from: ScreenPercentage,
  to: ScreenPercentage,
): Promise<void> => {
  const [fromPercentage, toPercentage] = (await getDeviceCoordinates({
    from,
    to,
  })) as [Coordinates, Coordinates];

  await driver.performActions([
    {
      type: ActionTypes.POINTER,
      id: ActionSource.FINDER_1,
      actions: [
        { type: 'pause', duration: 1000 },
        {
          type: Actions.POINTER_MOVE,
          duration: 0,
          x: fromPercentage.x,
          y: fromPercentage.y,
        },
        { type: Actions.POINTER_DOWN, button: 0 },
        { type: Actions.PAUSE, duration: 100 },
        {
          type: Actions.POINTER_MOVE,
          duration: 1000,
          x: toPercentage.x,
          y: toPercentage.y,
        },
        { type: Actions.POINTER_UP, button: 0 },
      ],
    },
  ]);
};

export const swipeByPercentage = async (
  from: ScreenPercentage,
  to: ScreenPercentage,
) => {
  if (driver.isIOS) {
    await swipeIOSByPercentage(from, to);
  } else {
    await swipeAndroidByPercentage(from, to);
  }
};

export const tapDeviceKey = async (key: string): Promise<void> => {
  await driver.performActions([
    {
      type: ActionTypes.KEY,
      id: ActionSource.KEYBOARD,
      actions: [
        { type: Actions.KEY_DOWN, value: key },
        { type: Actions.PAUSE, duration: 100 },
        { type: Actions.KEY_UP, value: key },
      ],
    },
  ]);
};

export const tapOnCoordinatesByPercentage = async (
  location: ScreenPercentage,
): Promise<void> => {
  const tapLocation = (await getDeviceCoordinates(location)) as Coordinates;

  // TODO: use this for BrowserStack
  await driver.touchAction([
    {
      action: 'tap',
      x: tapLocation.x,
      y: tapLocation.y,
    },
  ]);
};

export const hideKeyboardWithTap = async (): Promise<void> => {
  await tapOnCoordinatesByPercentage({ x: 1, y: 40 });
};

export const swipeToElement = async (element: ChainablePromiseElement) => {
  let isElementDisplayed = await element.isDisplayed();

  while (!isElementDisplayed) {
    await swipeByPercentage({ x: 50, y: 70 }, { x: 50, y: 5 });
    isElementDisplayed = await element.isDisplayed();
  }
};
