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
	protected abstract instance?: HTMLMmInstallModalElement | HTMLMmOtpModalElement | undefined;

	abstract mount(): void;
	abstract unmount(): void;

	constructor(protected readonly options: T) {}

	get data() {
		// biome-ignore lint/suspicious/noExplicitAny: expected
		if ('sessionRequest' in (this.options as any)) {
			// biome-ignore lint/suspicious/noExplicitAny: expected
			return (this.options as any).sessionRequest;
		}
		// biome-ignore lint/suspicious/noExplicitAny: expected
		if ('otpCode' in (this.options as any)) {
			// biome-ignore lint/suspicious/noExplicitAny: expected
			return (this.options as any).otpCode;
		}

		throw new Error('Invalid options');
	}

	set data(data: R extends OTPCode ? OTPCode : R extends SessionRequest ? SessionRequest : R) {
		// biome-ignore lint/suspicious/noExplicitAny: expected
		if ('sessionRequest' in (this.options as any)) {
			// biome-ignore lint/suspicious/noExplicitAny: expected
			(this.options as any).sessionRequest = data;
		}
		// biome-ignore lint/suspicious/noExplicitAny: expected
		if ('otpCode' in (this.options as any)) {
			// biome-ignore lint/suspicious/noExplicitAny: expected
			(this.options as any).otpCode = data;
		}
	}
}
