import encodeQR from '@paulmillr/qr';
import { createLogger } from '../../../domain';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { AbstractInstallModal } from '../base/AbstractInstallModal';

const logger = createLogger('metamask-sdk:ui');

export class InstallModal extends AbstractInstallModal {
	private expirationInterval: NodeJS.Timeout | null = null;
	private lastLoggedCountdown: number = -1;
	private currentQRCode: string = '';

	mount() {
		if (!this.sessionRequest) {
			throw new Error('Session request is required');
		}
		const { sessionRequest } = this;
		this.generateQRCode(sessionRequest);
		this.displayQRWithCountdown();
		this.startExpirationCheck();
	}

	unmount(): void {
		console.clear();
		this.stopExpirationCheck();
		this.lastLoggedCountdown = -1;
		this.currentQRCode = '';
	}

	private generateQRCode(sessionRequest: SessionRequest) {
		const url = JSON.stringify(sessionRequest);
		this.currentQRCode = encodeQR(url, 'ascii');

		const remainingTime = this.formatRemainingTime(sessionRequest.expiresAt - Date.now());
		logger(`[UI: InstallModal-nodejs()] New QR code generated - url: ${url}, expiresAt: ${sessionRequest.expiresAt}, remaining: ${remainingTime}`);
	}

	private displayQRWithCountdown() {
		if (!this.sessionRequest || !this.currentQRCode) return;

		const now = Date.now();
		const remainingMs = this.sessionRequest.expiresAt - now;
		const remainingTime = this.formatRemainingTime(remainingMs);
		const isExpired = remainingMs <= 0;

		// Clear console and display QR code with live countdown
		console.clear();

		console.log(this.currentQRCode);

		if (isExpired) {
			console.log('EXPIRED - Generating new QR code...');
		} else {
			console.log(`EXPIRES IN: ${remainingTime}`);
		}
	}

	private formatRemainingTime(milliseconds: number): string {
		if (milliseconds <= 0) return 'EXPIRED';

		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds % 60}s`;
		} else {
			return `${seconds}s`;
		}
	}

	private shouldLogCountdown(remainingSeconds: number): boolean {
		// Log at specific intervals to avoid spam
		if (remainingSeconds <= 10) {
			// Log every second for the last 10 seconds
			return true;
		} else if (remainingSeconds <= 30) {
			// Log every 5 seconds for the last 30 seconds
			return remainingSeconds % 5 === 0;
		} else if (remainingSeconds <= 60) {
			// Log every 10 seconds for the last minute
			return remainingSeconds % 10 === 0;
		} else if (remainingSeconds <= 300) {
			// Log every 30 seconds for the last 5 minutes
			return remainingSeconds % 30 === 0;
		} else {
			// Log every minute for longer durations
			return remainingSeconds % 60 === 0;
		}
	}

	private startExpirationCheck() {
		// Clear any existing interval
		this.stopExpirationCheck();

		this.expirationInterval = setInterval(async () => {
			if (!this.sessionRequest) {
				return;
			}

			const now = Date.now();
			const remainingMs = this.sessionRequest.expiresAt - now;
			const remainingSeconds = Math.floor(remainingMs / 1000);

			// Update console display every second
			this.displayQRWithCountdown();

			// Log countdown at appropriate intervals (to logger, not console)
			if (remainingMs > 0 && this.shouldLogCountdown(remainingSeconds) && this.lastLoggedCountdown !== remainingSeconds) {
				const formattedTime = this.formatRemainingTime(remainingMs);
				logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${remainingSeconds}s)`);
				this.lastLoggedCountdown = remainingSeconds;
			}

			if (now >= this.sessionRequest.expiresAt) {
				logger('[UI: InstallModal-nodejs()] ⏰ QR code EXPIRED! Generating new one...');

				try {
					// Generate new session request
					const newSessionRequest = await this.options.createSessionRequest();
					this.updateSessionRequest(newSessionRequest);
					this.lastLoggedCountdown = -1; // Reset countdown logging

					// Generate new QR code
					this.generateQRCode(newSessionRequest);
				} catch (error) {
					logger(`[UI: InstallModal-nodejs()] ❌ Error generating new QR code: ${error}`);
				}
			}
		}, 1000); // Check every second
	}

	private stopExpirationCheck() {
		if (this.expirationInterval) {
			clearInterval(this.expirationInterval);
			this.expirationInterval = null;
			logger('[UI: InstallModal-nodejs()] 🛑 Stopped QR code expiration checking');
		}
	}
}
