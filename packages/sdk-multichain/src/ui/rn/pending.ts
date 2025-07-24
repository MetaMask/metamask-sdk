import { AbstractPendingModal, type PendingWidgetProps } from '../../domain';

export class PendingModal extends AbstractPendingModal {
	instance!: HTMLMmPendingModalElement;

	async render(_options: PendingWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
			sync: () => {},
		};
	}
}
