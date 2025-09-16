/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type InstallWidgetProps, type Modal, type OTPCode, type OTPCodeWidgetProps, PlatformType } from '../domain';
import { ModalFactory } from './index';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import { AbstractInstallModal } from './modals/base/AbstractInstallModal';
import type { FactoryModals } from './modals/types';

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

t.describe('ModalFactory', () => {
	let mockModal: Modal<SessionRequest, InstallWidgetProps> | Modal<OTPCode, OTPCodeWidgetProps>;
	let mockModalOptions: t.Mock<() => InstallWidgetProps | OTPCodeWidgetProps>;
	let mockData: t.Mock<() => SessionRequest | OTPCode>;

	let mockFactoryOptions: FactoryModals;
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

		mockData = t.vi.fn<() => SessionRequest | OTPCode>();
		mockModalOptions = t.vi.fn<() => InstallWidgetProps | OTPCodeWidgetProps>();
		// Mock rendered modal
		mockModal = {
			__data: mockData(),
			__options: mockModalOptions(),
			get data() {
				return this.__data;
			},
			set data(data: SessionRequest | OTPCode) {
				this.__data = data;
			},
			get options() {
				return this.__options;
			},
			set options(options: InstallWidgetProps | OTPCodeWidgetProps) {
				this.options = options;
			},
			mount: t.vi.fn(),
			unmount: t.vi.fn(),
		} as any;

		mockFactoryOptions = {
			InstallModal: vi.fn().mockImplementation((options: InstallWidgetProps) => ({ ...mockModal, options })),
			OTPCodeModal: vi.fn().mockImplementation((options: OTPCodeWidgetProps) => ({ ...mockModal, options })),
		} as any;
	});

	afterEach(() => {
		t.vi.unstubAllGlobals();
		t.vi.restoreAllMocks();
	});

	describe('Constructor validation', () => {
		it('should throw an exception if required modals are not present', () => {
			expect(() => new ModalFactory({} as any)).toThrow('Missing required modals: InstallModal, OTPCodeModal');
		});

		it('should throw an exception if only some modals are missing', () => {
			const partialOptions = {
				InstallModal: mockModal,
			};
			expect(() => new ModalFactory(partialOptions as any)).toThrow('Missing required modals: OTPCodeModal');
		});

		it('should create successfully with all required modals', () => {
			expect(() => new ModalFactory(mockFactoryOptions)).not.toThrow();
		});
	});

	describe('Platform detection properties', () => {
		it('should correctly identify mobile platform (React Native)', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.ReactNative);

			const modalFactory = new ModalFactory(mockFactoryOptions);
			expect(modalFactory.isMobile).toBe(true);
			expect(modalFactory.isNode).toBe(false);
			expect(modalFactory.isWeb).toBe(false);
		});

		it('should correctly identify Node.js platform', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.NonBrowser);

			const modalFactory = new ModalFactory(mockFactoryOptions);
			expect(modalFactory.isMobile).toBe(false);
			expect(modalFactory.isNode).toBe(true);
			expect(modalFactory.isWeb).toBe(false);
		});

		it('should correctly identify web platforms', async () => {
			const webPlatforms = [PlatformType.DesktopWeb, PlatformType.MetaMaskMobileWebview, PlatformType.MobileWeb];

			for (const platform of webPlatforms) {
				const { getPlatformType } = await import('../domain');
				t.vi.mocked(getPlatformType).mockReturnValue(platform);

				const modalFactory = new ModalFactory(mockFactoryOptions);
				expect(modalFactory.isMobile).toBe(false);
				expect(modalFactory.isNode).toBe(false);
				expect(modalFactory.isWeb).toBe(true);
			}
		});
	});

	describe('Modal rendering', () => {
		let uiModule: ModalFactory;
		let mockContainer: HTMLDivElement;

		beforeEach(() => {
			uiModule = new ModalFactory(mockFactoryOptions);
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
					() => {},
				);

				expect(document.body.contains(mockContainer)).toBe(true);

				expect(mockFactoryOptions.InstallModal).toHaveBeenCalledWith(
					expect.objectContaining({
						parentElement: mockContainer,
						sessionRequest,
						preferDesktop,
						sdkVersion: '1.0.0',
					}),
				);
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

				await uiModule.renderInstallModal(
					preferDesktop,
					createSessionRequestMock,
					() => {},
					() => {},
				);

				expect(mockFactoryOptions.InstallModal).toHaveBeenCalledWith(
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
					() => {},
				);

				const constructorArgs = (mockFactoryOptions.InstallModal as any).mock.calls[0][0];

				constructorArgs.onClose();

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
					() => {},
				);

				const constructorArgs = (mockFactoryOptions.InstallModal as any).mock.calls[0][0];
				constructorArgs.startDesktopOnboarding();

				expect(mockModal.unmount).toHaveBeenCalled();
			});
		});

		describe('renderOTPCodeModal', () => {
			it('should render OTP code modal with placeholder props', async () => {
				await uiModule.renderOTPCodeModal(
					() => Promise.resolve('123456' as OTPCode),
					() => {},
					() => {},
				);

				expect(mockFactoryOptions.OTPCodeModal).toHaveBeenCalled();
				expect(mockModal.mount).toHaveBeenCalled();
			});
		});
	});

	describe('Error handling', () => {
		it('should handle modal rendering errors gracefully', async () => {
			const errorOptions = {
				...mockFactoryOptions,
			};
			vi.spyOn(errorOptions, 'InstallModal').mockImplementation(
				() =>
					({
						mount: vi.fn().mockImplementation(() => {
							throw new Error('Render failed');
						}),
						unmount: vi.fn(),
					}) as any,
			);

			const uiModule = new ModalFactory(errorOptions);
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
					() => {},
				),
			).rejects.toThrow('Render failed');
		});
	});

	describe('Modal lifecycle', () => {
		let uiModule: ModalFactory;

		beforeEach(() => {
			uiModule = new ModalFactory(mockFactoryOptions);
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
				() => {},
			);
			const firstModal = mockModal;

			// Mock a new modal for the second render
			const secondModal = {
				mount: t.vi.fn(),
				unmount: t.vi.fn(),
			};
			(mockFactoryOptions.OTPCodeModal as any).mockReturnValue(secondModal);

			// Render second modal
			await uiModule.renderOTPCodeModal(
				() => Promise.resolve('123456' as OTPCode),
				() => {},
				() => {},
			);

			// First modal should be unmounted, second modal should be mounted
			expect(firstModal.unmount).toHaveBeenCalled();
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
			const { ModalFactory: FreshUIModule } = (await t.vi.importActual('./index')) as any;

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
					() => {},
				),
			).resolves.not.toThrow();

			// Verify the modal was rendered despite preload failure
			expect(mockFactoryOptions.InstallModal).toHaveBeenCalled();
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
				class TestInstallModal extends AbstractInstallModal {
					instance: any;

					constructor() {
						super({ sessionRequest: null } as any);
						this.instance = {
							querySelector: t.vi.fn((selector: string) => {
								if (selector === 'mm-install-modal') {
									return mockInstallModal;
								}
								return null;
							}),
						};
					}

					mount() {}

					unmount() {}
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
				testModal.updateSessionRequest(sessionRequest);

				// Verify the install modal's link was updated
				expect(testModal.sessionRequest).toBe(sessionRequest);
			});

			it('should handle case where install modal is not found', async () => {
				class TestNoModal extends AbstractInstallModal {
					instance: any;

					constructor() {
						super({ sessionRequest: null } as any);
						this.instance = {
							querySelector: t.vi.fn(() => null), // No modals found
						};
					}

					mount() {}

					unmount() {}
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
				expect(() => testModal.updateSessionRequest(sessionRequest)).not.toThrow();
			});

			it('should handle case where instance is undefined', async () => {
				class TestUndefinedModal extends AbstractInstallModal {
					constructor() {
						super({ sessionRequest: null } as any);
					}

					mount() {}

					unmount() {}
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
				expect(() => testModal.updateSessionRequest(sessionRequest)).not.toThrow();
			});
		});

		describe('Integration with ModalFactory modals', () => {
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

			it('should support updateQRCode on install modal through ModalFactory', async () => {
				const sessionRequest: SessionRequest = {
					id: crypto.randomUUID(),
					channel: 'test',
					publicKeyB64: 'test',
					expiresAt: Date.now() + 1000,
					mode: 'trusted',
				};

				const newSessionRequest: SessionRequest = {
					...sessionRequest,
					id: crypto.randomUUID(),
				};

				const mockInstallModalMount = vi.fn<() => HTMLMmInstallModalElement>().mockImplementation(function (this: AbstractInstallModal) {
					const modal = document.createElement('mm-install-modal');
					modal.sessionRequest = this.options.sessionRequest;
					modal.sdkVersion = this.options.sdkVersion;
					modal.preferDesktop = this.options.preferDesktop;
					this.options.parentElement?.appendChild(modal);
					this.instance = modal;
					return modal;
				});

				const mockInstallModalUnMount = vi.fn().mockImplementation(function (this: AbstractInstallModal) {
					if (this.instance && this.options.parentElement?.contains(this.instance)) {
						this.options.parentElement.removeChild(this.instance);
					}
				});

				// Create modal factory options with real modal-like behavior
				class MockInstallModal extends AbstractInstallModal {
					mount = mockInstallModalMount;
					unmount = mockInstallModalUnMount;
				}

				const testFactoryOptions = {
					...mockFactoryOptions,
					InstallModal: vi.fn().mockImplementation((options: InstallWidgetProps) => new MockInstallModal(options)),
				};

				const testUIModule = new ModalFactory(testFactoryOptions);

				// Render the modal
				await testUIModule.renderInstallModal(
					false,
					() => Promise.resolve(sessionRequest),
					() => {},
					() => {},
				);

				// Verify the modal was rendered with the initial link
				expect(testFactoryOptions.InstallModal).toHaveBeenCalledWith(expect.objectContaining({ sessionRequest }));
				expect(mockInstallModalMount).toHaveBeenCalled();

				// Verify initial link was set
				expect((testUIModule as any).modal?.sessionRequest).toBe(sessionRequest);

				// Test updateQRCode functionality
				(testUIModule as any).modal?.updateSessionRequest(newSessionRequest);
				expect((testUIModule as any).modal?.sessionRequest).toBe(newSessionRequest);
			});
		});
	});
});
