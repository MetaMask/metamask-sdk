import { AbstractInstallModal, type InstallWidgetProps, type SelectWidgetProps } from '../../domain';

export class SelectModal extends AbstractInstallModal {
	instance!: HTMLMmSelectModalElement;

	async render(_options: InstallWidgetProps | SelectWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
		};
	}
}
