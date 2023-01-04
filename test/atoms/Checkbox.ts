import { ICheckbox } from '../interfaces/ICheckbox';
import { MetamaskElement } from '../utils';

export class Checkbox implements ICheckbox {
  e: MetamaskElement;

  constructor(selector: string) {
    this.e = $(selector);
  }

  async tap(): Promise<void> {
    await this.e.click();
  }
}
