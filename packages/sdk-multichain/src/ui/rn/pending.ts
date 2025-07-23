import { AbstractPendingModal, type PendingWidgetProps } from '../../domain';

export class PendingModal extends AbstractPendingModal {
  instance!: HTMLMmPendingModalElement;

  async render({ otpCode, ...rest }: PendingWidgetProps) {
    return {
      mount: () => {},
      unmount: () => {},
      sync: () => {},
    };
  }
}
