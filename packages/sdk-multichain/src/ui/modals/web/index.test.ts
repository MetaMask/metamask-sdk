/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { vi } from 'vitest';

import type { Modal } from '../../../domain';
import * as WebModals from './';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { v4 } from 'uuid';

t.describe('WEB Modals', () => {
	let modal: Modal | undefined;
	let sessionRequest: SessionRequest;

	t.beforeAll(() => {
		const dom = new Page("<!DOCTYPE html><div id='root'></div>", {
			url: 'https://dapp.io/',
		});
		const globalStub = {
			...dom.window,
			addEventListener: t.vi.fn(),
			removeEventListener: t.vi.fn(),
			localStorage: t.vi.fn(),
		};
		t.vi.stubGlobal('navigator', {
			...dom.window.navigator,
			product: 'Chrome',
		});
		t.vi.stubGlobal('window', globalStub);
		t.vi.stubGlobal('location', dom.window.location);
		t.vi.stubGlobal('document', dom.window.document);
	});

	t.beforeEach(() => {
		sessionRequest = {
			id: v4(),
			channel: 'test',
			publicKeyB64: 'test',
			expiresAt: Date.now() + 1000,
			mode: 'trusted',
		};
	});

	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('rendering InstallModal on Web', async () => {
		const installModal = new WebModals.InstallModal({
			parentElement: document.getElementById('root')!,
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
		installModal.mount();

		modal = installModal;
	});

	t.it('Rendering OTPCodeModal on Web', async () => {
		const otpCodeModal = new WebModals.OTPCodeModal({
			parentElement: document.getElementById('root')!,
			sdkVersion: '1.0.0',
			onClose: vi.fn(),
			createOTPCode: vi.fn().mockResolvedValue('123456'),
			updateOTPCode: vi.fn(),
			otpCode: '123456',
		});

		t.expect(otpCodeModal).toBeDefined();
		t.expect(otpCodeModal.unmount).toBeDefined();
		t.expect(otpCodeModal.mount).toBeDefined();

		otpCodeModal.mount();

		modal = otpCodeModal;
	});
});
