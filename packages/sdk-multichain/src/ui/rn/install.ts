import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { AbstractInstallModal, type InstallWidgetProps } from '../../domain';

export class InstallModal extends AbstractInstallModal {
	sessionRequest?: SessionRequest | undefined;
	instance!: HTMLMmInstallModalElement;
	async render(_options: InstallWidgetProps) {
		return {
			mount: () => {},
			unmount: () => {},
		};
	}
}
