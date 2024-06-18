import React from 'react';
import { createRoot } from 'react-dom/client';
import { FOX_IMAGE } from './constants';

import { InstallModal, InstallModalProps } from './InstallModal';
import { PendingModal, PendingModalProps } from './PendingModal';
import { SelectModal, SelectModalProps } from './SelectModal';

export interface InstallWidgetProps extends InstallModalProps {
  parentElement: Element;
}

export interface PendingWidgetProps extends PendingModalProps {
  parentElement: Element;
}

export interface SelectWidgetProps extends SelectModalProps {
  parentElement: Element;
}

export class ModalLoader {
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

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <InstallModal
        link={props.link}
        preferDesktop={props.preferDesktop}
        onClose={props.onClose}
        sdkVersion={this.sdkVersion}
        metaMaskInstaller={props.metaMaskInstaller}
        i18nInstance={props.i18nInstance}
      />,
    );
  }

  renderSelectModal(props: SelectWidgetProps) {
    if (this.debug) {
      console.debug(`ModalLoader: renderSelectModal`, props);
    }
    this.selectContainer = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <SelectModal
        link={props.link}
        sdkVersion={this.sdkVersion}
        onClose={props.onClose}
        connectWithExtension={props.connectWithExtension}
        i18nInstance={props.i18nInstance}
      />,
    );

    setTimeout(() => {
      this.updateQRCode(props.link);
    }, 100);
  }

  renderPendingModal(props: PendingWidgetProps) {
    if (this.debug) {
      console.debug(`ModalLoader: renderPendingModal`, props);
    }

    this.pendingContainer = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <PendingModal
        onClose={props.onClose}
        onDisconnect={props.onDisconnect}
        sdkVersion={this.sdkVersion}
        updateOTPValue={props.updateOTPValue}
        displayOTP={props.displayOTP}
        i18nInstance={props.i18nInstance}
      />,
    );
  }

  updateOTPValue = (otpValue: string) => {
    if (this.debug) {
      console.debug(`ModalLoader: updateOTPValue`, otpValue);
    }

    const tryUpdate = () => {
      const otpNode =
      document.getElementById('sdk-mm-otp-value');

      if(this.debug) {
        console.debug(`ModalLoader: updateOTPValue: otpNode`, otpNode);
      }

      if (otpNode) {
        otpNode.textContent = otpValue;
        otpNode.style.display = 'block';
        return true;
      } else {
        return false;
      }
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
    // TODO use scoped elem
    const qrCodeNode =
      document.getElementById('sdk-qrcode-container');
    if (qrCodeNode) {
      qrCodeNode.innerHTML = '';
      // Prevent nextjs import issue: https://github.com/kozakdenys/qr-code-styling/issues/38
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const QRCodeStyling = require('qr-code-styling');
      // Prevent nextjs import issue
      const qrCode = new QRCodeStyling({
        width: 270,
        height: 270,
        type: 'svg',
        data: link,
        image: FOX_IMAGE,
        dotsOptions: {
          color: 'black',
          type: 'rounded',
        },
        imageOptions: {
          margin: 5,
        },
        cornersDotOptions: {
          color: '#f66a07',
        },
        qrOptions: {
          errorCorrectionLevel: 'M',
        },
      });
      qrCode.append(qrCodeNode);
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
