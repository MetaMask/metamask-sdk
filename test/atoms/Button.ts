import { IButton } from '../interfaces/IButton';
import { MetamaskElement } from '../utils/Selectors';

export class Button implements IButton<string> {
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
      this.e = $(`-ios class chain:${iOSSelector}`);
    } else {
      throw new Error(`No selector provided for platform ${platform}`);
    }
  }

  async getText(): Promise<any> {
    return await this.e.getText();
  }

  async waitForClickable(): Promise<void> {
    this.e.waitForClickable({ timeout: 70000 });
  }

  async waitForDisplayed(): Promise<void> {
    this.e.waitForDisplayed({ timeout: 70000 });
  }

  async isDisplayed(): Promise<boolean> {
    return await this.e.isDisplayed();
  }

  async isClickable(): Promise<boolean> {
    return this.e.isClickable();
  }

  async tap(): Promise<void> {
    await this.waitForDisplayed();
    await this.waitForClickable();
    await this.e.click();
  }
}
