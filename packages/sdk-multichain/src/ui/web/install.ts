import { AbstractInstallModal, type InstallWidgetProps } from '../../domain';

export class InstallModal extends AbstractInstallModal {
  instance!: HTMLMmInstallModalElement;

  async render(options: InstallWidgetProps) {
    const modal = document.createElement('mm-install-modal') as HTMLMmInstallModalElement;

    modal.link = options.link;
    modal.preferDesktop = options.preferDesktop;
    modal.sdkVersion = options.sdkVersion;
    modal.addEventListener('close', ({ detail: { shouldTerminate } }) => options.onClose(shouldTerminate));

    modal.addEventListener('startDesktopOnboarding', options.metaMaskInstaller.startDesktopOnboarding);

    modal.addEventListener('trackAnalytics', ((e: CustomEvent) => options.onAnalyticsEvent?.(e.detail)) as EventListener);

    return {
      mount: () => {
        options.parentElement?.appendChild(modal);
        this.instance = modal;
      },
      unmount: () => {
        if (options.parentElement?.contains(modal)) {
          options.parentElement.removeChild(modal);
        }
      },
    };
  }
}
