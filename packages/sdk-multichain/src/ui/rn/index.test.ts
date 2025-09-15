/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';
import { vi } from 'vitest';

import { AbstractInstallModal, AbstractOTPCodeModal, type Modal } from '../../domain';
import * as RNModals from './';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

t.describe('RN Modals', () => {
	let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;

	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('Check Modal instances', () => {
		t.expect(RNModals.installModal).toBeInstanceOf(AbstractInstallModal);
		t.expect(RNModals.otpCodeModal).toBeInstanceOf(AbstractOTPCodeModal);
	});

	t.it('rendering InstallModal on RN', async () => {
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
		};
		modal = await RNModals.installModal.render({
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
	});

	t.it('Rendering OTPCodeModal on RN', async () => {
		const sessionRequest: SessionRequest = {
			id: crypto.randomUUID(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
		};
		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		modal = await RNModals.otpCodeModal.render({
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
