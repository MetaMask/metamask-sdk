import React from 'react';
import { createRoot } from 'react-dom/client';

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

  renderInstallModal(props: InstallWidgetProps) {
    if (this.installContainer) {
      // Already rendered
      return;
    }

    this.installContainer = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <InstallModal
        link={props.link}
        onClose={props.onClose}
        metaMaskInstaller={props.metaMaskInstaller}
      />,
    );
  }

  renderSelectModal(props: SelectWidgetProps) {
    if(this.selectContainer) {
      return;
    }
    this.selectContainer = props.parentElement;

    const reactRoot = createRoot(props.parentElement);
    reactRoot.render(
      <SelectModal
        link={props.link}
        onClose={props.onClose}
        connectWithExtension={props.connectWithExtension}
      />,
    );
  }

  renderPendingModal(props: PendingWidgetProps) {
    if (this.pendingContainer) {
      // Already rendered
      return;
    }
    this.pendingContainer = props.parentElement;

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
    if (otpNode) {
      otpNode.textContent = otpValue;
      otpNode.style.display = 'block';
    }
  };

  unmount() {
    if (this.pendingContainer) {
      this.pendingContainer?.parentNode?.removeChild(this.pendingContainer);
      this.pendingContainer = undefined;
    }
    if (this.installContainer) {
      this.installContainer?.parentNode?.removeChild(this.installContainer);
      this.installContainer = undefined;
    }
    if(this.selectContainer) {
      this.selectContainer?.parentNode?.removeChild(this.selectContainer);
      this.selectContainer = undefined;
    }
  }
}
