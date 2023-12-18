import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class WhatsNewComponent {
  get closeModalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().accessibilityId(
          'whats-new-modal-close-button',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "whats-new-modal-close-button"',
        ),
      }),
    );
  }

  async closeModal(): Promise<void> {
    try {
      await (await this.closeModalButton).click();
    } catch (e) {
      console.log('No Whats New Modal to close, skipping: ', e.message);
    }
  }
}

const whatsNewComponent = new WhatsNewComponent();
export default whatsNewComponent;
