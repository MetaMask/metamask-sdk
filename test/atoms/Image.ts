import { MetamaskElement } from '../utils/Selectors';

export class Image {
  e: MetamaskElement;

  constructor(selector: string) {
    const platform = driver.isAndroid ? 'android' : 'ios';
    if (platform === 'android') {
      this.e = $(`~${selector}`);
    } else {
      this.e = $(`-ios class chain:${selector}`);
    }
  }

  async isDisplayed(): Promise<boolean> {
    return await this.e.isDisplayed();
  }

  async isVisible(): Promise<boolean> {
    return await this.e.isDisplayedInViewport();
  }
}
