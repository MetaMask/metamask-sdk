/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */
import Bowser from 'bowser';
import * as t from 'vitest';

import { createLogger, EventEmitter, enableDebug, getPlatformType, isEnabled, PlatformType, type SDKEvents } from './';

const parseMock = t.vi.fn();
// Mock Bowser at the top level
t.vi.mock('bowser', () => ({
	default: {
		parse: parseMock,
	},
}));

t.describe('Platform Detection', () => {
	t.beforeEach(() => {
		// Reset mocks
		t.vi.clearAllMocks();
		t.vi.unstubAllGlobals();
		// Get the mocked instance - Bowser is a default export
		t.vi.mocked(Bowser);
	});

	t.describe('getPlatformType', () => {
		t.it('should return ReactNative when environment is React Native', () => {
			// Mock React Native environment
			t.vi.stubGlobal('window', {
				navigator: {
					product: 'ReactNative',
					userAgent: 'ReactNative',
				},
			});
			t.vi.stubGlobal('navigator', {
				product: 'ReactNative',
				userAgent: 'ReactNative',
			});

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.ReactNative);
		});

		t.it('should return NonBrowser when window is undefined', () => {
			t.vi.stubGlobal('window', undefined);
			t.vi.stubGlobal('navigator', undefined);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.NonBrowser);
		});

		t.it('should return NonBrowser when window.navigator is undefined', () => {
			t.vi.stubGlobal('window', {});
			t.vi.stubGlobal('navigator', undefined);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.NonBrowser);
		});

		t.it('should return MetaMaskMobileWebview when in MetaMask mobile webview', () => {
			t.vi.stubGlobal('window', {
				ReactNativeWebView: {},
				navigator: {
					userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 MetaMaskMobile',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 MetaMaskMobile',
			});

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.MetaMaskMobileWebview);
		});

		t.it('should return MobileWeb when platform type is mobile', () => {
			const mockBrowserInfo = {
				platform: { type: 'mobile' },
			};

			t.vi.stubGlobal('window', {
				navigator: {
					userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
			});

			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.MobileWeb);
		});

		t.it('should return MobileWeb when platform type is tablet', () => {
			const mockBrowserInfo = {
				platform: { type: 'tablet' },
			};

			t.vi.stubGlobal('window', {
				navigator: {
					userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
			});

			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.MobileWeb);
		});

		t.it('should return DesktopWeb when platform type is desktop', () => {
			const mockBrowserInfo = {
				platform: { type: 'desktop' },
			};

			t.vi.stubGlobal('window', {
				navigator: {
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			});

			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.DesktopWeb);
		});

		t.it('should return DesktopWeb when platform type is undefined', () => {
			const mockBrowserInfo = {
				platform: { type: undefined },
			};

			t.vi.stubGlobal('window', {
				navigator: {
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			});

			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.DesktopWeb);
		});

		t.it('should not return MetaMaskMobileWebview when ReactNativeWebView is missing', () => {
			t.vi.stubGlobal('window', {
				navigator: {
					userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 MetaMaskMobile',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 MetaMaskMobile',
			});

			const mockBrowserInfo = {
				platform: { type: 'mobile' },
			};
			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.MobileWeb);
		});

		t.it('should not return MetaMaskMobileWebview when userAgent does not end with MetaMaskMobile', () => {
			t.vi.stubGlobal('window', {
				ReactNativeWebView: {},
				navigator: {
					userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
				},
			});
			t.vi.stubGlobal('navigator', {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
			});

			const mockBrowserInfo = {
				platform: { type: 'mobile' },
			};
			parseMock.mockReturnValue(mockBrowserInfo);

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.MobileWeb);
		});

		t.it('should handle global navigator.product being ReactNative', () => {
			t.vi.stubGlobal('global', {
				navigator: {
					product: 'ReactNative',
				},
			});
			t.vi.stubGlobal('navigator', {
				product: 'ReactNative',
			});

			const result = getPlatformType();
			t.expect(result).toBe(PlatformType.NonBrowser);
		});
	});
});

t.describe('Logger', () => {
	t.vi.mock('debug', { spy: true });

	// Mock StoreClient
	const mockStoreClient = {
		getDebug: t.vi.fn(),
	};

	t.beforeEach(() => {
		t.vi.clearAllMocks();
		delete process.env.DEBUG;
		mockStoreClient.getDebug.mockClear();
	});

	t.describe('createLogger', () => {
		t.it('should create a logger with default namespace', () => {
			const logger = createLogger();

			t.expect(logger).toBeDefined();
			t.expect(typeof logger).toBe('function');
		});

		t.it('should create a logger with custom namespace', () => {
			const logger = createLogger('metamask-sdk:core');

			t.expect(logger).toBeDefined();
			t.expect(typeof logger).toBe('function');
		});

		t.it('should create a logger with custom namespace and color', () => {
			const logger = createLogger('metamask-sdk:core', '123');

			t.expect(logger).toBeDefined();
			t.expect(typeof logger).toBe('function');
			t.expect(logger.color).toBe('123');
		});
	});

	t.describe('enableDebug', () => {
		t.it('should enable debug with default namespace', () => {
			t.expect(() => enableDebug()).not.toThrow();
		});

		t.it('should enable debug with custom namespace', () => {
			t.expect(() => enableDebug('metamask-sdk:provider')).not.toThrow();
		});
	});

	t.describe('isEnabled', () => {
		t.it('should return true when namespace is in process.env.DEBUG', async () => {
			process.env.DEBUG = 'metamask-sdk:core';

			const result = await isEnabled('metamask-sdk:core', mockStoreClient as any);

			t.expect(result).toBe(true);
			t.expect(mockStoreClient.getDebug).not.toHaveBeenCalled();
		});

		t.it('should return true when wildcard matches namespace', async () => {
			process.env.DEBUG = 'metamask-sdk:*';

			const result = await isEnabled('metamask-sdk:core', mockStoreClient as any);

			t.expect(result).toBe(true);
		});

		t.it('should return true when universal wildcard is used', async () => {
			process.env.DEBUG = '*';

			const result = await isEnabled('metamask-sdk', mockStoreClient as any);

			t.expect(result).toBe(true);
		});

		t.it('should return false when namespace is not in process.env.DEBUG', async () => {
			process.env.DEBUG = 'other-namespace';

			const result = await isEnabled('metamask-sdk:core', mockStoreClient as any);

			t.expect(result).toBe(false);
		});

		t.it('should check storage when process.env.DEBUG is not set', async () => {
			mockStoreClient.getDebug.mockResolvedValue('metamask-sdk:provider');

			const result = await isEnabled('metamask-sdk:provider', mockStoreClient as any);

			t.expect(result).toBe(true);
			t.expect(mockStoreClient.getDebug).toHaveBeenCalled();
		});

		t.it('should return false when storage debug is empty', async () => {
			mockStoreClient.getDebug.mockResolvedValue(null);

			const result = await isEnabled('metamask-sdk', mockStoreClient as any);

			t.expect(result).toBe(false);
		});

		t.it('should prioritize process.env.DEBUG over storage', async () => {
			process.env.DEBUG = 'metamask-sdk:core';
			mockStoreClient.getDebug.mockResolvedValue('metamask-sdk:provider');

			const result = await isEnabled('metamask-sdk:core', mockStoreClient as any);

			t.expect(result).toBe(true);
			t.expect(mockStoreClient.getDebug).not.toHaveBeenCalled();
		});
	});
});

t.describe('EventEmitter', () => {
	t.describe('emit', () => {
		t.describe('SDKEvents', () => {
			let eventEmitter: EventEmitter<SDKEvents>;

			t.beforeEach(() => {
				eventEmitter = new EventEmitter();
			});

			t.it('should emit display_uri event with string argument', () => {
				const handler = t.vi.fn();
				eventEmitter.on('display_uri', handler);

				eventEmitter.emit('display_uri', 'uri://test-connection');

				t.expect(handler).toHaveBeenCalledWith('uri://test-connection');
				t.expect(handler).toHaveBeenCalledTimes(1);
			});

			t.it('should emit to all registered handlers for the same event', () => {
				const handler1 = t.vi.fn();
				const handler2 = t.vi.fn();
				const handler3 = t.vi.fn();

				eventEmitter.on('display_uri', handler1);
				eventEmitter.on('display_uri', handler2);
				eventEmitter.on('display_uri', handler3);

				eventEmitter.emit('display_uri', 'broadcast-uri');

				t.expect(handler1).toHaveBeenCalledWith('broadcast-uri');
				t.expect(handler2).toHaveBeenCalledWith('broadcast-uri');
				t.expect(handler3).toHaveBeenCalledWith('broadcast-uri');
				t.expect(handler1).toHaveBeenCalledTimes(1);
				t.expect(handler2).toHaveBeenCalledTimes(1);
				t.expect(handler3).toHaveBeenCalledTimes(1);
			});

			t.it('should register handlers for display_uri event', () => {
				const handler = t.vi.fn();

				eventEmitter.on('display_uri', handler);
				eventEmitter.emit('display_uri', 'test-uri');

				t.expect(handler).toHaveBeenCalledWith('test-uri');
			});

			t.it('should register multiple handlers for the same event', () => {
				const handler1 = t.vi.fn();
				const handler2 = t.vi.fn();

				eventEmitter.on('display_uri', handler1);
				eventEmitter.on('display_uri', handler2);

				eventEmitter.emit('display_uri', 'test');

				t.expect(handler1).toHaveBeenCalledWith('test');
				t.expect(handler2).toHaveBeenCalledWith('test');
			});

			t.it('should remove specific handlers for display_uri event', () => {
				const handler1 = t.vi.fn();
				const handler2 = t.vi.fn();

				eventEmitter.on('display_uri', handler1);
				eventEmitter.on('display_uri', handler2);

				eventEmitter.off('display_uri', handler1);
				eventEmitter.emit('display_uri', 'test');

				t.expect(handler1).not.toHaveBeenCalled();
				t.expect(handler2).toHaveBeenCalledWith('test');
			});

			t.it('should handle removing non-existent handlers gracefully', () => {
				const handler = t.vi.fn();
				const nonExistentHandler = t.vi.fn();

				eventEmitter.on('display_uri', handler);

				// This should not throw an error
				t.expect(() => {
					eventEmitter.off('display_uri', nonExistentHandler);
				}).not.toThrow();

				eventEmitter.emit('display_uri', 'still works');
				t.expect(handler).toHaveBeenCalledWith('still works');
			});

			t.it('should handle removing handlers from non-existent events gracefully', () => {
				const handler = t.vi.fn();

				// This should not throw an error
				t.expect(() => {
					eventEmitter.off('display_uri', handler);
				}).not.toThrow();
			});
		});
	});
});
