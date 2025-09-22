import encodeQR from '@paulmillr/qr';
import { type ConnectionRequest, createLogger, type QRLink } from '../../../domain';
import { AbstractInstallModal } from '../base/AbstractInstallModal';
import { formatRemainingTime, shouldLogCountdown } from '../base/utils';

const logger = createLogger('metamask-sdk:ui');

function displayQRWithCountdown(qrCodeLink: QRLink, expiresAt: number) {
	const now = Date.now();
	const remainingMs = expiresAt - now;
	const remainingTime = formatRemainingTime(remainingMs);
	const isExpired = remainingMs <= 0;
	const qrCode = encodeQR(qrCodeLink, 'ascii');

	// Clear console and display QR code with live countdown
	console.clear();
	console.log(qrCode);

	if (isExpired) {
		console.log('EXPIRED - Generating new QR code...');
	} else {
		console.log(`EXPIRES IN: ${remainingTime}`);
	}
}

export class InstallModal extends AbstractInstallModal {
	renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void {
		const { sessionRequest } = connectionRequest;
		const expiresIn = sessionRequest.expiresAt - Date.now();
		const shouldLog = shouldLogCountdown(expiresIn);

		displayQRWithCountdown(link, sessionRequest.expiresAt);

		if (shouldLog) {
			const formattedTime = formatRemainingTime(expiresIn);
			logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${expiresIn}s)`);
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
