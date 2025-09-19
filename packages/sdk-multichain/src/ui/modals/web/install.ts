import { AbstractInstallModal } from '../base/AbstractInstallModal';

export class InstallModal extends AbstractInstallModal {
	private expirationInterval: NodeJS.Timeout | null = null;

	mount() {
		const { options } = this;
		const modal = document.createElement('mm-install-modal') as HTMLMmInstallModalElement;

		modal.preferDesktop = options.preferDesktop;
		modal.sdkVersion = options.sdkVersion;
		modal.addEventListener('close', ({ detail: { shouldTerminate } }) => options.onClose(shouldTerminate));
		modal.addEventListener('startDesktopOnboarding', options.startDesktopOnboarding);
		modal.sessionRequest = options.sessionRequest;
		options.parentElement?.appendChild(modal);

		this.instance = modal;
		this.startExpirationCheck();
	}

	unmount() {
		const { options, instance: modal } = this;
		this.stopExpirationCheck();
		if (modal && options.parentElement?.contains(modal)) {
			options.parentElement.removeChild(modal);
			this.instance = undefined;
		}
	}

	private startExpirationCheck() {
		// Clear any existing interval
		this.stopExpirationCheck();

		this.expirationInterval = setInterval(async () => {
			if (!this.instance) {
				return;
			}

			const now = Date.now();
			if (this.instance && now >= this.sessionRequest.expiresAt) {
				// Generate new session request
				const newSessionRequest = await this.options.createSessionRequest();
				this.instance.sessionRequest = newSessionRequest;
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
