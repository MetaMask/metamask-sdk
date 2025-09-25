/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import * as t from 'vitest';

import { type ConnectionRequest, PlatformType, type Modal } from '../../../domain';
import * as RNModals from './';
import { v4 } from 'uuid';

t.describe('RN Modals', () => {
	let connectionRequest: ConnectionRequest;
	let modal: Modal | undefined;

	t.beforeEach(() => {
		connectionRequest = {
			sessionRequest: {
				id: v4(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: Date.now() + 1000,
				mode: 'trusted',
			},
			metadata: {
				dapp: {
					name: 'test',
					url: 'https://test.com',
				},
				sdk: {
					version: '1.0.0',
					platform: PlatformType.NonBrowser,
				},
			},
		};
	});
	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('rendering InstallModal on RN', async () => {
		const installModal = new RNModals.InstallModal({
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: t.vi.fn(),
			startDesktopOnboarding: t.vi.fn(),
			createConnectionRequest: t.vi.fn().mockResolvedValue(connectionRequest),
			connectionRequest,
			link: 'qrcode',
			generateQRCode: t.vi.fn().mockResolvedValue('qrcode'),
			expiresIn: (connectionRequest.sessionRequest.expiresAt - Date.now()) / 1000,
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
			onClose: t.vi.fn(),
			updateOTPCode: t.vi.fn(),
			otpCode: '123456',
			createOTPCode: t.vi.fn().mockResolvedValue('123456'),
		});
		t.expect(otpCodeModal).toBeDefined();
		t.expect(otpCodeModal.unmount).toBeDefined();
		t.expect(otpCodeModal.mount).toBeDefined();
		otpCodeModal.mount();
	});
});
