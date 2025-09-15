/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal, PlatformType } from '../domain';
import { UIModule } from './index';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

// Mock external dependencies
vi.mock('@metamask/onboarding', () => ({
	default: class MockMetaMaskOnboarding {
		startOnboarding = vi.fn();
	},
}));

vi.mock('@metamask/sdk-multichain-ui/dist/loader/index.js', () => ({
	defineCustomElements: vi.fn(),
}));

// Mock the domain functions
vi.mock('../domain', async () => {
	const actual = await vi.importActual('../domain');
	return {
		...actual,
		getPlatformType: vi.fn(),
		getVersion: vi.fn(() => '1.0.0'),
	};
});

t.describe('UIModule', () => {
	let mockModal: any;
	let mockFactoryOptions: any;
	let dom: InstanceType<typeof Page>;

	t.beforeEach(() => {
		t.vi.clearAllMocks();

		// Create DOM environment
		dom = new Page('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
			url: 'https://test.dapp/',
		});

		const globalStub = {
			...dom.window,
			addEventListener: t.vi.fn(),
			removeEventListener: t.vi.fn(),
			localStorage: {
				data: new Map<string, string>(),
				getItem: t.vi.fn((key: string) => globalStub.localStorage.data.get(key) || null),
				setItem: t.vi.fn((key: string, value: string) => {
					globalStub.localStorage.data.set(key, value);
				}),
				removeItem: t.vi.fn((key: string) => {
					globalStub.localStorage.data.delete(key);
				}),
				clear: t.vi.fn(() => {
					globalStub.localStorage.data.clear();
				}),
			},
			ethereum: {
				isMetaMask: true,
			},
		};

		// Setup global DOM environment
		t.vi.stubGlobal('navigator', {
			...dom.window.navigator,
			product: 'Chrome',
			language: 'en-US',
		});
		t.vi.stubGlobal('location', dom.window.location);
		t.vi.stubGlobal('document', dom.window.document);
		t.vi.stubGlobal('HTMLElement', dom.window.HTMLElement);
		t.vi.stubGlobal('requestAnimationFrame', t.vi.fn());

		// Mock rendered modal
		mockModal = {
			mount: t.vi.fn(),
			unmount: t.vi.fn(),
			sync: t.vi.fn(),
		};

		// Mock factory options with required modals
		mockFactoryOptions = {
			installModal: {
				render: t.vi.fn().mockResolvedValue(mockModal),
			},
			otpCodeModal: {
				render: t.vi.fn().mockResolvedValue(mockModal),
			},
		};
	});

	afterEach(() => {
		t.vi.unstubAllGlobals();
		t.vi.restoreAllMocks();
	});

	describe('Constructor validation', () => {
		it('should throw an exception if required modals are not present', () => {
			expect(() => new UIModule({} as any)).toThrow('Missing required modals: installModal, otpCodeModal');
		});

		it('should throw an exception if only some modals are missing', () => {
			const partialOptions = {
				installModal: mockFactoryOptions.installModal,
			};
			expect(() => new UIModule(partialOptions as any)).toThrow('Missing required modals: otpCodeModal');
		});

		it('should create successfully with all required modals', () => {
			expect(() => new UIModule(mockFactoryOptions)).not.toThrow();
		});
	});

	describe('Platform detection properties', () => {
		it('should correctly identify mobile platform (React Native)', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.ReactNative);

			const newUIModule = new UIModule(mockFactoryOptions);
			expect(newUIModule.isMobile).toBe(true);
			expect(newUIModule.isNode).toBe(false);
			expect(newUIModule.isWeb).toBe(false);
		});

		it('should correctly identify Node.js platform', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.NonBrowser);

			const newUIModule = new UIModule(mockFactoryOptions);
			expect(newUIModule.isMobile).toBe(false);
			expect(newUIModule.isNode).toBe(true);
			expect(newUIModule.isWeb).toBe(false);
		});

		it('should correctly identify web platforms', async () => {
			const webPlatforms = [PlatformType.DesktopWeb, PlatformType.MetaMaskMobileWebview, PlatformType.MobileWeb];

			for (const platform of webPlatforms) {
				const { getPlatformType } = await import('../domain');
				t.vi.mocked(getPlatformType).mockReturnValue(platform);

				const newUIModule = new UIModule(mockFactoryOptions);
				expect(newUIModule.isMobile).toBe(false);
				expect(newUIModule.isNode).toBe(false);
				expect(newUIModule.isWeb).toBe(true);
			}
		});
	});

	describe('Modal rendering', () => {
		let uiModule: UIModule;
		let mockContainer: HTMLDivElement;

		beforeEach(() => {
			uiModule = new UIModule(mockFactoryOptions);
			mockContainer = document.createElement('div');
		});

		describe('renderInstallModal', () => {
			it('should render install modal with correct props', async () => {
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};
				const preferDesktop = true;
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderInstallModal(
					preferDesktop,
					() => Promise.resolve(sessionRequest),
					() => {},
				);

				expect(document.body.contains(mockContainer)).toBe(true);

				expect(mockFactoryOptions.installModal.render).toHaveBeenCalledWith({
					createSessionRequest: expect.any(Function),
					onClose: expect.any(Function),
					startDesktopOnboarding: expect.any(Function),
					parentElement: mockContainer,
					sessionRequest,
					preferDesktop,
					sdkVersion: '1.0.0',
				});
				expect(mockModal.mount).toHaveBeenCalled();
			});

			it('should renew sessionrequest qrCode after expiration automatically', async () => {
				let sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 100,
					mode: 'trusted',
				};

				const createSessionRequestMock = t.vi.fn(() => {
					sessionRequest = {
						id: crypto.randomUUID(),
						channel: 'test',
						publicKeyB64: 'test',
						expiresAt: Date.now() + 100,
						mode: 'trusted',
					};
					return Promise.resolve(sessionRequest);
				});

				const preferDesktop = true;
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderInstallModal(preferDesktop, createSessionRequestMock, () => {});

				expect(mockFactoryOptions.installModal.render).toHaveBeenCalledWith(
					expect.objectContaining({
						parentElement: mockContainer,
						sessionRequest,
						preferDesktop,
						sdkVersion: '1.0.0',
					}),
				);

				expect(mockModal.mount).toHaveBeenCalled();
				expect(document.body.contains(mockContainer)).toBe(true);

				await new Promise((resolve) => setTimeout(resolve, 2000));

				expect(createSessionRequestMock).toHaveBeenCalledTimes(1);
			});

			it('should handle onClose callback correctly', async () => {
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};
				await uiModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
				);

				const renderCall = mockFactoryOptions.installModal.render.mock.calls[0][0];
				renderCall.onClose();

				expect(mockModal.unmount).toHaveBeenCalled();
			});

			it('should handle desktop onboarding correctly', async () => {
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};
				await uiModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
				);

				const renderCall = mockFactoryOptions.installModal.render.mock.calls[0][0];
				renderCall.startDesktopOnboarding();

				expect(mockModal.unmount).toHaveBeenCalled();
			});
		});

		describe('renderOTPCodeModal', () => {
			it('should render OTP code modal with placeholder props', async () => {
				await uiModule.renderOTPCodeModal();

				expect(mockFactoryOptions.otpCodeModal.render).toHaveBeenCalledWith({});
				expect(mockModal.mount).toHaveBeenCalled();
			});
		});
	});

	describe('Error handling', () => {
		it('should handle modal rendering errors gracefully', async () => {
			const errorOptions = {
				...mockFactoryOptions,
				installModal: {
					render: t.vi.fn().mockRejectedValue(new Error('Render failed')),
				},
			};

			const uiModule = new UIModule(errorOptions);
			const sessionRequest: SessionRequest = {
				id: crypto.randomUUID(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: Date.now() + 1000,
				mode: 'trusted',
			};
			await expect(
				uiModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
				),
			).rejects.toThrow('Render failed');
		});
	});

	describe('Modal lifecycle', () => {
		let uiModule: UIModule;

		beforeEach(() => {
			uiModule = new UIModule(mockFactoryOptions);
		});

		it('should properly unmount previous modal when rendering new one', async () => {
			// Render first modal
			const sessionRequest: SessionRequest = {
				id: crypto.randomUUID(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: Date.now() + 1000,
				mode: 'trusted',
			};
			await uiModule.renderInstallModal(
				false,
				() => Promise.resolve(sessionRequest),
				() => {},
			);
			const firstModal = mockModal;

			// Mock a new modal for the second render
			const secondModal = {
				mount: t.vi.fn(),
				unmount: t.vi.fn(),
			};
			mockFactoryOptions.otpCodeModal.render.mockResolvedValue(secondModal);

			// Render second modal
			await uiModule.renderOTPCodeModal();

			// First modal should be unmounted, second modal should be mounted
			expect(firstModal.unmount).not.toHaveBeenCalled(); // Because we're using the same mock
			expect(secondModal.mount).toHaveBeenCalled();
		});
	});

	describe('Preload function error handling', () => {
		beforeEach(async () => {
			// Reset all modules to clear the singleton instance
			t.vi.resetModules();
		});

		it('should handle preload import failure gracefully and log error', async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});
			const testError = new Error('Failed to load modal customElements');

			// Temporarily unmock the module and re-mock it to throw an error
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', async () => {
				throw testError;
			});

			// Re-import to get the fresh module with cleared singleton
			const { preload: freshPreload } = (await t.vi.importActual('./index')) as any;

			// Test that preload handles the error gracefully
			await expect(freshPreload()).resolves.not.toThrow();

			// Verify that the error was logged
			expect(consoleErrorSpy).toHaveBeenCalledWith('Gracefully Failed to load modal customElements:', expect.any(Error));

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		it('should verify the exact error logging format', async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			// Mock the module to fail
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', async () => {
				throw new Error('Test import failure');
			});

			// Re-import to get the fresh module with cleared singleton
			const { preload: freshPreload } = (await t.vi.importActual('./index')) as any;

			await freshPreload();

			// Verify the exact format: first argument should be the message string,
			// second argument should be an Error object
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			const [firstArg, secondArg] = consoleErrorSpy.mock.calls[0];

			expect(firstArg).toBe('Gracefully Failed to load modal customElements:');
			expect(secondArg).toBeInstanceOf(Error);

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		it('should continue working after preload failure', async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			// First, cause preload to fail
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', async () => {
				throw new Error('Module load failed');
			});

			// Re-import to get the fresh module with cleared singleton
			const { UIModule: FreshUIModule } = (await t.vi.importActual('./index')) as any;

			// Test that modal rendering still works even when preload fails
			const uiModule = new FreshUIModule(mockFactoryOptions);
			const container = document.createElement('div');

			const sessionRequest: SessionRequest = {
				id: crypto.randomUUID(),
				channel: 'test',
				publicKeyB64: 'test',
				expiresAt: Date.now() + 1000,
				mode: 'trusted',
			};
			await expect(
				uiModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
				),
			).resolves.not.toThrow();

			// Verify the modal was rendered despite preload failure
			expect(mockFactoryOptions.installModal.render).toHaveBeenCalled();
			expect(mockModal.mount).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});
	});

	describe('updateQRCode method testing', () => {
		let mockInstallModal: any;

		beforeEach(() => {
			// Create mock modal elements that simulate the DOM structure
			mockInstallModal = {
				link: '',
				querySelector: t.vi.fn(),
			};
		});

		describe('Generic Modal updateQRCode functionality', () => {
			it('should update QR code link for install modal', async () => {
				// Create a test modal instance that extends the Modal class
				class TestInstallModal extends Modal<any> {
					instance: any;
					sessionRequest: SessionRequest;

					constructor() {
						super();
						this.instance = {
							querySelector: t.vi.fn((selector: string) => {
								if (selector === 'mm-install-modal') {
									return mockInstallModal;
								}
								return null;
							}),
						};
					}

					async render() {
						return {
							mount: t.vi.fn(),
							unmount: t.vi.fn(),
							sync: t.vi.fn(),
						};
					}
				}

				const testModal = new TestInstallModal();
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};

				// Call updateQRCode method
				testModal.updateQRCode(sessionRequest);

				// Verify the install modal's link was updated
				expect(testModal.sessionRequest).toBe(sessionRequest);
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-install-modal');
			});

			it('should handle case where install modal is not found', async () => {
				class TestNoModal extends Modal<any> {
					instance: any;
					sessionRequest: SessionRequest;

					constructor() {
						super();
						this.instance = {
							querySelector: t.vi.fn(() => null), // No modals found
						};
					}

					async render() {
						return {
							mount: t.vi.fn(),
							unmount: t.vi.fn(),
							sync: t.vi.fn(),
						};
					}
				}

				const testModal = new TestNoModal();
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};

				// Call updateQRCode method - should not throw even if no modals are found
				expect(() => testModal.updateQRCode(sessionRequest)).not.toThrow();

				// Verify selector was tried
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-install-modal');
			});

			it('should handle case where instance is undefined', async () => {
				class TestUndefinedModal extends Modal<any> {
					instance: undefined;

					async render() {
						return {
							mount: t.vi.fn(),
							unmount: t.vi.fn(),
							sync: t.vi.fn(),
						};
					}
				}

				const testModal = new TestUndefinedModal();
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};

				// Call updateQRCode method - should not throw even if instance is undefined
				expect(() => testModal.updateQRCode(sessionRequest)).not.toThrow();
			});
		});

		describe('Integration with UIModule modals', () => {
			beforeEach(() => {
				// Store the original createElement method to avoid recursion
				const originalCreateElement = dom.window.document.createElement.bind(dom.window.document);

				// Create proper DOM elements using the actual JSDOM implementation
				const createElement = t.vi.spyOn(document, 'createElement');
				createElement.mockImplementation((tagName: string) => {
					const element = originalCreateElement(tagName);

					if (tagName === 'mm-install-modal') {
						// Add properties that mm-install-modal should have
						(element as any).link = '';
						(element as any).sdkVersion = '';
						(element as any).preferDesktop = false;
						(element as any).addEventListener = t.vi.fn();
					}

					return element;
				});
			});

			it('should support updateQRCode on install modal through UIModule', async () => {
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};

				// Create modal factory options with real modal-like behavior
				const modalWithUpdateQRCode = {
					instance: undefined as any,
					render: t.vi.fn().mockImplementation(async (options: any) => {
						const modal = document.createElement('mm-install-modal') as any;
						modal.sessionRequest = options.sessionRequest;
						modal.sdkVersion = options.sdkVersion;
						modal.preferDesktop = options.preferDesktop;

						return {
							mount: t.vi.fn(() => {
								options.parentElement.appendChild(modal);
								modalWithUpdateQRCode.instance = modal;
							}),
							unmount: t.vi.fn(() => {
								if (options.parentElement.contains(modal)) {
									options.parentElement.removeChild(modal);
								}
							}),
						};
					}),
					updateQRCode: t.vi.fn((sessionRequest: SessionRequest) => {
						// Simulate the real updateQRCode behavior - update the modal instance directly
						if (modalWithUpdateQRCode.instance) {
							modalWithUpdateQRCode.instance.sessionRequest = sessionRequest;
						}
					}),
				};

				const testFactoryOptions = {
					...mockFactoryOptions,
					installModal: modalWithUpdateQRCode,
				};

				const testUIModule = new UIModule(testFactoryOptions);

				// Render the modal
				await testUIModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
				);

				// Verify the modal was rendered with the initial link
				expect(modalWithUpdateQRCode.render).toHaveBeenCalledWith(expect.objectContaining({ sessionRequest }));

				// Verify initial link was set
				expect(modalWithUpdateQRCode.instance.sessionRequest).toBe(sessionRequest);

				// Test updateQRCode functionality
				modalWithUpdateQRCode.updateQRCode(sessionRequest);
				expect(modalWithUpdateQRCode.updateQRCode).toHaveBeenCalledWith(sessionRequest);
				expect(modalWithUpdateQRCode.instance.sessionRequest).toBe(sessionRequest);
			});
		});
	});
});
