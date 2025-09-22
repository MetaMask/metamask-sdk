/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { vi } from 'vitest';

import { type ConnectionRequest, PlatformType, type Modal } from '../../../domain';
import * as WebModals from './';
import { v4 } from 'uuid';

const dom = new Page("<!DOCTYPE html><div id='root'></div>", {
	url: 'https://dapp.io/',
});
class CustomEvent extends dom.window.Event {
	detail: any;
	constructor(type: string, options?: CustomEventInit) {
		super(type, options);
		this.detail = options?.detail;
	}
}

t.describe('WEB Modals', () => {
	let modal: Modal | undefined;
	let connectionRequest: ConnectionRequest;

	t.beforeAll(() => {
		const dom = new Page("<!DOCTYPE html><div id='root'></div>", {
			url: 'https://dapp.io/',
		});

		// JSDOM does not implement CustomEvent, so we need to polyfill it.
		if (typeof global.CustomEvent === 'undefined') {
			global.CustomEvent = class CustomEvent<T> extends Event {
				detail: T;

				constructor(type: string, options?: CustomEventInit<T>) {
					super(type, options);
					this.detail = options?.detail as T;
				}
			} as any;
		}

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

	t.describe('InstallModal', () => {
		let installModal: WebModals.InstallModal;
		let onClose: () => void;
		let onStartDesktopOnboarding: () => void;

		t.beforeEach(() => {
			onClose = vi.fn();
			onStartDesktopOnboarding = vi.fn();

			installModal = new WebModals.InstallModal({
				sdkVersion: '1.0.0',
				preferDesktop: false,
				onClose,
				startDesktopOnboarding: onStartDesktopOnboarding,
				createConnectionRequest: vi.fn().mockResolvedValue(connectionRequest),
				connectionRequest,
				link: 'qrcode',
				generateQRCode: vi.fn().mockResolvedValue('qrcode'),
				expiresIn: (Date.now() - connectionRequest.sessionRequest.expiresAt) / 1000,
				parentElement: document.body,
			});
		});

		t.it('should mount and unmount the modal from the DOM', () => {
			installModal.mount();
			let modalElement = document.querySelector('mm-install-modal');
			t.expect(modalElement).not.toBeNull();

			installModal.unmount();
			modalElement = document.querySelector('mm-install-modal');
			t.expect(modalElement).toBeNull();
		});

		t.it('should set properties on the modal element', () => {
			installModal.mount();
			const modalElement = document.querySelector('mm-install-modal');
			t.expect(modalElement?.preferDesktop).toBe(false);
			t.expect(modalElement?.sdkVersion).toBe('1.0.0');
		});

		t.it('should handle close event', () => {
			installModal.mount();
			const modalElement = document.querySelector('mm-install-modal');
			modalElement?.addEventListener('close', (event: any) => {
				onClose(event.detail.shouldTerminate);
			});
			modalElement?.dispatchEvent(new CustomEvent('close', { detail: { shouldTerminate: true } }));
		});

		t.it('should handle startDesktopOnboarding event', () => {
			installModal.mount();
			const modalElement = document.querySelector('mm-install-modal');
			modalElement?.addEventListener('startDesktopOnboarding', () => {
				onStartDesktopOnboarding();
			});
			modalElement?.dispatchEvent(new CustomEvent('startDesktopOnboarding'));
		});
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
