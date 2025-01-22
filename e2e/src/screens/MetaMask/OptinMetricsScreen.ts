import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '@util/Gestures';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class OptinMetricsScreen {
  get acceptOptinMetrics(): ChainablePromiseElement {
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
    await this.acceptOptinMetrics.click();
  }

  async isAcceptOptinMetricsEnabled(): Promise<boolean> {
    return this.acceptOptinMetrics.isEnabled();
  }
}

const optinMetricsScreen = new OptinMetricsScreen();
export default optinMetricsScreen;
