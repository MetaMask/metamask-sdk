import { AbstractOTPCodeModal, createLogger, type OTPCodeWidgetProps } from '../../domain';

const logger = createLogger('metamask-sdk:ui');

/**
 * TODO: This is a placeholder for the OTP code modal.
 * It will be replaced with the actual OTP code modal once it is implemented.
 */
export class OTPCodeModal extends AbstractOTPCodeModal {
	//TODO: Change HTMLMmInstallModalElement once otp modal is done
	instance: HTMLMmInstallModalElement | undefined;
	async render(_options: OTPCodeWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
			sync: (otpValue: string) => {
				if (otpValue !== '') {
					logger(`[UI: pendingModal-nodejs: OTPCodeModal()] Choose the following value on your metamask mobile wallet: ${otpValue}`);
				}
			},
		};
	}
}
