/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';

import type { Modal } from '../../../domain';
import * as RNModals from './';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

t.describe('RN Modals', () => {
	let sessionRequest: SessionRequest;
	let modal: Modal | undefined;

	t.beforeEach(() => {
		sessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
			mode: 'trusted',
		};
	});
	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('rendering InstallModal on RN', async () => {
		const installModal = new RNModals.InstallModal({
			sessionRequest,
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createSessionRequest: vi.fn().mockResolvedValue(sessionRequest),
			updateSessionRequest: vi.fn(),
		});

		t.expect(installModal).toBeDefined();
		t.expect(installModal.unmount).toBeDefined();
		t.expect(installModal.mount).toBeDefined();
		t.expect((installModal as any).sync).not.toBeDefined();
		installModal.mount();
	});

	t.it('Rendering OTPCodeModal on RN', async () => {
		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		const otpCodeModal = new RNModals.OTPCodeModal({
			sdkVersion: '1.0.0',
			onClose: vi.fn(),
			updateOTPCode: vi.fn(),
			otpCode: '123456',
			createOTPCode: vi.fn().mockResolvedValue('123456'),
		});
		t.expect(otpCodeModal).toBeDefined();
		t.expect(otpCodeModal.unmount).toBeDefined();
		t.expect(otpCodeModal.mount).toBeDefined();
		otpCodeModal.mount();
	});
});
