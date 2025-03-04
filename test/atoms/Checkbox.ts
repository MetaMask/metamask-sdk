import { ICheckbox } from '../interfaces/ICheckbox';
import { MetamaskElement } from '../utils/Selectors';

export class Checkbox implements ICheckbox {
  e: MetamaskElement;

  constructor({
    androidSelector,
    iOSSelector,
  }: {
    androidSelector?: string;
    iOSSelector?: string;
  }) {
    const platform = driver.isAndroid ? 'android' : 'ios';
    if (platform === 'android' && androidSelector) {
      this.e = $(`${androidSelector}`);
    } else if (platform === 'ios' && iOSSelector) {
      if (iOSSelector.startsWith('~')) {
        this.e = $(`${iOSSelector}`);
      } else {
        this.e = $(`-ios class chain:${iOSSelector}`);
      }
    } else {
      throw new Error(`No selector provided for platform ${platform}`);
    }
  }

  async tap(): Promise<void> {
    await this.e.click();
  }
}
