import encodeQR from '@paulmillr/qr';
import { AbstractInstallModal, createLogger, type InstallWidgetProps } from '../../domain';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

const logger = createLogger('metamask-sdk:ui');

export class InstallModal extends AbstractInstallModal {
	instance!: HTMLMmInstallModalElement;
	private expirationInterval: NodeJS.Timeout | null = null;
	private currentSessionRequest: SessionRequest | null = null;
	private createSessionRequestFn: (() => Promise<SessionRequest>) | null = null;
	private lastLoggedCountdown: number = -1;
	private currentQRCode: string = '';

	async render({ sessionRequest, createSessionRequest }: InstallWidgetProps) {
		// The sessionRequest from props is actually a UISessionRequest, but we need the full one
		this.createSessionRequestFn = createSessionRequest;
		// Get the full session request for QR code generation
		this.currentSessionRequest = sessionRequest as SessionRequest;

		// Generate initial QR code
		this.generateQRCode(sessionRequest as SessionRequest);

		return {
			mount: () => {
				this.displayQRWithCountdown();
				this.startExpirationCheck();
			},
			unmount: () => {
				console.clear();
				this.stopExpirationCheck();
				this.currentSessionRequest = null;
				this.createSessionRequestFn = null;
				this.lastLoggedCountdown = -1;
				this.currentQRCode = '';
			},
		};
	}

	private generateQRCode(sessionRequest: SessionRequest) {
		const url = JSON.stringify(sessionRequest);
		this.currentQRCode = encodeQR(url, 'ascii');

		const remainingTime = this.formatRemainingTime(sessionRequest.expiresAt - Date.now());
		logger(`[UI: InstallModal-nodejs()] New QR code generated - url: ${url}, expiresAt: ${sessionRequest.expiresAt}, remaining: ${remainingTime}`);
	}

	private displayQRWithCountdown() {
		if (!this.currentSessionRequest || !this.currentQRCode) return;

		const now = Date.now();
		const remainingMs = this.currentSessionRequest.expiresAt - now;
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
			if (!this.currentSessionRequest || !this.createSessionRequestFn) {
				return;
			}

			const now = Date.now();
			const remainingMs = this.currentSessionRequest.expiresAt - now;
			const remainingSeconds = Math.floor(remainingMs / 1000);

			// Update console display every second
			this.displayQRWithCountdown();

			// Log countdown at appropriate intervals (to logger, not console)
			if (remainingMs > 0 && this.shouldLogCountdown(remainingSeconds) && this.lastLoggedCountdown !== remainingSeconds) {
				const formattedTime = this.formatRemainingTime(remainingMs);
				logger(`[UI: InstallModal-nodejs()] QR code expires in: ${formattedTime} (${remainingSeconds}s)`);
				this.lastLoggedCountdown = remainingSeconds;
			}

			if (now >= this.currentSessionRequest.expiresAt) {
				logger('[UI: InstallModal-nodejs()] ⏰ QR code EXPIRED! Generating new one...');

				try {
					// Generate new session request
					const newSessionRequest = await this.createSessionRequestFn();
					this.currentSessionRequest = newSessionRequest;
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
