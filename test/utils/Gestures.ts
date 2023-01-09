import { MetamaskElement } from './Selectors';

const Actions = {
  LONG_PRESS: 'longPress',
  MOVE_TO: 'moveTo',
  RELEASE: 'release',
  WAIT: 'wait',
  TAP: 'tap',
  DOUBLE_TAP: 'doubleTap',
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

  static async swipe(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): Promise<void> {
    await driver.performActions([
      {
        // a. Create the event
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pause', duration: 1000 },
          // b. Move finger into start position
          { type: 'pointerMove', duration: 0, x: from.x, y: from.y },
          // c. Finger comes down into contact with screen
          { type: 'pointerDown', button: 0 },
          // d. Pause for a little bit
          { type: 'pause', duration: 100 },
          // e. Finger moves to end position
          //    We move our finger from the center of the element to the
          //    starting position of the element.
          //    Play with the duration to make the swipe go slower / faster
          { type: 'pointerMove', duration: 1000, x: to.x, y: to.y },
          // f. Finger gets up, off the screen
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  }
}
