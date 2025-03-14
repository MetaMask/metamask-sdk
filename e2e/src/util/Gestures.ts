import winston from 'winston';
import {
  getCoordinatesAsPercentage,
  getCoordinatesForDeviceFromPercentage,
} from './Utils';
import { ScreenPercentage } from './types';

// Create a Winston logger
const log = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [Gestures] ${level}: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

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
    const fromPercentage = await getCoordinatesForDeviceFromPercentage(from);
    const toPercentage = await getCoordinatesForDeviceFromPercentage(to);

    await driver
      .action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: fromPercentage.x, y: fromPercentage.y })
      .down()
      .move({ x: toPercentage.x, y: toPercentage.y })
      .up()
      .perform();
  }

  static async swipeAndroidByPercentage(
    from: ScreenPercentage,
    to: ScreenPercentage,
  ): Promise<void> {
    const [fromPercentage, toPercentage] = await getCoordinatesAsPercentage(
      from,
      to,
    );

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
    await Gestures.tapOnCoordinatesByPercentage({ x: 1, y: 40 });
  }

  static async tapOnCoordinatesByPercentage(
    location: ScreenPercentage,
  ): Promise<void> {
    log.debug(`Tapping on coordinates: ${location.x}, ${location.y}`);
    const tapLocation = await getCoordinatesForDeviceFromPercentage({
      x: location.x,
      y: location.y,
    });

    // TODO: use this for BrowserStack
    await driver.touchAction([
      {
        action: 'tap',
        x: tapLocation.x,
        y: tapLocation.y,
      },
    ]);

    // try {
    //   await driver
    //     .action('pointer', { parameters: { pointerType: 'touch' } })
    //     .move({ x: tapLocation.x, y: tapLocation.y })
    //     .down()
    //     .pause(100)
    //     .up()
    //     .perform();
    // } catch (error) {
    //   log.error(`Error tapping on coordinates: ${location.x}, ${location.y}`);
    //   log.error(error);
    // }
  }
}
