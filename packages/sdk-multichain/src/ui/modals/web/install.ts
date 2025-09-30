import { AbstractInstallModal } from '../base/AbstractInstallModal';

export class InstallModal extends AbstractInstallModal {
	renderQRCode(): void {
		//Not needed for web as its using install Modal
	}

	mount() {
		const { options } = this;
		const modal = document.createElement('mm-install-modal') as HTMLMmInstallModalElement;

		modal.preferDesktop = options.preferDesktop;
		modal.sdkVersion = options.sdkVersion;
		modal.addEventListener('close', ({ detail: { shouldTerminate } }) => options.onClose(shouldTerminate));
		modal.addEventListener('startDesktopOnboarding', options.startDesktopOnboarding);
		modal.link = options.link;

		this.instance = modal;
		options.parentElement?.appendChild(modal);

		this.startExpirationCheck(options.connectionRequest);
	}

	unmount() {
		const { options, instance: modal } = this;
		this.stopExpirationCheck();
		if (modal && options.parentElement?.contains(modal)) {
			options.parentElement.removeChild(modal);
			this.instance = undefined;
		}
	}
}
