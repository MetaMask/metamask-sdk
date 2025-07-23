import MetaMaskOnboarding from '@metamask/onboarding';
import { getPlatformType, getVersion, type InstallWidgetProps, ModalFactory, type PendingWidgetProps, PlatformType, type RenderedModal, type SelectWidgetProps } from '../domain';

let __instance: typeof import('@metamask/sdk-install-modal-web/dist/loader/index.js') | undefined;

/**
 * Preload install modal custom elements only once
 */
export async function preload() {
  __instance ??= await import('@metamask/sdk-install-modal-web/dist/loader/index.js')
    .then((loader) => {
      loader.defineCustomElements();
      return Promise.resolve(loader);
    })
    .catch((error) => {
      console.error(`Gracefully Failed to load modal customElements:`, error);
      return Promise.resolve(undefined);
    });
}

export class UIModule extends ModalFactory {
  private modal!: RenderedModal;
  private readonly platform: PlatformType = getPlatformType();
  private onAnalyticsEvent(evt: any) {
    //TODO: finish implementation for Analytics
    console.log('onAnalyticsEvent', evt);
  }
  private unload() {
    if (this.modal) {
      this.modal.unmount();
    }
  }

  /**
   * Determines if the current platform is a mobile native environment.
   * Currently only includes React Native.
   */
  get isMobile() {
    return this.platform === PlatformType.ReactNative;
  }

  /**
   * Determines if the current platform is a Node.js environment.
   * Used for server-side or non-browser environments.
   */
  get isNode() {
    return this.platform === PlatformType.NonBrowser;
  }

  /**
   * Determines if the current platform is a web environment.
   * Includes desktop web, MetaMask mobile webview, and mobile web.
   */
  get isWeb() {
    return this.platform === PlatformType.DesktopWeb || this.platform === PlatformType.MetaMaskMobileWebview || this.platform === PlatformType.MobileWeb;
  }

  private getContainer() {
    return typeof document === 'undefined' ? undefined : document.createElement('div');
  }

  private getMountedContainer() {
    if (typeof document === 'undefined') {
      return undefined;
    }
    const container = this.getContainer();
    if (container) {
      document.body.appendChild(container);
    }
    return container;
  }

  public async renderInstallModal(link: string, preferDesktop: boolean) {
    await preload();
    const container = this.getMountedContainer();
    const modalProps: InstallWidgetProps = {
      onAnalyticsEvent: this.onAnalyticsEvent.bind(this),
      onClose: this.unload.bind(this),
      metaMaskInstaller: {
        startDesktopOnboarding: () => {
          new MetaMaskOnboarding().startOnboarding();
          this.modal.unmount();
        },
      },
      parentElement: container,
      link,
      preferDesktop,
      sdkVersion: getVersion(),
    };
    this.modal = await this.options.installModal.render(modalProps);
    this.modal.mount();
  }

  public async renderPendingModal() {
    await preload();
    const container = this.getMountedContainer();
    const modalProps: PendingWidgetProps = {
      onClose: this.unload.bind(this),
      parentElement: container,
      sdkVersion: getVersion(),
      displayOTP: true,
      otpCode: '123456',
      updateOTPValue: (otpValue: string): void => {
        throw new Error('Function not implemented.');
      },
    };
    this.modal = await this.options.pendingModal.render(modalProps);
    this.modal.mount();
  }

  public async renderSelectModal(link: string, preferDesktop: boolean, connect: () => Promise<void>) {
    await preload();
    const container = this.getMountedContainer();
    const modalProps: SelectWidgetProps = {
      onClose: this.unload.bind(this),
      parentElement: container,
      sdkVersion: getVersion(),
      connect: () => {
        if (this.modal) {
          this.modal.unmount();
        }
        return connect();
      },
      link,
      preferDesktop,
    };
    this.modal = await this.options.selectModal.render(modalProps);
    this.modal.mount();
  }
}
