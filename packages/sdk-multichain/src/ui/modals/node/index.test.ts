/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import encodeQR from '@paulmillr/qr';
import * as t from 'vitest';
import { vi } from 'vitest';

import { type ConnectionRequest, type Modal, PlatformType } from '../../../domain';
import * as NodeModals from './';
import packageJson from '../../../../package.json';

import { v4 } from 'uuid';

vi.mock('@paulmillr/qr', () => {
	return {
		default: vi.fn().mockReturnValue('qrcode'),
	};
});

t.describe('Node Modals', () => {
	let connectionRequest: ConnectionRequest;
	let modal: Modal<any> | undefined;
	let consoleLogSpy: any;

	t.beforeAll(() => {
		t.vi.useFakeTimers();
		// Mock console.log to prevent QR codes from displaying in test output
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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
					version: packageJson.version,
					platform: PlatformType.NonBrowser,
				},
			},
		};
	});

	t.afterAll(() => {
		consoleLogSpy.mockRestore();
	});

	t.afterEach(() => {
		modal?.unmount();
		consoleLogSpy.mockClear();
		(encodeQR as any).mockClear();
	});

	t.it('should render QR code and expiration time to the console', async () => {
		const expiresIn = (connectionRequest.sessionRequest.expiresAt - Date.now()) / 1000;
		const installModal = new NodeModals.InstallModal({
			sdkVersion: packageJson.version,
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createConnectionRequest: vi.fn().mockResolvedValue(connectionRequest),
			connectionRequest,
			link: 'test-link',
			generateQRCode: vi.fn().mockResolvedValue('test-link'),
			expiresIn,
		});

		installModal.mount();

		t.expect(encodeQR).toHaveBeenCalledWith('test-link', 'ascii');
		t.expect(consoleLogSpy).toHaveBeenCalledWith('qrcode'); // 'qrcode' is the mocked return value of encodeQR
		t.expect(consoleLogSpy).toHaveBeenCalledWith(t.expect.stringContaining('EXPIRES IN:'));

		modal = installModal;
	});

	t.it('rendering InstallModal on Node and renew session after a second', async () => {
		const initialExpiresAt = Date.now() + 1000;
		const connectionRequest: ConnectionRequest = {
			sessionRequest: {
				id: v4(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: initialExpiresAt,
				mode: 'trusted',
			},
			metadata: {
				dapp: {
					name: 'test',
					url: 'https://test.com',
				},
				sdk: {
					version: packageJson.version,
					platform: PlatformType.NonBrowser,
				},
			},
		};

		const renewedConnectionRequest: ConnectionRequest = {
			sessionRequest: {
				id: v4(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: Date.now() + 2000,
				mode: 'trusted',
			},
			metadata: {
				dapp: {
					name: 'test',
					url: 'https://test.com',
				},
				sdk: {
					version: packageJson.version,
					platform: PlatformType.NonBrowser,
				},
			},
		};

		const createConnectionRequestMock = vi.fn().mockResolvedValue(renewedConnectionRequest); // Only mock the renewal call
		const installModal = new NodeModals.InstallModal({
			sdkVersion: packageJson.version,
			preferDesktop: false,
			onClose: vi.fn(),
			startDesktopOnboarding: vi.fn(),
			createConnectionRequest: createConnectionRequestMock,
			connectionRequest,
			link: 'qrcode',
			generateQRCode: vi.fn().mockResolvedValue('qrcode'),
			expiresIn: (connectionRequest.sessionRequest.expiresAt - Date.now()) / 1000,
		});

		t.expect(installModal.unmount).toBeDefined();
		t.expect(installModal.mount).toBeDefined();

		installModal.mount();
		t.expect(encodeQR).toHaveBeenCalledWith('qrcode', 'ascii');
		t.expect(consoleLogSpy).toHaveBeenCalledWith('qrcode');

		// Verify initial call count
		t.expect(createConnectionRequestMock).toHaveBeenCalledTimes(0);

		// Store the initial call count for encodeQR
		const initialEncodeQRCallCount = (encodeQR as any).mock.calls.length;

		// Advance timers to trigger expiration (1000ms + a bit more to ensure expiration)
		await t.vi.advanceTimersByTimeAsync(1100);

		// Verify that createSessionRequest was called for renewal
		t.expect(createConnectionRequestMock).toHaveBeenCalledTimes(1);

		// Verify that encodeQR was called again (for renewal)
		t.expect(encodeQR).toHaveBeenCalledTimes(initialEncodeQRCallCount + 1);

		// Verify that the QR code was regenerated with the renewed session request
		t.expect(encodeQR).toHaveBeenLastCalledWith('qrcode', 'ascii');

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
			sdkVersion: packageJson.version,
		});

		t.expect(otpCodeModal).toBeDefined();
		t.expect(otpCodeModal.unmount).toBeDefined();
		t.expect(otpCodeModal.mount).toBeDefined();
		otpCodeModal.mount();

		modal = otpCodeModal;
	});
});
