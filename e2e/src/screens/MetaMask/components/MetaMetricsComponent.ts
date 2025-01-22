import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class MetaMetricsComponent {
  get agreeToMetaMetrics(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath('//*[@text="I agree"]'),
        // TODO
        iosSelector: IOSSelector.by().predicateString(
          'name == "experience-enhancer-modal-accept-button"',
        ),
      }),
    );
  }

  async tapAgreeToMetaMetrics(): Promise<void> {
    try {
      await this.agreeToMetaMetrics.click();
    } catch (e) {
      console.error(
        'Error agreeing to MetaMetrics. Assuming it wasnt displayed and wont be: ',
        e,
      );
    }
  }
}

const metaMetricsComponent = new MetaMetricsComponent();
export default metaMetricsComponent;
