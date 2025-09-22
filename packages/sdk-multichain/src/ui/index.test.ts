/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { type ConnectionRequest, type InstallWidgetProps, type Modal, type OTPCode, type OTPCodeWidgetProps, PlatformType, type QRLink } from '../domain';
import { ModalFactory } from './index';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { FactoryModals } from './modals/types';
import { v4 } from 'uuid';
import packageJson from '../../package.json';
// Mock external dependencies
t.vi.mock('@metamask/onboarding', () => ({
	default: class MockMetaMaskOnboarding {
		startOnboarding = t.vi.fn();
	},
}));

t.vi.mock('@metamask/sdk-multichain-ui/dist/loader/index.js', () => ({
	defineCustomElements: t.vi.fn(),
}));

// Mock the domain functions
t.vi.mock('../domain', async () => {
	const actual = await t.vi.importActual('../domain');
	return {
		...actual,
		getPlatformType: t.vi.fn(),
		getVersion: t.vi.fn(() => '1.0.0'),
	};
});

t.describe('ModalFactory', () => {
	let mockModal: Modal<QRLink, InstallWidgetProps> | Modal<OTPCode, OTPCodeWidgetProps>;
	let mockModalOptions: t.Mock<() => InstallWidgetProps | OTPCodeWidgetProps>;
	let mockData: t.Mock<() => QRLink | OTPCode>;

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
		t.vi.stubGlobal('CustomEvent', dom.window.CustomEvent);

		const windowStub = {
			...dom.window,
			open: t.vi.fn(),
			addEventListener: t.vi.fn(),
			removeEventListener: t.vi.fn(),
			dispatchEvent: t.vi.fn(),
			CustomEvent: dom.window.CustomEvent,
		};
		t.vi.stubGlobal('window', windowStub);

		const sessionStorageMock = {
			data: new Map<string, string>(),
			getItem: t.vi.fn((key: string) => sessionStorageMock.data.get(key) || null),
			setItem: t.vi.fn((key: string, value: string) => {
				sessionStorageMock.data.set(key, value);
			}),
			removeItem: t.vi.fn((key: string) => {
				sessionStorageMock.data.delete(key);
			}),
			clear: t.vi.fn(() => {
				sessionStorageMock.data.clear();
			}),
		};
		t.vi.stubGlobal('sessionStorage', sessionStorageMock);

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
			InstallModal: t.vi.fn().mockImplementation((options: InstallWidgetProps) => ({ ...mockModal, options })),
			OTPCodeModal: t.vi.fn().mockImplementation((options: OTPCodeWidgetProps) => ({ ...mockModal, options })),
		} as any;
	});

	t.afterEach(() => {
		t.vi.unstubAllGlobals();
		t.vi.restoreAllMocks();
	});

	t.describe('Constructor validation', () => {
		t.it('should throw an exception if required modals are not present', () => {
			t.expect(() => new ModalFactory({} as any)).toThrow('Missing required modals: InstallModal, OTPCodeModal');
		});

		t.it('should throw an exception if only some modals are missing', () => {
			const partialOptions = {
				InstallModal: mockModal,
			};
			t.expect(() => new ModalFactory(partialOptions as any)).toThrow('Missing required modals: OTPCodeModal');
		});

		t.it('should create successfully with all required modals', () => {
			t.expect(() => new ModalFactory(mockFactoryOptions)).not.toThrow();
		});
	});

	t.describe('Platform detection properties', () => {
		t.it('should correctly identify mobile platform (React Native)', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.ReactNative);

			t.vi.resetModules();
			const { ModalFactory: TestModalFactory } = await import('./index');

			const modalFactory = new TestModalFactory(mockFactoryOptions);
			t.expect(modalFactory.isMobile).toBe(true);
		});

		t.it('should correctly identify Node.js platform', async () => {
			const { getPlatformType } = await import('../domain');
			t.vi.mocked(getPlatformType).mockReturnValue(PlatformType.NonBrowser);

			t.vi.resetModules();
			const { ModalFactory: TestModalFactory } = await import('./index');

			const modalFactory = new TestModalFactory(mockFactoryOptions);
			t.expect(modalFactory.isNode).toBe(true);
		});

		t.it('should correctly identify web platforms', async () => {
			const { getPlatformType } = await import('../domain');
			const webPlatforms = [PlatformType.DesktopWeb, PlatformType.MetaMaskMobileWebview, PlatformType.MobileWeb];

			for (const platform of webPlatforms) {
				t.vi.mocked(getPlatformType).mockReturnValue(platform);

				t.vi.resetModules();
				const { ModalFactory: TestModalFactory } = await import('./index');

				const modalFactory = new TestModalFactory(mockFactoryOptions);
				t.expect(modalFactory.isWeb).toBe(true);
			}
		});
	});

	t.describe('Modal rendering', () => {
		let connectionRequest: ConnectionRequest;

		let uiModule: ModalFactory;
		let mockContainer: HTMLDivElement;

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
			uiModule = new ModalFactory(mockFactoryOptions);
			mockContainer = document.createElement('div');
		});

		t.describe('renderInstallModal', () => {
			t.it('should render install modal with correct props', async () => {
				const preferDesktop = true;
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderInstallModal(
					preferDesktop,
					() => Promise.resolve(connectionRequest),
					() => {},
				);

				t.expect(document.body.contains(mockContainer)).toBe(true);

				t.expect(mockFactoryOptions.InstallModal).toHaveBeenCalledWith(
					t.expect.objectContaining({
						parentElement: mockContainer,
						connectionRequest,
						preferDesktop,
						sdkVersion: packageJson.version,
					}),
				);
				t.expect(mockModal.mount).toHaveBeenCalled();
			});

			t.it('should renew sessionrequest qrCode after expiration automatically', async () => {
				t.vi.useFakeTimers();

				let connectionRequest: ConnectionRequest = {
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

				const createSessionRequestMock = t.vi.fn(() => {
					connectionRequest = {
						...connectionRequest,
						sessionRequest: {
							...connectionRequest.sessionRequest,
							id: v4(),
							expiresAt: Date.now() + 100,
						},
					};
					return Promise.resolve(connectionRequest);
				});

				const preferDesktop = true;
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderInstallModal(preferDesktop, createSessionRequestMock, () => {});

				t.expect(mockModal.mount).toHaveBeenCalled();

				// Advance timers to trigger expiration
				await t.vi.advanceTimersByTimeAsync(2000);

				t.expect(createSessionRequestMock).toHaveBeenCalledTimes(1);

				t.vi.useRealTimers();
			});

			t.it('should handle onClose callback correctly', async () => {
				const connectionRequest: ConnectionRequest = {
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

				await uiModule.renderInstallModal(
					false,
					() => Promise.resolve(connectionRequest),
					() => {},
				);

				const constructorArgs = (mockFactoryOptions.InstallModal as any).mock.calls[0][0];

				constructorArgs.onClose();

				t.expect(mockModal.unmount).toHaveBeenCalled();
			});

			t.it('should handle desktop onboarding correctly', async () => {
				const connectionRequest: ConnectionRequest = {
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

				await uiModule.renderInstallModal(
					false,
					() => Promise.resolve(connectionRequest),
					() => {},
				);

				const constructorArgs = (mockFactoryOptions.InstallModal as any).mock.calls[0][0];
				constructorArgs.startDesktopOnboarding();

				t.expect(mockModal.unmount).toHaveBeenCalled();
			});
		});

		t.describe('renderOTPCodeModal', () => {
			t.it('should render OTP code modal with placeholder props', async () => {
				await uiModule.renderOTPCodeModal(
					() => Promise.resolve('123456' as OTPCode),
					() => {},
					() => {},
				);

				t.expect(mockFactoryOptions.OTPCodeModal).toHaveBeenCalled();
				t.expect(mockModal.mount).toHaveBeenCalled();
			});
		});
	});

	t.describe('Error handling', () => {
		t.it('should handle modal rendering errors gracefully', async () => {
			const errorOptions = {
				...mockFactoryOptions,
			};
			t.vi.spyOn(errorOptions, 'InstallModal').mockImplementation(
				() =>
					({
						mount: t.vi.fn().mockImplementation(() => {
							throw new Error('Render failed');
						}),
						unmount: t.vi.fn(),
					}) as any,
			);

			const uiModule = new ModalFactory(errorOptions);
			const connectionRequest: ConnectionRequest = {
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
			await t
				.expect(
					uiModule.renderInstallModal(
						false,
						() => Promise.resolve(connectionRequest),
						() => {},
					),
				)
				.rejects.toThrow('Render failed');
		});
	});

	t.describe('Modal lifecycle', () => {
		let uiModule: ModalFactory;

		t.beforeEach(() => {
			uiModule = new ModalFactory(mockFactoryOptions);
		});

		t.it('should properly unmount previous modal when rendering new one', async () => {
			// Render first modal
			const connectionRequest: ConnectionRequest = {
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
			await uiModule.renderInstallModal(
				false,
				() => Promise.resolve(connectionRequest),
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
			t.expect(firstModal.unmount).toHaveBeenCalled();
			t.expect(secondModal.mount).toHaveBeenCalled();
		});
	});

	t.describe('Preload function error handling', () => {
		t.beforeEach(async () => {
			// Reset all modules to clear the singleton instance
			t.vi.resetModules();
		});

		t.it('should handle preload import failure gracefully and log error', async () => {
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
			await t.expect(freshPreload()).resolves.not.toThrow();

			// Verify that the error was logged
			t.expect(consoleErrorSpy).toHaveBeenCalledWith('Gracefully Failed to load modal customElements:', t.expect.any(Error));

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		t.it('should verify the exact error logging format', async () => {
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
			t.expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			const [firstArg, secondArg] = consoleErrorSpy.mock.calls[0];

			t.expect(firstArg).toBe('Gracefully Failed to load modal customElements:');
			t.expect(secondArg).toBeInstanceOf(Error);

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		t.it('should continue working after preload failure', async () => {
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
			const connectionRequest: ConnectionRequest = {
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
			await t
				.expect(
					uiModule.renderInstallModal(
						false,
						() => Promise.resolve(connectionRequest),
						() => {},
					),
				)
				.resolves.not.toThrow();

			// Verify the modal was rendered despite preload failure
			t.expect(mockFactoryOptions.InstallModal).toHaveBeenCalled();
			t.expect(mockModal.mount).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js');
			t.vi.doMock('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});
	});
});
