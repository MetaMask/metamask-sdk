import { defineCustomElements } from "@metamask/sdk-install-modal-web/loader";
import { Components } from '@metamask/sdk-install-modal-web';
import { i18n } from "i18next";

export const FOX_IMAGE = `data:image/png;base64,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`;

export interface InstallWidgetProps {
    parentElement: Element;
    onClose: () => void;
    link: string;
    sdkVersion?: string;
    preferDesktop: boolean;
    metaMaskInstaller: {
      startDesktopOnboarding: () => void;
    };
    i18nInstance: i18n;
  }
  
  export interface PendingWidgetProps {
    parentElement: Element;
    onClose: () => void;
    onDisconnect?: () => void;
    sdkVersion?: string;
    updateOTPValue: (otpValue: string) => void;
    displayOTP?: boolean;
    i18nInstance: i18n;
  }
  
  export interface SelectWidgetProps {
    parentElement: Element;
    onClose: (shouldTerminate?: boolean) => void;
    link: string;
    sdkVersion?: string;
    connectWithExtension: () => void;
    i18nInstance: i18n;
  }
  
  export default class ModalLoader {
    private installContainer?: Element;
    private pendingContainer?: Element;
    private selectContainer?: Element;
    private debug = false;
    private sdkVersion?: string;
  
    constructor({debug, sdkVersion}: {debug?: boolean, sdkVersion?: string}) {
      this.debug = debug ?? false;
      this.sdkVersion = sdkVersion;
    }
  
    renderInstallModal(props: InstallWidgetProps) {
      if (this.debug) {
        console.debug(`ModalLoader: renderInstallModal`, props);
      }
  
      this.installContainer = props.parentElement;
  
      defineCustomElements();
  
      const modal = document.createElement('mm-install-modal') as HTMLMmInstallModalElement;
      modal.link = props.link;
      modal.preferDesktop = props.preferDesktop;
      modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
      modal.i18nInstance = props.i18nInstance;
      modal.addEventListener("close", props.onClose);
      modal.addEventListener("startDesktopOnboarding", props.metaMaskInstaller.startDesktopOnboarding);
  
      props.parentElement.appendChild(modal);
    }
  
    renderSelectModal(props: SelectWidgetProps) {
      if (this.debug) {
        console.debug(`ModalLoader: renderSelectModal`, props);
      }
      this.selectContainer = props.parentElement;
  
      defineCustomElements();
  
      const modal = document.createElement('mm-select-modal') as HTMLMmSelectModalElement;
      modal.link = props.link;
      modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
      modal.i18nInstance = props.i18nInstance;
      modal.addEventListener("close", ({ detail: { shouldTerminate } }) => props.onClose(shouldTerminate));
      modal.addEventListener("connectWithExtension", props.connectWithExtension);
  
      props.parentElement.appendChild(modal);
  
      setTimeout(() => {
        this.updateQRCode(props.link);
      }, 100);
    }
  
    renderPendingModal(props: PendingWidgetProps) {
      if (this.debug) {
        console.debug(`ModalLoader: renderPendingModal`, props);
      }
  
      this.pendingContainer = props.parentElement;
  
      defineCustomElements();
  
      const modal = document.createElement('mm-pending-modal') as HTMLMmPendingModalElement;
      modal.sdkVersion = props.sdkVersion ?? this.sdkVersion;
      modal.i18nInstance = props.i18nInstance;
      modal.displayOTP = props.displayOTP;
      modal.addEventListener("close", props.onClose);
      modal.addEventListener("updateOTPValue", ({ detail: { otpValue } }) => props.updateOTPValue(otpValue));
      if (props.onDisconnect) {
        modal.addEventListener("disconnect", props.onDisconnect);
      }
  
      props.parentElement.appendChild(modal);
    }
  
    updateOTPValue = (otpValue: string) => {
      if (this.debug) {
        console.debug(`ModalLoader: updateOTPValue`, otpValue);
      }
  
      const tryUpdate = () => {

        const modal = this.pendingContainer?.querySelector('mm-pending-modal') as HTMLMmPendingModalElement | null;
        if (modal) {
          modal.otpCode = otpValue
          return true;
        }
        return false;
      }
      // Sometime the modal is not properly initialized and the node is not found, we try again after 1s to solve the issue.
      setTimeout(() => {
        if(this.debug) {
          console.debug(`ModalLoader: updateOTPValue: delayed otp update`)
        }
        tryUpdate();
      }, 800);
    };
  
    updateQRCode = (link: string) => {
      if (this.debug) {
        console.debug(`ModalLoader: updateQRCode`, link);
      }

      const modal = this.installContainer?.querySelector('mm-install-modal') as HTMLMmInstallModalElement | null;
      if (modal) {
        modal.link = link;
      }
    };
  
    unmount() {
      this.pendingContainer?.parentNode?.removeChild(this.pendingContainer);
      this.pendingContainer = undefined;
      this.installContainer?.parentNode?.removeChild(this.installContainer);
      this.installContainer = undefined;
      this.selectContainer?.parentNode?.removeChild(this.selectContainer);
      this.selectContainer = undefined;
    }
  }