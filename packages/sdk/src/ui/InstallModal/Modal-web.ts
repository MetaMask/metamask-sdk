import { Components } from '@metamask/sdk-install-modal-web/types/components';

export interface InstallWidgetProps extends Components.MmInstallModal {
  parentElement: Element;
  onClose: () => void;
  metaMaskInstaller: {
    startDesktopOnboarding: () => void;
  };
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
  private installContainer?: Element;

  private pendingContainer?: Element;

  private selectContainer?: Element;

  private debug = false;

  private installDefined = false;

  private pendingDefined = false;

  private selectDefined = false;

  private sdkVersion?: string;

  constructor({ debug, sdkVersion }: { debug?: boolean; sdkVersion?: string }) {
    this.debug = debug ?? false;
    this.sdkVersion = sdkVersion;
  }

  renderInstallModal(props: InstallWidgetProps) {
    if (this.debug) {
      console.debug(`ModalLoader: renderInstallModal`, props);
    }

    this.installContainer = props.parentElement;

    const buildElement = () => {
      const modal = document.createElement(
        'mm-install-modal',
      ) as HTMLMmInstallModalElement;
      modal.link = props.link;
      modal.preferDesktop = props.preferDesktop;
      modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
      modal.addEventListener('close', props.onClose);
      modal.addEventListener(
        'startDesktopOnboarding',
        props.metaMaskInstaller.startDesktopOnboarding,
      );

      props.parentElement.appendChild(modal);
    };

    if (this.installDefined) {
      buildElement();
    } else {
      this.installDefined = true;
      import('@metamask/sdk-install-modal-web/components/mm-install-modal')
        .then(({ defineCustomElement }) => {
          defineCustomElement();
          buildElement();
        })
        .catch(console.error);
    }
  }

  renderSelectModal(props: SelectWidgetProps) {
    if (this.debug) {
      console.debug(`ModalLoader: renderSelectModal`, props);
    }
    this.selectContainer = props.parentElement;

    const buildElement = () => {
      const modal = document.createElement(
        'mm-select-modal',
      ) as HTMLMmSelectModalElement;
      modal.link = props.link;
      modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
      modal.addEventListener('close', ({ detail: { shouldTerminate } }) =>
        props.onClose(shouldTerminate),
      );

      modal.addEventListener(
        'connectWithExtension',
        props.connectWithExtension,
      );

      props.parentElement.appendChild(modal);

      setTimeout(() => {
        this.updateQRCode(props.link);
      }, 100);
    };

    if (this.selectDefined) {
      buildElement();
    } else {
      this.selectDefined = true;
      import('@metamask/sdk-install-modal-web/components/mm-select-modal')
        .then(({ defineCustomElement }) => {
          defineCustomElement();
          buildElement();
        })
        .catch(console.error);
    }
  }

  renderPendingModal(props: PendingWidgetProps) {
    if (this.debug) {
      console.debug(`ModalLoader: renderPendingModal`, props);
    }

    this.pendingContainer = props.parentElement;

    const buildElement = () => {
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
    };

    if (this.pendingDefined) {
      buildElement();
    } else {
      this.pendingDefined = true;
      import('@metamask/sdk-install-modal-web/components/mm-pending-modal')
        .then(({ defineCustomElement }) => {
          defineCustomElement();
          buildElement();
        })
        .catch(console.error);
    }
  }

  updateOTPValue(otpValue: string) {
    if (this.debug) {
      console.debug(`ModalLoader: updateOTPValue`, otpValue);
    }

    const tryUpdate = () => {
      const modal = this.pendingContainer?.querySelector(
        'mm-pending-modal',
      ) as HTMLMmPendingModalElement | null;
      if (modal) {
        modal.otpCode = otpValue;
        return true;
      }
      return false;
    };

    // Sometime the modal is not properly initialized and the node is not found, we try again after 1s to solve the issue.
    setTimeout(() => {
      if (this.debug) {
        console.debug(`ModalLoader: updateOTPValue: delayed otp update`);
      }
      tryUpdate();
    }, 800);
  }

  updateQRCode(link: string) {
    if (this.debug) {
      console.debug(`ModalLoader: updateQRCode`, link);
    }

    const modal = this.installContainer?.querySelector(
      'mm-install-modal',
    ) as HTMLMmInstallModalElement | null;
    if (modal) {
      modal.link = link;
    } else {
      const selectModal = this.installContainer?.querySelector(
        'mm-select-modal',
      ) as HTMLMmSelectModalElement | null;
      if (selectModal) {
        selectModal.link = link;
      }
    }
  }

  unmount() {
    this.pendingContainer?.parentNode?.removeChild(this.pendingContainer);
    this.pendingContainer = undefined;
    this.installContainer?.parentNode?.removeChild(this.installContainer);
    this.installContainer = undefined;
    this.selectContainer?.parentNode?.removeChild(this.selectContainer);
    this.selectContainer = undefined;
  }
}
