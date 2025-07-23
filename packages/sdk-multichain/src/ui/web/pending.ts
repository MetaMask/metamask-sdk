import { AbstractPendingModal, type PendingWidgetProps } from '../../domain';

export class PendingModal extends AbstractPendingModal {
	instance!: HTMLMmPendingModalElement;

	async render(options: PendingWidgetProps) {
		const modal = document.createElement('mm-pending-modal') as HTMLMmPendingModalElement;
		modal.sdkVersion = options.sdkVersion;
		modal.displayOTP = options.displayOTP ?? true;
		modal.addEventListener('close', options.onClose);
		modal.addEventListener('updateOTPValue', ({ detail: { otpValue } }) => options.updateOTPValue(otpValue));
		if (options.onDisconnect) {
			modal.addEventListener('disconnect', options.onDisconnect);
		}
		return {
			mount: () => {
				options.parentElement?.appendChild(modal);
				this.instance = modal;
			},
			unmount: () => {
				if (options.parentElement?.contains(modal)) {
					options.parentElement.removeChild(modal);
				}
			},
			sync: () => {},
		};
	}
}
