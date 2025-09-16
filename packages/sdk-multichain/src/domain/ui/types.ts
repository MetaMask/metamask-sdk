import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { Components } from '@metamask/sdk-multichain-ui';

export type OTPCode = string;

export interface InstallWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	onClose: (shouldTerminate?: boolean) => void;
	startDesktopOnboarding: () => void;
	createSessionRequest: () => Promise<SessionRequest>;
	updateSessionRequest: (sessionRequest: SessionRequest) => void;
}

export interface OTPCodeWidgetProps extends Components.MmOtpModal {
	parentElement?: Element;
	onClose: () => void;
	onDisconnect?: () => void;
	createOTPCode: () => Promise<OTPCode>;
	updateOTPCode: (otpValue: string) => void;
}

/**
 * Abstract Modal class with shared functionality across all models
 */
export abstract class Modal<R = unknown, T = unknown> {
	protected abstract instance?: HTMLMmInstallModalElement | undefined;

	abstract mount(): void;
	abstract unmount(): void;

	constructor(protected readonly options: T) {}

	get data() {
		if ('sessionRequest' in (this.options as any)) {
			return (this.options as any).sessionRequest;
		}
		if ('otpCode' in (this.options as any)) {
			return (this.options as any).otpCode;
		}

		throw new Error('Invalid options');
	}

	set data(data: R extends OTPCode ? OTPCode : R extends SessionRequest ? SessionRequest : R) {
		if ('sessionRequest' in (this.options as any)) {
			(this.options as any).sessionRequest = data;
		}
		if ('otpCode' in (this.options as any)) {
			(this.options as any).otpCode = data;
		}
	}
}
