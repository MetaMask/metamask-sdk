import { AbstractPendingModal, createLogger, type PendingWidgetProps } from '../../domain';

const logger = createLogger('metamask-sdk:ui');

export class PendingModal extends AbstractPendingModal {
	instance!: HTMLMmPendingModalElement;
	async render({ otpCode, ...rest }: PendingWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
			sync: (otpValue: string) => {
				if (otpValue !== '') {
					logger(`[UI: pendingModal-nodejs: PendingModal()] Choose the following value on your metamask mobile wallet: ${otpValue}`);
				}
			},
		};
	}
}
