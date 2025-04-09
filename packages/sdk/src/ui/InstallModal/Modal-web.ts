import { TrackingEvents } from '@metamask/sdk-communication-layer';
import type { Components } from '@metamask/sdk-install-modal-web';

export interface InstallWidgetProps extends Components.MmInstallModal {
  parentElement: Element;
  onClose: (shouldTerminate?: boolean) => void;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void;
  };
  onAnalyticsEvent: (event: {
    event: TrackingEvents;
    params?: Record<string, unknown>;
  }) => void;
}

export interface PendingWidgetProps extends Components.MmPendingModal {
  parentElement: Element;
  onClose: () => void;
  onDisconnect?: () => void;
  updateOTPValue: (otpValue: string) => void;
}

export interface SelectWidgetProps extends Components.MmSelectModal {
  parentElement: Element;
  onClose: (shouldTerminate?: boolean) => void;
  connectWithExtension: () => void;
}

export default class ModalLoader {
  private containers: Record<string, Element | undefined> = {
    install: undefined,
    pending: undefined,
    select: undefined,
  };

  private defined: Record<string, boolean> = {
    install: false,
    pending: false,
    select: false,
  };

  private debug: boolean;

  private sdkVersion?: string;

  constructor({ debug, sdkVersion }: { debug?: boolean; sdkVersion?: string }) {
    this.debug = debug ?? false;
    this.sdkVersion = sdkVersion;
  }

  private async loadComponent(type: 'install' | 'pending' | 'select') {
    if (this.defined[type]) {
      return;
    }

    this.defined[type] = true;
    try {
      const loader = await import(
        /* webpackChunkName: "sdk-install-modal" */
        '@metamask/sdk-install-modal-web/dist/loader'
      );
      console.log('loader', loader);
      loader.defineCustomElements();
    } catch (error) {
      console.error(`Failed to load ${type} modal:`, error);
    }
  }

  async renderInstallModal(props: InstallWidgetProps) {
    if (this.debug) {
      console.debug('ModalLoader: renderInstallModal', props);
    }

    this.containers.install = props.parentElement;
    await this.loadComponent('install');

    const modal = document.createElement(
      'mm-install-modal',
    ) as HTMLMmInstallModalElement;
    modal.link = props.link;
    modal.preferDesktop = props.preferDesktop;
    modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
    modal.addEventListener('close', ({ detail: { shouldTerminate } }) =>
      props.onClose(shouldTerminate),
    );

    modal.addEventListener(
      'startDesktopOnboarding',
      props.metaMaskInstaller.startDesktopOnboarding,
    );

    modal.addEventListener('trackAnalytics', ((e: CustomEvent) =>
      props.onAnalyticsEvent?.(e.detail)) as EventListener);
    props.parentElement.appendChild(modal);
  }

  async renderSelectModal(props: SelectWidgetProps) {
    this.containers.select = props.parentElement;
    await this.loadComponent('select');

    const modal = document.createElement(
      'mm-select-modal',
    ) as HTMLMmSelectModalElement;
    modal.link = props.link;
    modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
    modal.preferDesktop = props.preferDesktop;
    modal.addEventListener('close', ({ detail: { shouldTerminate } }) =>
      props.onClose(shouldTerminate),
    );
    modal.addEventListener('connectWithExtension', props.connectWithExtension);
    props.parentElement.appendChild(modal);

    setTimeout(() => this.updateQRCode(props.link), 100);
  }

  async renderPendingModal(props: PendingWidgetProps) {
    this.containers.pending = props.parentElement;
    await this.loadComponent('pending');

    const modal = document.createElement(
      'mm-pending-modal',
    ) as HTMLMmPendingModalElement;
    modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
    modal.displayOTP = props.displayOTP;
    modal.addEventListener('close', props.onClose);
    modal.addEventListener('updateOTPValue', ({ detail: { otpValue } }) =>
      props.updateOTPValue(otpValue),
    );

    if (props.onDisconnect) {
      modal.addEventListener('disconnect', props.onDisconnect);
    }

    props.parentElement.appendChild(modal);
  }

  updateOTPValue(otpValue: string) {
    const tryUpdate = () => {
      const modal = this.containers.pending?.querySelector(
        'mm-pending-modal',
      ) as HTMLMmPendingModalElement | null;
      if (modal) {
        modal.otpCode = otpValue;
        return true;
      }
      return false;
    };

    setTimeout(() => {
      tryUpdate();
    }, 800);
  }

  updateQRCode(link: string) {
    const installModal = this.containers.install?.querySelector(
      'mm-install-modal',
    ) as HTMLMmInstallModalElement | null;
    if (installModal) {
      installModal.link = link;
    } else {
      const selectModal = this.containers.select?.querySelector(
        'mm-select-modal',
      ) as HTMLMmSelectModalElement | null;
      if (selectModal) {
        selectModal.link = link;
      }
    }
  }

  unmount() {
    Object.entries(this.containers).forEach(([key, container]) => {
      container?.parentNode?.removeChild(container);
      this.containers[key as keyof typeof this.containers] = undefined;
    });
  }
}
