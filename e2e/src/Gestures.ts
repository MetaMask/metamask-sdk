import { ActionTypes } from 'webdriverio';

import Utils from './Utils';
import { ScreenPercentage } from './types';

const Actions = {
  LONG_PRESS: 'longPress',
  MOVE_TO: 'moveTo',
  RELEASE: 'release',
  WAIT: 'wait',
  TAP: 'tap',
  DOUBLE_TAP: 'doubleTap',
  KEY_DOWN: 'keyDown',
  KEY_UP: 'keyUp',
  PAUSE: 'pause',
};

export default class Gestures {
  static async swipeByPercentage(from: ScreenPercentage, to: ScreenPercentage) {
    if (driver.isIOS) {
      await this.swipeIOSByPercentage(from, to);
    } else {
      await this.swipeAndroidByPercentage(from, to);
    }
  }

  static async swipeIOSByPercentage(
    from: ScreenPercentage,
    to: ScreenPercentage,
  ): Promise<void> {
    const fromPercentage = await Utils.getCoordinatesForDeviceFromPercentage(
      from,
    );
    const toPercentage = await Utils.getCoordinatesForDeviceFromPercentage(to);

    await browser.touchAction([
      { action: 'press', x: fromPercentage.x, y: fromPercentage.y },
      { action: 'wait', ms: 2000 },
      { action: 'moveTo', x: toPercentage.x, y: toPercentage.y },
      'release',
    ]);
  }

  /*
   * Rename this if it works for iOS too
   * */
  static async swipeAndroidByPercentage(
    from: ScreenPercentage,
    to: ScreenPercentage,
  ): Promise<void> {
    const [fromPercentage, toPercentage] =
      await Utils.getCoordinatesAsPercentage(from, to);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pause', duration: 1000 },
          {
            type: 'pointerMove',
            duration: 0,
            x: fromPercentage.x,
            y: fromPercentage.y,
          },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          {
            type: 'pointerMove',
            duration: 1000,
            x: toPercentage.x,
            y: toPercentage.y,
          },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  }

  static async tapDeviceKey(key: string): Promise<void> {
    await driver.performActions([
      {
        type: 'key',
        id: 'keyboard',
        actions: [
          { type: Actions.KEY_DOWN, value: key },
          { type: Actions.PAUSE, duration: 100 },
          { type: Actions.KEY_UP, value: key },
        ],
      },
    ]);
  }

  static async hideKeyboardWithTap(): Promise<void> {
    // tap with coordinates x: 1% of the screen width, y: 40% of the screen height
    const tapLocation = await Utils.getCoordinatesForDeviceFromPercentage({
      x: 1,
      y: 40,
    });

    await driver.touchAction({
      action: Actions.TAP as ActionTypes,
      x: tapLocation.x,
      y: tapLocation.y,
    });
  }

  static async tapOnCoordinatesByPercentage(
    location: ScreenPercentage,
  ): Promise<void> {
    const tapLocation = await Utils.getCoordinatesForDeviceFromPercentage({
      x: location.x,
      y: location.y,
    });
    await browser.touchAction({
      action: Actions.TAP as ActionTypes,
      x: tapLocation.x,
      y: tapLocation.y,
    });
  }
}
