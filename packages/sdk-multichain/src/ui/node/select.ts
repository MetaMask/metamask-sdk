import { AbstractInstallModal, type SelectWidgetProps } from '../../domain';

export class SelectModal extends AbstractInstallModal {
	instance!: HTMLMmSelectModalElement;

	async render(_options: SelectWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
		};
	}
}
