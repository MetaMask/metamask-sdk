import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class OptinMetricsScreen {
  get acceptOptinMetrics(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="optin-metrics-i-agree-button-id"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "I agree"'),
      }),
    );
  }

  async tapAgreeOptinMetrics(): Promise<void> {
    if (!(await this.isAcceptOptinMetricsEnabled())) {
      await Gestures.swipeByPercentage({ x: 50, y: 50 }, { x: 50, y: 5 });
    }
    await (await this.acceptOptinMetrics).click();
  }

  async isAcceptOptinMetricsEnabled(): Promise<boolean> {
    return (await this.acceptOptinMetrics).isEnabled();
  }
}

const optinMetricsScreen = new OptinMetricsScreen();
export default optinMetricsScreen;
