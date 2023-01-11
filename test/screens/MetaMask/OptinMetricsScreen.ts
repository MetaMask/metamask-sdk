import { Button } from '../../atoms/Button';

class OptinMetricsScreen {
  private get noThanksOptinMetrics(): Button {
    return new Button({
      androidSelector: '~optin-metrics-no-thanks-button-id',
      iOSSelector: '~optin-metrics-no-thanks-button-id',
    });
  }

  async tapNoThanksOptinMetrics(): Promise<void> {
    await this.noThanksOptinMetrics.tap();
  }
}
export default OptinMetricsScreen;
