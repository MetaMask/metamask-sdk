import { type ConnectionRequest, createLogger, type InstallWidgetProps, Modal, type QRLink } from '../../../domain';
import { formatRemainingTime, shouldLogCountdown } from './utils';

const logger = createLogger('metamask-sdk:ui');

export abstract class AbstractInstallModal extends Modal<QRLink, InstallWidgetProps> {
	protected instance?: HTMLMmInstallModalElement | undefined;
	private expirationInterval: NodeJS.Timeout | null = null;
	private lastLoggedCountdown: number = -1;

	abstract renderQRCode(link: QRLink, connectionRequest: ConnectionRequest): void;

	get link() {
		return this.data;
	}

	set link(link: QRLink) {
		this.data = link;
	}

	get connectionRequest() {
		return this.options.connectionRequest;
	}

	set connectionRequest(connectionRequest: ConnectionRequest) {
		this.options.connectionRequest = connectionRequest;
	}

	protected updateLink(link: QRLink) {
		this.link = link;
		if (this.instance) {
			this.instance.link = link;
		}
	}

	protected updateExpiresIn(expiresIn: number) {
		if (expiresIn >= 0 && this.instance) {
			this.instance.expiresIn = expiresIn;
		}
	}

	protected startExpirationCheck(connectionRequest: ConnectionRequest) {
		this.stopExpirationCheck();

		this.expirationInterval = setInterval(async () => {
			const { sessionRequest } = connectionRequest;
			const now = Date.now();
			const remainingMs = sessionRequest.expiresAt - now;

			const remainingSeconds = Math.floor(remainingMs / 1000);

			if (remainingMs > 0 && shouldLogCountdown(remainingSeconds) && this.lastLoggedCountdown !== remainingSeconds) {
				const formattedTime = formatRemainingTime(remainingMs);
				logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${remainingSeconds}s)`);
				this.lastLoggedCountdown = remainingSeconds;
			}

			if (now >= sessionRequest.expiresAt) {
				logger('[UI: InstallModal-nodejs()] ⏰ QR code EXPIRED! Generating new one...');

				try {
					// Generate new session request
					const connectionRequest = await this.options.createConnectionRequest();
					const generateQRCode = await this.options.generateQRCode(connectionRequest);

					this.lastLoggedCountdown = -1; // Reset countdown logging

					//Update local instances with new data
					this.updateLink(generateQRCode);
					this.updateExpiresIn(remainingSeconds);

					// Render QRCode on each platform
					this.renderQRCode(generateQRCode, connectionRequest);
				} catch (error) {
					logger(`[UI: InstallModal-nodejs()] ❌ Error generating new QR code: ${error}`);
				}
			}
		}, 1000);
	}

	protected stopExpirationCheck() {
		if (this.expirationInterval) {
			clearInterval(this.expirationInterval);
			this.expirationInterval = null;
			logger('[UI: InstallModal-nodejs()] 🛑 Stopped QR code expiration checking');
		}
	}
}
