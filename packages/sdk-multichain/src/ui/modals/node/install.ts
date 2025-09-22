import encodeQR from '@paulmillr/qr';
import { type ConnectionRequest, createLogger, type QRLink } from '../../../domain';
import { AbstractInstallModal } from '../base/AbstractInstallModal';
import { formatRemainingTime, shouldLogCountdown } from '../base/utils';

const logger = createLogger('metamask-sdk:ui');

export class InstallModal extends AbstractInstallModal {
	private displayQRWithCountdown(qrCodeLink: QRLink, expiresInSeconds: number) {
		const isExpired = expiresInSeconds <= 0;
		const qrCode = encodeQR(qrCodeLink, 'ascii');

		// Clear console and display QR code with live countdown
		console.clear();
		console.log(qrCode);

		if (isExpired) {
			console.log('EXPIRED - Generating new QR code...');
		} else {
			console.log(`EXPIRES IN: ${expiresInSeconds}`);
		}
	}
	renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void {
		const { sessionRequest } = connectionRequest;
		const expiresIn = sessionRequest.expiresAt - Date.now();
		const expiresInSeconds = Math.floor(expiresIn / 1000);
		const shouldLog = shouldLogCountdown(expiresInSeconds);

		this.displayQRWithCountdown(link, this.instance?.expiresIn ?? expiresInSeconds);

		if (shouldLog) {
			const formattedTime = formatRemainingTime(expiresIn);
			logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${expiresIn}ms)`);
		}
	}

	mount() {
		if (!this.link) {
			throw new Error('Session request is required');
		}
		const { link, connectionRequest } = this;
		this.renderQRCode(link, connectionRequest);
		this.startExpirationCheck(connectionRequest);
	}

	unmount(): void {
		console.clear();
		this.stopExpirationCheck();
	}
}
