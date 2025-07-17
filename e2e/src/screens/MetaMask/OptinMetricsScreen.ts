import { ChainablePromiseElement } from 'webdriverio';

import { swipeByPercentage } from '@util/gestures';
import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector, IOSSelector } from '@util/selectors';

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
      await swipeByPercentage({ x: 50, y: 50 }, { x: 50, y: 5 });
    }
    await this.acceptOptinMetrics.click();
  }

  async isAcceptOptinMetricsEnabled(): Promise<boolean> {
    return this.acceptOptinMetrics.isEnabled();
  }
}

const optinMetricsScreen = new OptinMetricsScreen();
export default optinMetricsScreen;
