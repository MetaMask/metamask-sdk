import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class MetaMetricsComponent {
  get agreeToMetaMetrics(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (await this.agreeToMetaMetrics).click();
  }
}

const metaMetricsComponent = new MetaMetricsComponent();
export default metaMetricsComponent;
