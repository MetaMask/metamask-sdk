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
  PRESS: 'press',
  POINTER_MOVE: 'pointerMove',
  POINTER_DOWN: 'pointerDown',
  POINTER_UP: 'pointerUp',
};

const ActionTypes = {
  POINTER: 'pointer',
  KEY: 'key',
};

const ActionSource = {
  KEYBOARD: 'keyboard',
  FINDER_1: 'finger1',
};

export default class Gestures {
  static async swipeByPercentage(from: ScreenPercentage, to: ScreenPercentage) {
    if (driver.isIOS) {
      await this.swipeIOSByPercentage(from, to);
    } else {
      await this.swipeAndroidByPercentage(from, to);
    }
  }

  // Currently broken with the latest XCUITest
  static async swipeIOSByPercentage(
    from: ScreenPercentage,
    to: ScreenPercentage,
  ): Promise<void> {
    const fromPercentage = await Utils.getCoordinatesForDeviceFromPercentage(
      from,
    );
    const toPercentage = await Utils.getCoordinatesForDeviceFromPercentage(to);

    await driver.touchAction([
      {
        action: Actions.PRESS as ActionTypes,
        x: fromPercentage.x,
        y: fromPercentage.y,
      },
      { action: Actions.WAIT as ActionTypes, ms: 1000 },
      {
        action: Actions.MOVE_TO as ActionTypes,
        x: toPercentage.x,
        y: toPercentage.y,
      },
      {
        action: Actions.RELEASE as ActionTypes,
      }
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
  }

  static async tapDeviceKey(key: string): Promise<void> {
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
    console.log('tapLocation', tapLocation);
    await browser.action("pointer")
      .move({
        x: tapLocation.x,
        y: tapLocation.y,
        origin: 'viewport'
      })
      .down()
      .pause(100)
      .up()
      .perform();
    // await browser.touchAction({
    //   action: Actions.TAP as ActionTypes,
    //   x: tapLocation.x,
    //   y: tapLocation.y,
    // });
  }
}
