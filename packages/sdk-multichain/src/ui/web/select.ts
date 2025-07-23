import { AbstractInstallModal, type SelectWidgetProps } from '../../domain';

export class SelectModal extends AbstractInstallModal {
  instance!: HTMLMmSelectModalElement;

  async render({ link, sdkVersion, preferDesktop, onClose, connect, parentElement }: SelectWidgetProps) {
    const modal = document.createElement('mm-select-modal') as HTMLMmSelectModalElement;
    modal.link = link;
    modal.sdkVersion = sdkVersion;
    modal.preferDesktop = preferDesktop;
    modal.addEventListener('close', ({ detail: { shouldTerminate } }) => onClose(shouldTerminate));
    modal.addEventListener('connectWithExtension', connect);
    return {
      mount: () => {
        parentElement?.appendChild(modal);
        setTimeout(() => this.updateQRCode(link), 100);
        this.instance = modal;
      },
      unmount: () => {
        if (parentElement?.contains(modal)) {
          parentElement.removeChild(modal);
        }
      },
    };
  }
}
