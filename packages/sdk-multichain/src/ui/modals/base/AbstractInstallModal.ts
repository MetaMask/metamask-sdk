import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { type InstallWidgetProps, Modal } from '../../../domain';

export abstract class AbstractInstallModal extends Modal<SessionRequest, InstallWidgetProps> {
	protected instance?: HTMLMmInstallModalElement | undefined;

	get sessionRequest() {
		return this.data;
	}

	set sessionRequest(sessionRequest: SessionRequest) {
		this.data = sessionRequest;
	}

	updateSessionRequest(sessionRequest: SessionRequest) {
		this.sessionRequest = sessionRequest;
		if (this.instance) {
			this.instance.sessionRequest = sessionRequest;
		}
	}
}
