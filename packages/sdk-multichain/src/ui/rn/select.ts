import { AbstractInstallModal, type InstallWidgetProps, type SelectWidgetProps } from '../../domain';

export class SelectModal extends AbstractInstallModal {
  instance!: HTMLMmSelectModalElement;

  async render({ link, ...rest }: InstallWidgetProps | SelectWidgetProps) {
    return {
      mount: () => {},
      unmount: () => {},
    };
  }
}
