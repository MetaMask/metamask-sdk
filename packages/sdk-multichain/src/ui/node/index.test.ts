/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import encodeQR from '@paulmillr/qr';
import * as t from 'vitest';
import { vi } from 'vitest';

import { AbstractInstallModal, AbstractOTPCodeModal, type Modal } from '../../domain';
import * as NodeModals from './';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

vi.mock('@paulmillr/qr', () => {
	return {
		default: vi.fn().mockReturnValue('qrcode'),
	};
});

t.describe('Node Modals', () => {
	let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;
	let consoleLogSpy: any;

	t.beforeAll(() => {
		t.vi.useFakeTimers();
		// Mock console.log to prevent QR codes from displaying in test output
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	t.afterAll(() => {
		consoleLogSpy.mockRestore();
	});

	t.afterEach(() => {
		modal?.unmount();
		consoleLogSpy.mockClear();
	});

	t.it('Check Modal instances', () => {
		t.expect(NodeModals.installModal).toBeInstanceOf(AbstractInstallModal);
		t.expect(NodeModals.otpCodeModal).toBeInstanceOf(AbstractOTPCodeModal);
	});

	t.it('rendering InstallModal on Node', async () => {
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
		};
		modal = await NodeModals.installModal.render({
			sessionRequest,
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createSessionRequest: vi.fn().mockResolvedValue(sessionRequest),
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect((modal as any).sync).not.toBeDefined();
		modal.mount();
		t.expect(encodeQR).toHaveBeenCalledWith(JSON.stringify(sessionRequest), 'ascii');
		t.expect(consoleLogSpy).toHaveBeenCalledWith('qrcode');
	});

	t.it('rendering InstallModal on Node and renew session after a second', async () => {
		const initialExpiresAt = Date.now() + 1000;
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: initialExpiresAt,
		};

		// Create a new session request for renewal with a different ID and later expiration
		const renewedSessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 2000,
		};

		const createSessionRequestMock = t.vi.fn().mockResolvedValueOnce(renewedSessionRequest); // Only mock the renewal call

		modal = await NodeModals.installModal.render({
			sessionRequest,
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createSessionRequest: createSessionRequestMock,
		});

		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect((modal as any).sync).not.toBeDefined();

		modal.mount();
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
	});

	t.it('Rendering OTPCodeModal on Node', async () => {
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
		};
		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		modal = await NodeModals.otpCodeModal.render({
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			updateOTPValue: vi.fn(),
			sessionRequest,
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect(modal.sync).toBeDefined();
		modal.mount();
	});
});
