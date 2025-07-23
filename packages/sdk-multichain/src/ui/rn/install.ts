import { AbstractInstallModal, type InstallWidgetProps, type SelectWidgetProps } from '../../domain';

export class InstallModal extends AbstractInstallModal {
	instance!: HTMLMmInstallModalElement;
	async render({ link, ...rest }: InstallWidgetProps | SelectWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
		};
	}
}
