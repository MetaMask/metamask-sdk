import * as t from 'vitest';
import type { ConnectionRequest, QRLink } from '../../../domain';

import { AbstractInstallModal } from './AbstractInstallModal';

const mountMock = t.vi.fn();
const unmountMock = t.vi.fn();
class TestInstallModal extends AbstractInstallModal {
	// Make protected methods public for testing
	public updateLink(link: QRLink): void {
		super.updateLink(link);
	}

	public updateExpiresIn(expiresIn: number): void {
		super.updateExpiresIn(expiresIn);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	renderQRCode(): void {
		// mock
	}

	mount(): void {
		mountMock();
	}

	unmount(): void {
		unmountMock();
	}
}

t.describe('AbstractInstallModal', () => {
	let modal: TestInstallModal;
	const mockConnectionRequest = {
		sessionRequest: {
			expiresAt: Date.now() + 100000,
			id: 'mock-session-id',
		},
	} as ConnectionRequest;

	t.beforeEach(() => {
		modal = new TestInstallModal({
			link: 'initial-link',
			connectionRequest: mockConnectionRequest,
			onClose: t.vi.fn(),
			createConnectionRequest: t.vi.fn(),
			generateQRCode: t.vi.fn(),
			startDesktopOnboarding: t.vi.fn(),
			preferDesktop: false,
			expiresIn: (mockConnectionRequest.sessionRequest.expiresAt - Date.now()) / 1000,
		});
		(modal as any).instance = { link: '', expiresIn: 0 };
	});

	t.describe('QR Code Link Management', () => {
		t.it('should correctly manage QR code link data', () => {
			// Set initial link and verify getter returns correct value
			t.expect(modal.link).toBe('initial-link');

			// Update link via setter and verify instance property is updated
			modal.link = 'updated-link-setter';
			t.expect(modal.link).toBe('updated-link-setter');

			// Update link via `updateLink()` method and verify both data and instance are updated
			modal.updateLink('updated-link-method');
			t.expect(modal.link).toBe('updated-link-method');
			t.expect((modal as any).instance.link).toBe('updated-link-method');
		});

		t.it('should handle undefined instance gracefully when updating link', () => {
			(modal as any).instance = undefined;
			modal.updateLink('another-link');
			t.expect(modal.link).toBe('another-link');
			// No error should be thrown
		});
	});

	t.describe('Connection Request Management', () => {
		t.it('should correctly manage connection request data', () => {
			// Set initial connection request and verify getter
			t.expect(modal.connectionRequest).toBe(mockConnectionRequest);

			// Update connection request and verify proper assignment
			const newConnectionRequest = {
				sessionRequest: { expiresAt: Date.now() + 200000, id: 'new-session-id' },
			} as ConnectionRequest;
			modal.connectionRequest = newConnectionRequest;
			t.expect(modal.connectionRequest).toBe(newConnectionRequest);
		});
	});

	t.describe('Expiration Time Updates', () => {
		t.it('should handle expiration time updates correctly', () => {
			// Update with positive expiration time and verify instance update
			modal.updateExpiresIn(120);
			t.expect((modal as any).instance.expiresIn).toBe(120);

			// Handle negative expiration time (should not update instance)
			modal.updateExpiresIn(-10);
			t.expect((modal as any).instance.expiresIn).toBe(120);

			// Handle zero expiration time
			modal.updateExpiresIn(0);
			t.expect((modal as any).instance.expiresIn).toBe(0);
		});

		t.it('should handle undefined instance gracefully', () => {
			(modal as any).instance = undefined;
			t.expect(() => modal.updateExpiresIn(100)).not.toThrow();
		});
	});

	t.describe('Expiration and Regeneration', () => {
		t.beforeEach(() => {
			t.vi.useFakeTimers();
		});

		t.afterEach(() => {
			t.vi.useRealTimers();
		});

		t.it('should start expiration check and regenerate QR code when expired', async () => {
			const expireInSeconds = 2;
			const expirationDate = Date.now() + expireInSeconds * 1000;
			const connectionRequestToExpire: ConnectionRequest = {
				...mockConnectionRequest,
				sessionRequest: { ...mockConnectionRequest.sessionRequest, expiresAt: expirationDate },
			};

			const createConnectionRequestMock = t.vi.fn().mockResolvedValue({
				sessionRequest: { expiresAt: Date.now() + 60000, id: 'new-session-id' },
			});
			const generateQRCodeMock = t.vi.fn().mockResolvedValue('new-link');

			modal = new TestInstallModal({
				...(modal as any).options,
				createConnectionRequest: createConnectionRequestMock,
				generateQRCode: generateQRCodeMock,
			});
			const renderQRCodeMock = t.vi.spyOn(modal, 'renderQRCode');

			(modal as any).startExpirationCheck(connectionRequestToExpire);

			// Fast-forward time to just before expiration
			await t.vi.advanceTimersByTimeAsync((expireInSeconds - 1) * 1000);
			t.expect(createConnectionRequestMock).not.toHaveBeenCalled();
			t.expect(generateQRCodeMock).toHaveBeenCalledTimes(1);

			// Fast-forward time to after expiration
			await t.vi.advanceTimersByTimeAsync(1000);
			t.expect(createConnectionRequestMock).toHaveBeenCalledTimes(1);
			t.expect(generateQRCodeMock).toHaveBeenCalledTimes(2);
			t.expect(renderQRCodeMock).toHaveBeenCalledWith('new-link', t.expect.any(Object));
			t.expect(modal.link).toBe('new-link');
		});

		t.it('should stop expiration check', () => {
			const clearIntervalSpy = t.vi.spyOn(global, 'clearInterval');
			(modal as any).startExpirationCheck(mockConnectionRequest);
			(modal as any).stopExpirationCheck();
			t.expect(clearIntervalSpy).toHaveBeenCalled();
		});
	});
});
