import type { Components } from "@metamask/sdk-install-modal-web";

export interface InstallWidgetProps extends Components.MmInstallModal {
	parentElement?: Element;
	onClose: (shouldTerminate?: boolean) => void;
	metaMaskInstaller: {
		startDesktopOnboarding: () => void;
	};
	onAnalyticsEvent: (event: { event: any; params?: Record<string, unknown> }) => void;
}

export interface PendingWidgetProps extends Components.MmPendingModal {
	parentElement?: Element;
	onClose: () => void;
	onDisconnect?: () => void;
	updateOTPValue: (otpValue: string) => void;
}

export interface SelectWidgetProps extends Components.MmSelectModal {
	parentElement?: Element;
	onClose: (shouldTerminate?: boolean) => void;
	connect: () => void;
}

export type RenderedModal = {
	mount(qrcodeLink?: string): void;
	unmount(shouldTerminate?: boolean): void;
	sync?(...params: unknown[]): void;
};

/**
 * Abstract Modal class with shared functionality across all models
 */
export abstract class Modal<T extends Record<string, any>> {
	abstract instance?: HTMLMmInstallModalElement | HTMLMmSelectModalElement | HTMLMmPendingModalElement;
	abstract render(options: T): Promise<RenderedModal>;

	updateQRCode(link: string) {
		const installModal = this.instance?.querySelector("mm-install-modal") as HTMLMmInstallModalElement | null;
		if (installModal) {
			installModal.link = link;
		} else {
			const selectModal = this.instance?.querySelector("mm-select-modal") as HTMLMmSelectModalElement | null;
			if (selectModal) {
				selectModal.link = link;
			}
		}
	}
}

export abstract class AbstractInstallModal extends Modal<InstallWidgetProps | SelectWidgetProps> {}
export abstract class AbstractPendingModal extends Modal<PendingWidgetProps> {}
