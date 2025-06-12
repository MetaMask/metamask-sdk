import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class WhatsNewComponent {
  get closeModalButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.ViewGroup[@resource-id="whats-new-modal-close-button"]',
        ),
        iosSelector: IOSSelector.by().accessibilityId(
          'whats-new-modal-close-button',
        ),
      }),
    );
  }

  async closeModal(): Promise<void> {
    try {
      await this.closeModalButton.waitForEnabled({
        timeout: 10000,
      });
      await this.closeModalButton.click();
    } catch (e) {
      console.log('No Whats New Modal to close, skipping: ', e.message);
    }
  }
}

const whatsNewComponent = new WhatsNewComponent();
export default whatsNewComponent;
