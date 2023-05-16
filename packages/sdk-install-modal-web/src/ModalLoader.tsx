import React from 'react';
import { createRoot } from 'react-dom/client';

import { InstallModal, InstallModalProps } from './InstallModal';
import { PendingModal, PendingModalProps } from './PendingModal';

export interface InstallWidgetProps extends InstallModalProps {
  parentElement: Element;
}

export interface PendingWidgetProps extends PendingModalProps {
  parentElement: Element;
}

export class ModalLoader {
  private el?: Element;

  renderInstallModal(props: InstallWidgetProps) {
    console.debug(`TestWidget render `, props);
    this.el = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <InstallModal
        link={props.link}
        onClose={props.onClose}
        metaMaskInstaller={props.metaMaskInstaller}
      />,
    );
  }

  renderPendingModal(props: PendingWidgetProps) {
    console.debug(`TestWidget render `, props);
    this.el = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <PendingModal
        onClose={props.onClose}
        onDisconnect={props.onDisconnect}
        updateOTPValue={props.updateOTPValue}
      />,
    );
  }

  updateOTPValue = (otpValue: string) => {
    const otpNode = document.getElementById('sdk-mm-otp-value');
    console.debug(`updateOTP ${otpValue}`, otpNode);
    if (otpNode) {
      otpNode.textContent = otpValue;
      otpNode.style.display = 'block';
    }
  };

  unmount() {
    if (!this.el) {
      throw new Error(`not mounted, call mount() first`);
    }
    this.el?.parentNode?.removeChild(this.el);
    this.el = undefined;
  }
}
