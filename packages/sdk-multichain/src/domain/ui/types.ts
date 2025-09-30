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
	onClose: () => Promise<void>;
	onDisconnect?: () => void;
	createOTPCode: () => Promise<OTPCode>;
	updateOTPCode: (otpValue: string) => void;
}

export type DataType = OTPCode | QRLink;
/**
 * Abstract Modal class with shared functionality across all models
 */
export abstract class Modal<Options, Data extends DataType = DataType> {
	protected abstract instance?: HTMLMmInstallModalElement | HTMLMmOtpModalElement | undefined;

	abstract mount(): void;
	abstract unmount(): void;

	constructor(protected readonly options: Options) {}

	get data() {
		if (typeof this.options === 'object' && this.options && 'link' in this.options) {
			return this.options.link as Data;
		}

		if (typeof this.options === 'object' && this.options && 'otpCode' in this.options) {
			return this.options.otpCode as Data;
		}

		throw new Error('Invalid options');
	}

	set data(data: Data) {
		if (typeof this.options === 'object' && this.options && 'link' in this.options) {
			this.options.link = data;
		}

		if (typeof this.options === 'object' && this.options && 'otpCode' in this.options) {
			this.options.otpCode = data;
		}
	}
}
