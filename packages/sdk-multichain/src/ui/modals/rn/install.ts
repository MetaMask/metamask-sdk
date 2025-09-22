import type { QRLink, ConnectionRequest } from 'src/domain';
import { AbstractInstallModal } from '../base/AbstractInstallModal';

export class InstallModal extends AbstractInstallModal {
	renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void {
		//This part is done by the install modal web, managed by the Modal
		throw new Error('Method not implemented.');
	}
	mount() {}

	unmount() {}
}
