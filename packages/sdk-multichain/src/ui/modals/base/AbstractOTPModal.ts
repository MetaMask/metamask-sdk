import { Modal, type OTPCode, type OTPCodeWidgetProps } from '../../../domain';

export abstract class AbstractOTPCodeModal extends Modal<OTPCode, OTPCodeWidgetProps> {
	protected instance?: HTMLMmInstallModalElement | undefined;

	get otpCode() {
		return this.data;
	}

	set otpCode(code: string) {
		this.data = code;
	}

	updateOTPCode(code: string) {
		const installModal = this.instance?.querySelector('mm-otpcode-modal') as HTMLMmOtpModalElement | null;
		if (installModal) {
			this.otpCode = code;
		}
	}
}
