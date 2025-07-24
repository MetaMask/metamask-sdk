/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import encodeQR from '@paulmillr/qr';
import * as t from 'vitest';
import { vi } from 'vitest';

import { AbstractInstallModal, AbstractPendingModal, type Modal } from '../../domain';
import * as NodeModals from './';

vi.mock('@paulmillr/qr', () => {
	return {
		default: vi.fn().mockReturnValue('qrcode'),
	};
});

t.describe('Node Modals', () => {
	let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;

	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('Check Modal instances', () => {
		t.expect(NodeModals.installModal).toBeInstanceOf(AbstractInstallModal);
		t.expect(NodeModals.selectModal).toBeInstanceOf(AbstractInstallModal);
		t.expect(NodeModals.pendingModal).toBeInstanceOf(AbstractPendingModal);
	});

	t.it('rendering InstallModal on Node', async () => {
		const logSpy = vi.spyOn(console, 'log');
		modal = await NodeModals.installModal.render({
			link: 'https://example.com',
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			onAnalyticsEvent: vi.fn(),
			metaMaskInstaller: {
				startDesktopOnboarding: vi.fn(),
			},
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect((modal as any).sync).not.toBeDefined();
		modal.mount();
		t.expect(encodeQR).toHaveBeenCalledWith('https://example.com', 'ascii');
		t.expect(logSpy).toHaveBeenCalledWith('qrcode');
	});

	t.it('Rendering PendingModal on Node', async () => {
		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		modal = await NodeModals.pendingModal.render({
			otpCode: '123456',
			onClose: vi.fn(),
			updateOTPValue: vi.fn(),
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect(modal.sync).toBeDefined();
		modal.mount();

		await new Promise((resolve) => setTimeout(resolve, 100));

		modal.sync!('123456');
	});

	t.it('Rendering SelectModal on Node', async () => {
		//TODO:selectModal  Modal is currently not doing much but will be a placeholder for the future 2fa modal
		modal = await NodeModals.selectModal.render({
			link: 'https://example.com',
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			connect: vi.fn(),
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		modal.mount();
	});
});
