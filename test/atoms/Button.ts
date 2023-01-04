import { IButton } from '../interfaces/IButton';
import { MetamaskElement } from '../utils';

export class Button implements IButton<string> {
  e: MetamaskElement;

  constructor(selector: string) {
    this.e = $(selector);
  }

  async getText(): Promise<any> {
    return await this.e.getText();
  }

  async waitForClickable(): Promise<void> {
    this.e.waitForClickable();
  }

  async waitForDisplayed(): Promise<void> {
    this.e.waitForDisplayed();
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
