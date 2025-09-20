import { Modal, type OTPCode, type OTPCodeWidgetProps } from '../../../domain';

export abstract class AbstractOTPCodeModal extends Modal<OTPCode, OTPCodeWidgetProps> {
	protected instance?: HTMLMmOtpModalElement | undefined;

	get otpCode() {
		return this.data;
	}

	set otpCode(code: string) {
		this.data = code;
	}

	updateOTPCode(code: string) {
		this.otpCode = code;
		if (this.instance) {
			this.instance.otpCode = code;
		}
	}
}
