import type { Components } from '@metamask/sdk-multichain-ui';
import type { ConnectionRequest } from '../multichain';

export type OTPCode = string;
export type QRLink = string;

export interface InstallWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	connectionRequest: ConnectionRequest;
	onClose: (shouldTerminate?: boolean) => void;
	startDesktopOnboarding: () => void;
	createConnectionRequest: () => Promise<ConnectionRequest>;
	generateQRCode: (connectionRequest: ConnectionRequest) => Promise<QRLink>;
}

export interface OTPCodeWidgetProps extends Components.MmOtpModal {
	parentElement?: Element;
	onClose: () => void;
	onDisconnect?: () => void;
	createOTPCode: () => Promise<OTPCode>;
	updateOTPCode: (otpValue: string) => void;
}

type ModalData = { link: QRLink } | { otpCode: OTPCode };

/**
 * Abstract Modal class with shared functionality across all models
 */
export abstract class Modal<R extends OTPCode | QRLink = OTPCode | QRLink, T extends ModalData = ModalData> {
	protected abstract instance?: HTMLMmInstallModalElement | HTMLMmOtpModalElement | undefined;

	abstract mount(): void;
	abstract unmount(): void;

	constructor(protected readonly options: T) {}

	get data() {
		if ('link' in this.options) {
			return this.options.link as R;
		}

		if ('otpCode' in this.options) {
			return this.options.otpCode as R;
		}

		throw new Error('Invalid options');
	}

	set data(data: R) {
		if ('link' in this.options) {
			this.options.link = data;
		}

		if ('otpCode' in this.options) {
			this.options.otpCode = data;
		}
	}
}
