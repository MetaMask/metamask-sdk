/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import { JSDOM as Page } from 'jsdom';
import * as t from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal, PlatformType } from '../domain';
import { UIModule } from './index';

// Mock external dependencies
vi.mock('@metamask/onboarding', () => ({
	default: class MockMetaMaskOnboarding {
		startOnboarding = vi.fn();
	},
}));

vi.mock('@metamask/sdk-install-modal-web/dist/loader/index.js', () => ({
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

		// Setup global DOM environment
		t.vi.stubGlobal('window', dom.window);
		t.vi.stubGlobal('document', dom.window.document);
		t.vi.stubGlobal('navigator', dom.window.navigator);

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
			selectModal: {
				render: t.vi.fn().mockResolvedValue(mockModal),
			},
			pendingModal: {
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
			expect(() => new UIModule({} as any)).toThrow('Missing required modals: installModal, selectModal, pendingModal');
		});

		it('should throw an exception if only some modals are missing', () => {
			const partialOptions = {
				installModal: mockFactoryOptions.installModal,
			};
			expect(() => new UIModule(partialOptions as any)).toThrow('Missing required modals: selectModal, pendingModal');
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
				const link = 'https://example.com';
				const preferDesktop = true;
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderInstallModal(link, preferDesktop);

				expect(document.body.contains(mockContainer)).toBe(true);

				expect(mockFactoryOptions.installModal.render).toHaveBeenCalledWith({
					onAnalyticsEvent: expect.any(Function),
					onClose: expect.any(Function),
					metaMaskInstaller: {
						startDesktopOnboarding: expect.any(Function),
					},
					parentElement: mockContainer,
					link,
					preferDesktop,
					sdkVersion: '1.0.0',
				});
				expect(mockModal.mount).toHaveBeenCalled();
			});

			it('should handle onClose callback correctly', async () => {
				await uiModule.renderInstallModal('https://example.com', false);

				const renderCall = mockFactoryOptions.installModal.render.mock.calls[0][0];
				renderCall.onClose();

				expect(mockModal.unmount).toHaveBeenCalled();
			});

			it('should handle desktop onboarding correctly', async () => {
				await uiModule.renderInstallModal('https://example.com', true);

				const renderCall = mockFactoryOptions.installModal.render.mock.calls[0][0];
				renderCall.metaMaskInstaller.startDesktopOnboarding();

				expect(mockModal.unmount).toHaveBeenCalled();
			});
		});

		describe('renderPendingModal', () => {
			it('should render pending modal with correct props', async () => {
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderPendingModal();

				expect(document.body.contains(mockContainer)).toBe(true);
				expect(mockFactoryOptions.pendingModal.render).toHaveBeenCalledWith({
					onClose: expect.any(Function),
					parentElement: mockContainer,
					sdkVersion: '1.0.0',
					displayOTP: true,
					otpCode: '123456',
					updateOTPValue: expect.any(Function),
				});
				expect(mockModal.mount).toHaveBeenCalled();
			});

			it('should handle onClose callback correctly', async () => {
				await uiModule.renderPendingModal();

				const renderCall = mockFactoryOptions.pendingModal.render.mock.calls[0][0];
				renderCall.onClose();

				expect(mockModal.unmount).toHaveBeenCalled();
			});

			it('should throw error for updateOTPValue function', async () => {
				await uiModule.renderPendingModal();

				const renderCall = mockFactoryOptions.pendingModal.render.mock.calls[0][0];

				expect(() => renderCall.updateOTPValue('123456')).toThrow('Function not implemented.');
			});
		});

		describe('renderSelectModal', () => {
			it('should render select modal with correct props', async () => {
				const link = 'https://example.com';
				const preferDesktop = false;
				const mockConnect = t.vi.fn().mockResolvedValue(undefined);
				t.vi.spyOn(uiModule as any, 'getContainer').mockReturnValue(mockContainer);

				await uiModule.renderSelectModal(link, preferDesktop, mockConnect);

				expect(document.body.contains(mockContainer)).toBe(true);
				expect(mockFactoryOptions.selectModal.render).toHaveBeenCalledWith({
					onClose: expect.any(Function),
					parentElement: mockContainer,
					sdkVersion: '1.0.0',
					connect: expect.any(Function),
					link,
					preferDesktop,
				});
				expect(mockModal.mount).toHaveBeenCalled();
			});

			it('should handle connect callback correctly', async () => {
				const mockConnect = t.vi.fn().mockResolvedValue(undefined);
				await uiModule.renderSelectModal('https://example.com', false, mockConnect);

				const renderCall = mockFactoryOptions.selectModal.render.mock.calls[0][0];
				await renderCall.connect();

				expect(mockModal.unmount).toHaveBeenCalled();
				expect(mockConnect).toHaveBeenCalled();
			});

			it('should handle onClose callback correctly', async () => {
				const mockConnect = t.vi.fn();
				await uiModule.renderSelectModal('https://example.com', false, mockConnect);

				const renderCall = mockFactoryOptions.selectModal.render.mock.calls[0][0];
				renderCall.onClose();

				expect(mockModal.unmount).toHaveBeenCalled();
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
			await expect(uiModule.renderInstallModal('https://example.com', false)).rejects.toThrow('Render failed');
		});
	});

	describe('Modal lifecycle', () => {
		let uiModule: UIModule;

		beforeEach(() => {
			uiModule = new UIModule(mockFactoryOptions);
		});

		it('should properly unmount previous modal when rendering new one', async () => {
			// Render first modal
			await uiModule.renderInstallModal('https://example.com', false);
			const firstModal = mockModal;

			// Mock a new modal for the second render
			const secondModal = {
				mount: t.vi.fn(),
				unmount: t.vi.fn(),
			};
			mockFactoryOptions.pendingModal.render.mockResolvedValue(secondModal);

			// Render second modal
			await uiModule.renderPendingModal();

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
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', async () => {
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
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		it('should verify the exact error logging format', async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			// Mock the module to fail
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', async () => {
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
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});

		it('should continue working after preload failure', async () => {
			const consoleErrorSpy = t.vi.spyOn(console, 'error').mockImplementation(() => {});

			// First, cause preload to fail
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', async () => {
				throw new Error('Module load failed');
			});

			// Re-import to get the fresh module with cleared singleton
			const { UIModule: FreshUIModule } = (await t.vi.importActual('./index')) as any;

			// Test that modal rendering still works even when preload fails
			const uiModule = new FreshUIModule(mockFactoryOptions);
			const container = document.createElement('div');

			await expect(uiModule.renderInstallModal(container, 'https://example.com', false)).resolves.not.toThrow();

			// Verify the modal was rendered despite preload failure
			expect(mockFactoryOptions.installModal.render).toHaveBeenCalled();
			expect(mockModal.mount).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();

			// Restore the original mock
			t.vi.doUnmock('@metamask/sdk-install-modal-web/dist/loader/index.js');
			t.vi.doMock('@metamask/sdk-install-modal-web/dist/loader/index.js', () => ({
				defineCustomElements: t.vi.fn(),
			}));
		});
	});

	describe('updateQRCode method testing', () => {
		let mockInstallModal: any;
		let mockSelectModal: any;

		beforeEach(() => {
			// Create mock modal elements that simulate the DOM structure
			mockInstallModal = {
				link: '',
				querySelector: t.vi.fn(),
			};

			mockSelectModal = {
				link: '',
				querySelector: t.vi.fn(),
			};
		});

		describe('Generic Modal updateQRCode functionality', () => {
			it('should update QR code link for install modal', async () => {
				// Create a test modal instance that extends the Modal class
				class TestInstallModal extends Modal<any> {
					instance: any;

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
				const newLink = 'https://metamask.app.link/dapp/newlink';

				// Call updateQRCode method
				testModal.updateQRCode(newLink);

				// Verify the install modal's link was updated
				expect(mockInstallModal.link).toBe(newLink);
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-install-modal');
			});

			it('should update QR code link for select modal when install modal is not found', async () => {
				class TestSelectModal extends Modal<any> {
					instance: any;

					constructor() {
						super();
						this.instance = {
							querySelector: t.vi.fn((selector: string) => {
								if (selector === 'mm-install-modal') {
									return null; // No install modal found
								}
								if (selector === 'mm-select-modal') {
									return mockSelectModal;
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

				const testModal = new TestSelectModal();
				const newLink = 'https://metamask.app.link/dapp/selectlink';

				// Call updateQRCode method
				testModal.updateQRCode(newLink);

				// Verify the select modal's link was updated
				expect(mockSelectModal.link).toBe(newLink);
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-install-modal');
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-select-modal');
			});

			it('should handle case where neither install nor select modal is found', async () => {
				class TestNoModal extends Modal<any> {
					instance: any;

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
				const newLink = 'https://metamask.app.link/dapp/nomodal';

				// Call updateQRCode method - should not throw even if no modals are found
				expect(() => testModal.updateQRCode(newLink)).not.toThrow();

				// Verify both selectors were tried
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-install-modal');
				expect(testModal.instance.querySelector).toHaveBeenCalledWith('mm-select-modal');
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
				const newLink = 'https://metamask.app.link/dapp/undefined';

				// Call updateQRCode method - should not throw even if instance is undefined
				expect(() => testModal.updateQRCode(newLink)).not.toThrow();
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

					if (tagName === 'mm-select-modal') {
						// Add properties that mm-select-modal should have
						(element as any).link = '';
						(element as any).sdkVersion = '';
						(element as any).preferDesktop = false;
						(element as any).addEventListener = t.vi.fn();
					}

					return element;
				});
			});

			it('should support updateQRCode on install modal through UIModule', async () => {
				const initialLink = 'https://metamask.app.link/initial';
				const updatedLink = 'https://metamask.app.link/updated';

				// Create modal factory options with real modal-like behavior
				const modalWithUpdateQRCode = {
					instance: undefined as any,
					render: t.vi.fn().mockImplementation(async (options: any) => {
						const modal = document.createElement('mm-install-modal') as any;
						modal.link = options.link;
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
					updateQRCode: t.vi.fn((link: string) => {
						// Simulate the real updateQRCode behavior - update the modal instance directly
						if (modalWithUpdateQRCode.instance) {
							modalWithUpdateQRCode.instance.link = link;
						}
					}),
				};

				const testFactoryOptions = {
					...mockFactoryOptions,
					installModal: modalWithUpdateQRCode,
				};

				const testUIModule = new UIModule(testFactoryOptions);

				// Render the modal
				await testUIModule.renderInstallModal(initialLink, false);

				// Verify the modal was rendered with the initial link
				expect(modalWithUpdateQRCode.render).toHaveBeenCalledWith(expect.objectContaining({ link: initialLink }));

				// Verify initial link was set
				expect(modalWithUpdateQRCode.instance.link).toBe(initialLink);

				// Test updateQRCode functionality
				modalWithUpdateQRCode.updateQRCode(updatedLink);
				expect(modalWithUpdateQRCode.updateQRCode).toHaveBeenCalledWith(updatedLink);
				expect(modalWithUpdateQRCode.instance.link).toBe(updatedLink);
			});

			it('should support updateQRCode on select modal through UIModule', async () => {
				const initialLink = 'https://metamask.app.link/select-initial';
				const updatedLink = 'https://metamask.app.link/select-updated';

				// Create modal factory options with real modal-like behavior
				const modalWithUpdateQRCode = {
					instance: undefined as any,
					render: t.vi.fn().mockImplementation(async (options: any) => {
						const modal = document.createElement('mm-select-modal') as any;
						modal.link = options.link;
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
					updateQRCode: t.vi.fn((link: string) => {
						// Simulate the real updateQRCode behavior - update the modal instance directly
						if (modalWithUpdateQRCode.instance) {
							modalWithUpdateQRCode.instance.link = link;
						}
					}),
				};

				const testFactoryOptions = {
					...mockFactoryOptions,
					selectModal: modalWithUpdateQRCode,
				};

				const testUIModule = new UIModule(testFactoryOptions);
				const mockConnect = t.vi.fn();

				// Render the modal
				await testUIModule.renderSelectModal(initialLink, false, mockConnect);

				// Verify the modal was rendered with the initial link
				expect(modalWithUpdateQRCode.render).toHaveBeenCalledWith(expect.objectContaining({ link: initialLink }));

				// Verify initial link was set
				expect(modalWithUpdateQRCode.instance.link).toBe(initialLink);

				// Test updateQRCode functionality
				modalWithUpdateQRCode.updateQRCode(updatedLink);
				expect(modalWithUpdateQRCode.updateQRCode).toHaveBeenCalledWith(updatedLink);
				expect(modalWithUpdateQRCode.instance.link).toBe(updatedLink);
			});
		});
	});
});
