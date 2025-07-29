import type { Components } from '@metamask/sdk-multichain-ui';

export interface InstallWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	onClose: (shouldTerminate?: boolean) => void;
	metaMaskInstaller: {
		startDesktopOnboarding: () => void;
	};
}

export interface OTPCodeWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	onClose: () => void;
	onDisconnect?: () => void;
	updateOTPValue: (otpValue: string) => void;
}

export type RenderedModal = {
	mount(qrcodeLink?: string): void;
	unmount(shouldTerminate?: boolean): void;
	sync?(...params: unknown[]): void;
};

/**
 * Abstract Modal class with shared functionality across all models
 */

// biome-ignore lint/suspicious/noExplicitAny: Expected here
export abstract class Modal<T extends Record<string, any>> {
	abstract instance?: HTMLMmInstallModalElement | undefined;
	abstract render(options: T): Promise<RenderedModal>;

	updateQRCode(link: string) {
		const installModal = this.instance?.querySelector('mm-install-modal') as HTMLMmInstallModalElement | null;
		if (installModal) {
			installModal.link = link;
		}
	}
}

export abstract class AbstractInstallModal extends Modal<InstallWidgetProps> {}
export abstract class AbstractOTPCodeModal extends Modal<OTPCodeWidgetProps> {}
