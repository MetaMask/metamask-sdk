import { AbstractInstallModal, type InstallWidgetProps, type SelectWidgetProps } from '../../domain';

export class InstallModal extends AbstractInstallModal {
	instance!: HTMLMmInstallModalElement;
	async render(_options: InstallWidgetProps | SelectWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
		};
	}
}
