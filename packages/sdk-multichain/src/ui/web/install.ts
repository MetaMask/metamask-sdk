import { AbstractInstallModal, type InstallWidgetProps } from '../../domain';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

export class InstallModal extends AbstractInstallModal {
	instance!: HTMLMmInstallModalElement;
	sessionRequest?: SessionRequest | undefined;
	private expirationInterval: NodeJS.Timeout | null = null;
	private createSessionRequestFn: (() => Promise<SessionRequest>) | null = null;

	async render(options: InstallWidgetProps) {
		// Store the createSessionRequest function for later use
		this.createSessionRequestFn = options.createSessionRequest;
		this.sessionRequest = options.sessionRequest as SessionRequest;

		const modal = document.createElement('mm-install-modal') as HTMLMmInstallModalElement;

		this.sessionRequest = options.sessionRequest;
		modal.preferDesktop = options.preferDesktop;
		modal.sdkVersion = options.sdkVersion;
		modal.addEventListener('close', ({ detail: { shouldTerminate } }) => options.onClose(shouldTerminate));

		modal.addEventListener('startDesktopOnboarding', options.startDesktopOnboarding);

		return {
			mount: () => {
				options.parentElement?.appendChild(modal);
				this.instance = modal;
				this.startExpirationCheck();
			},
			unmount: () => {
				this.stopExpirationCheck();
				this.sessionRequest = undefined;
				this.createSessionRequestFn = null;

				if (options.parentElement?.contains(modal)) {
					options.parentElement.removeChild(modal);
				}
			},
		};
	}

	private startExpirationCheck() {
		// Clear any existing interval
		this.stopExpirationCheck();

		this.expirationInterval = setInterval(async () => {
			if (!this.sessionRequest || !this.createSessionRequestFn || !this.instance) {
				return;
			}

			const now = Date.now();
			if (now >= this.sessionRequest.expiresAt) {
				// Generate new session request
				const newSessionRequest = await this.createSessionRequestFn();
				this.sessionRequest = newSessionRequest;
			}
		}, 1000); // Check every second
	}

	private stopExpirationCheck() {
		if (this.expirationInterval) {
			clearInterval(this.expirationInterval);
			this.expirationInterval = null;
		}
	}
}
