import { AbstractOTPCodeModal, createLogger, type OTPCodeWidgetProps } from '../../domain';

const logger = createLogger('metamask-sdk:ui');

export class OTPCodeModal extends AbstractOTPCodeModal {
	//TODO: Change HTMLMmInstallModalElement once otp modal is done
	instance: HTMLMmInstallModalElement | undefined;
	async render(_options: OTPCodeWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
			sync: (otpValue: string) => {
				if (otpValue !== '') {
					logger(`[UI: pendingModal-react: OTPCodeModal()] Choose the following value on your metamask mobile wallet: ${otpValue}`);
				}
			},
		};
	}
}
