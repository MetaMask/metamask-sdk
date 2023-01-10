import { MetamaskElement } from './Selectors';

const Actions = {
  LONG_PRESS: 'longPress',
  MOVE_TO: 'moveTo',
  RELEASE: 'release',
  WAIT: 'wait',
  TAP: 'tap',
  DOUBLE_TAP: 'doubleTap',
};

type BrowserSize = {
  width: number;
  height: number;
};

export default class Gestures {
  static async tap(element: MetamaskElement, tapType = 'tap'): Promise<void> {
    switch (tapType) {
      case 'TAP':
        (await element).touchAction(Actions.TAP);
        break;
      case 'LONGPRESS':
        (await element).touchAction(Actions.LONG_PRESS);
        break;
      case 'RELEASE':
        (await element).touchAction(Actions.RELEASE);
        break;
      case 'WAIT':
        (await element).touchAction(Actions.WAIT);
        break;
      case 'MOVETO':
        (await element).touchAction(Actions.MOVE_TO);
        break;
      default:
        throw new Error('Tap type not found');
    }
  }

  static async swipeByPercentage(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) {
    if (driver.isIOS) {
      await this.swipeIOSByPercentage(from, to);
    } else {
      await this.swipeAndroidByPercentage(from, to);
    }
  }

  static async swipeIOSByPercentage(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): Promise<void> {
    const DEVICE_SIZE: BrowserSize = await driver.getWindowSize();
    const x1 = Math.round((DEVICE_SIZE.width * from.x) / 100);
    const y1 = Math.round((DEVICE_SIZE.height * from.y) / 100);
    const x2 = Math.round((DEVICE_SIZE.width * to.x) / 100);
    const y2 = Math.round((DEVICE_SIZE.height * to.y) / 100);
    await browser.touchAction([
      { action: 'press', x: x1, y: y1 },
      { action: 'wait', ms: 2000 },
      { action: 'moveTo', x: x2, y: y2 },
      'release',
    ]);
  }

  static async swipeAndroidByPercentage(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): Promise<void> {
    const DEVICE_SIZE: BrowserSize = await driver.getWindowSize();
    const x1 = Math.round((DEVICE_SIZE.width * from.x) / 100);
    const y1 = Math.round((DEVICE_SIZE.height * from.y) / 100);
    const x2 = Math.round((DEVICE_SIZE.width * to.x) / 100);
    const y2 = Math.round((DEVICE_SIZE.height * to.y) / 100);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pause', duration: 1000 },
          { type: 'pointerMove', duration: 0, x: x1, y: y1 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 1000, x: x2, y: y2 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  }
}
