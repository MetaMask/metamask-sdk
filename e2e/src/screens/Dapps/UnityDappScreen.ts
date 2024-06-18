import { UnityDappElement } from '../../types';
import Gestures from '../../Gestures';
import { Dapp } from '../interfaces/Dapp';

class UnityDappScreen implements Dapp {
  get connectButton(): UnityDappElement {
    return new UnityDappElement({ x: 50.24, y: 62.63 });
  }

  get terminateButton(): UnityDappElement {
    return new UnityDappElement({ x: 27.29, y: 66.66 });
  }

  get signButton(): UnityDappElement {
    return new UnityDappElement({ x: 0, y: 0 }); // TODO
  }

  async connect(): Promise<void> {
    await Gestures.tapOnCoordinatesByPercentage({
      x: this.connectButton.xPercentage,
      y: this.connectButton.yPercentage,
    });
  }

  async sign(): Promise<void> {
    await Gestures.tapOnCoordinatesByPercentage({
      x: this.signButton.xPercentage,
      y: this.signButton.yPercentage,
    });
  }

  async terminate(): Promise<void> {
    await Gestures.tapOnCoordinatesByPercentage({
      x: this.terminateButton.xPercentage,
      y: this.terminateButton.yPercentage,
    });
  }
}

const unityDappScreen = new UnityDappScreen();
export default unityDappScreen;
