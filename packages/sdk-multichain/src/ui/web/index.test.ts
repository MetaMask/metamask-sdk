/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { vi } from 'vitest';

import { AbstractInstallModal, AbstractOTPCodeModal, type Modal } from '../../domain';
import * as WebModals from './';

t.describe('WEB Modals', () => {
	let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;

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

	t.afterEach(() => {
		modal?.unmount();
	});

	t.it('Check Modal instances', () => {
		t.expect(WebModals.installModal).toBeInstanceOf(AbstractInstallModal);
		t.expect(WebModals.otpCodeModal).toBeInstanceOf(AbstractOTPCodeModal);
	});

	t.it('rendering InstallModal on Web', async () => {
		modal = await WebModals.installModal.render({
			parentElement: document.getElementById('root')!,
			link: 'https://example.com',
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			metaMaskInstaller: {
				startDesktopOnboarding: vi.fn(),
			},
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect((modal as any).sync).not.toBeDefined();
		modal.mount();
	});

	t.it('Rendering OTPCodeModal on Web', async () => {
		//TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
		modal = await WebModals.otpCodeModal.render({
			parentElement: document.getElementById('root')!,
			sdkVersion: '1.0.0',
			preferDesktop: false,
			onClose: vi.fn(),
			updateOTPValue: vi.fn(),
			link: 'https://example.com',
		});
		t.expect(modal).toBeDefined();
		t.expect(modal.unmount).toBeDefined();
		t.expect(modal.mount).toBeDefined();
		t.expect(modal.sync).toBeDefined();
		modal.mount();
	});
});
