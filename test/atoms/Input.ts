import { IInput } from '../interfaces/IInuput';

export class Input implements IInput<string> {
  e: WebdriverIO.Element;

  constructor(selector: string) {
    this.e = $(selector);
  }

  async setValue(value: string): Promise<void> {
    await this.e.addValue(value);
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
