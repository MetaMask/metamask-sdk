import encodeQR from '@paulmillr/qr';
import { AbstractInstallModal, createLogger, type InstallWidgetProps } from '../../domain';

const logger = createLogger('metamask-sdk:ui');

export class InstallModal extends AbstractInstallModal {
  instance!: HTMLMmInstallModalElement;
  async render({ link }: InstallWidgetProps) {
    return {
      mount: () => {
        const qr = encodeQR(link, 'ascii');
        console.log(qr);
        logger(`[UI: InstallModal-nodejs()] qrcode url: ${link}`);
      },
      unmount: () => {},
    };
  }
}
