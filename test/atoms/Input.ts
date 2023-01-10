import { IInput } from '../interfaces/IInuput';

export class Input implements IInput<string> {
  e: WebdriverIO.Element;

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

  async setValue(value: string): Promise<void> {
    await this.e.setValue(value);
  }

  async getValue(): Promise<string> {
    return this.e.getAttribute('value');
  }

  async clear(): Promise<void> {
    try {
      this.e.clearValue();
    } catch (e) {
      console.log(`Error clearing input: ${e}`);
    }
  }

  async waitForInputEnabled(): Promise<void> {
    await this.e.waitForExist();
    await this.e.waitForEnabled();
  }

  async isDisplayed(): Promise<boolean> {
    return this.e.isDisplayed();
  }
}
