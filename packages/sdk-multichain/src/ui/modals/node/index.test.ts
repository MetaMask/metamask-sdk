/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import encodeQR from '@paulmillr/qr';
import * as t from 'vitest';
import { vi } from 'vitest';

import type { Modal } from '../../../domain';
import * as NodeModals from './';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

vi.mock('@paulmillr/qr', () => {
	return {
		default: vi.fn().mockReturnValue('qrcode'),
	};
});

t.describe('Node Modals', () => {
	let sessionRequest: SessionRequest;
	let modal: Modal | undefined;
	let consoleLogSpy: any;

	t.beforeAll(() => {
		t.vi.useFakeTimers();
		// Mock console.log to prevent QR codes from displaying in test output
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	t.beforeEach(() => {
		sessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
			mode: 'trusted',
		};
	});

	t.afterAll(() => {
		consoleLogSpy.mockRestore();
	});

	t.afterEach(() => {
		modal?.unmount();
		consoleLogSpy.mockClear();
	});

	t.it('rendering InstallModal on Node', async () => {
		const installModal = new NodeModals.InstallModal({
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createSessionRequest: vi.fn().mockResolvedValue(sessionRequest),
			updateSessionRequest: vi.fn(),
			sessionRequest,
		});
		t.expect(installModal.unmount).toBeDefined();
		t.expect(installModal.mount).toBeDefined();
		installModal.mount();
		t.expect(encodeQR).toHaveBeenCalledWith(JSON.stringify(sessionRequest), 'ascii');
		t.expect(consoleLogSpy).toHaveBeenCalledWith('qrcode');
		modal = installModal;
	});

	t.it('rendering InstallModal on Node and renew session after a second', async () => {
		const initialExpiresAt = Date.now() + 1000;
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: initialExpiresAt,
			mode: 'trusted',
		};
		// Create a new session request for renewal with a different ID and later expiration
		const renewedSessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 2000,
			mode: 'trusted',
		};

		const createSessionRequestMock = t.vi.fn().mockResolvedValueOnce(renewedSessionRequest); // Only mock the renewal call
		const installModal = new NodeModals.InstallModal({
			sessionRequest,
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createSessionRequest: createSessionRequestMock,
			updateSessionRequest: vi.fn(),
		});

		t.expect(installModal.unmount).toBeDefined();
		t.expect(installModal.mount).toBeDefined();

		installModal.mount();
		t.expect(encodeQR).toHaveBeenCalledWith(JSON.stringify(sessionRequest), 'ascii');
		t.expect(consoleLogSpy).toHaveBeenCalledWith('qrcode');

		// Verify initial call count
		t.expect(createSessionRequestMock).toHaveBeenCalledTimes(0);

		// Store the initial call count for encodeQR
		const initialEncodeQRCallCount = (encodeQR as any).mock.calls.length;

		// Advance timers to trigger expiration (1000ms + a bit more to ensure expiration)
		await t.vi.advanceTimersByTimeAsync(1100);

		// Verify that createSessionRequest was called for renewal
		t.expect(createSessionRequestMock).toHaveBeenCalledTimes(1);

		// Verify that encodeQR was called again (for renewal)
		t.expect(encodeQR).toHaveBeenCalledTimes(initialEncodeQRCallCount + 1);

		// Verify that the QR code was regenerated with the renewed session request
		t.expect(encodeQR).toHaveBeenLastCalledWith(JSON.stringify(renewedSessionRequest), 'ascii');

		modal = installModal;
	});

	t.it('Rendering OTPCodeModal on Node', async () => {
		const otpCode = '123456';

		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		const otpCodeModal = new NodeModals.OTPCodeModal({
			otpCode,
			parentElement: undefined,
			onClose: vi.fn() as any,
			createOTPCode: vi.fn().mockResolvedValue(otpCode),
			updateOTPCode: vi.fn() as any,
			onDisconnect: vi.fn() as any,
			sdkVersion: '1.0.0',
		});

		t.expect(otpCodeModal).toBeDefined();
		t.expect(otpCodeModal.unmount).toBeDefined();
		t.expect(otpCodeModal.mount).toBeDefined();
		otpCodeModal.mount();

		modal = otpCodeModal;
	});
});
