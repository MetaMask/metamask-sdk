import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { Components } from '@metamask/sdk-multichain-ui';

export interface InstallWidgetProps extends Components.MmInstallModal {
	sessionRequest?: SessionRequest;
	parentElement?: Element;
	onClose: (shouldTerminate?: boolean) => void;
	startDesktopOnboarding: () => void;
	createSessionRequest: () => Promise<SessionRequest>;
}

//TODO: Extend from the right component once modal is implemented
export interface OTPCodeWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	onClose: () => void;
	onDisconnect?: () => void;
	updateOTPValue: (otpValue: string) => void;
}

export type RenderedModal = {
	mount(qrcodeLink?: string): void;
	unmount(success?: boolean, error?: Error): void;
	sync?(...params: unknown[]): void;
};

/**
 * Abstract Modal class with shared functionality across all models
 */

// biome-ignore lint/suspicious/noExplicitAny: Expected here
export abstract class Modal<T extends Record<string, any>> {
	abstract sessionRequest?: SessionRequest;
	abstract instance?: HTMLMmInstallModalElement | undefined;
	abstract render(options: T): Promise<RenderedModal>;

	updateQRCode(sessionRequest: SessionRequest) {
		const installModal = this.instance?.querySelector('mm-install-modal') as HTMLMmInstallModalElement | null;
		if (installModal) {
			this.sessionRequest = sessionRequest;
		}
	}
}

export abstract class AbstractInstallModal extends Modal<InstallWidgetProps> {}
export abstract class AbstractOTPCodeModal extends Modal<OTPCodeWidgetProps> {}
