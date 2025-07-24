import * as t from 'vitest';
import { vi } from 'vitest';
import packageJson from '../../package.json';
import type { MultichainOptions } from '../domain/multichain';
import { getPlatformType, PlatformType } from '../domain/platform';
import { Store } from '../store';
import * as utils from '.';

vi.mock('../domain/platform', async () => {
	const actual = (await vi.importActual('../domain/platform')) as any;
	return {
		...actual,
		getPlatformType: t.vi.fn(),
	};
});

t.describe('Utils', () => {
	let options: MultichainOptions;

	t.beforeEach(() => {
		t.vi.clearAllMocks();
		options = {
			dapp: {
				name: 'test',
				url: 'test',
			},
			api: {
				infuraAPIKey: 'testKey',
			},
		} as MultichainOptions;
	});

	t.describe('getDappId', () => {
		const mockHostname = 'mockdapp.com';
		const mockDappName = 'Mock DApp Name';
		const mockDappUrl = 'http://mockdapp.com';
		const originalWindow = global.window;

		t.afterEach(() => {
			global.window = originalWindow;
		});

		t.it('should return window.location.hostname if window and window.location are defined', () => {
			global.window = {
				location: {
					hostname: mockHostname,
				},
			} as any;
			t.expect(utils.getDappId()).toBe(mockHostname);
		});

		t.it('should return dappMetadata.name if window is undefined and name is available', () => {
			global.window = undefined as any;
			const dappSettings = { name: mockDappName, url: mockDappUrl };
			t.expect(utils.getDappId(dappSettings)).toBe(mockDappName);
		});

		t.it('should return dappMetadata.url if window is undefined and name is not available but url is', () => {
			global.window = undefined as any;
			const dappSettings = { url: mockDappUrl };
			t.expect(utils.getDappId(dappSettings)).toBe(mockDappUrl);
		});

		t.it('should return "N/A" if window is undefined and neither name nor url is available', () => {
			global.window = undefined as any;
			const dappSettings = {};
			t.expect(utils.getDappId(dappSettings)).toBe('N/A');
		});
	});

	t.describe('getSDKVersion', () => {
		t.it('should get SDK version', () => {
			t.expect(utils.getVersion()).toBe(packageJson.version);
		});
	});

	t.describe('extractFavicon', () => {
		t.it('should return undefined if document is undefined', () => {
			global.document = undefined as any;

			t.expect(utils.extractFavicon()).toBeUndefined();
		});

		t.it('should return favicon href if rel is icon', () => {
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([
					{
						getAttribute: (attr: string) => (attr === 'rel' ? 'icon' : '/favicon.ico'),
					},
				]),
			} as any;

			t.expect(utils.extractFavicon()).toBe('/favicon.ico');
		});

		t.it('should return favicon href if rel is shortcut icon', () => {
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([
					{
						getAttribute: (attr: string) => (attr === 'rel' ? 'shortcut icon' : '/favicon.ico'),
					},
				]),
			} as any;

			t.expect(utils.extractFavicon()).toBe('/favicon.ico');
		});

		t.it('should return undefined if no favicon is found', () => {
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([]),
			} as any;

			t.expect(utils.extractFavicon()).toBeUndefined();
		});

		t.it('should return undefined if rel attribute is different', () => {
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([
					{
						getAttribute: (attr: string) => (attr === 'rel' ? 'something else' : '/favicon.ico'),
					},
				]),
			} as any;

			t.expect(utils.extractFavicon()).toBeUndefined();
		});
	});

	t.describe('setupInfuraProvider', () => {
		t.it('should not set up infura provider if infuraAPIKey is not provided', async () => {
			options.api!.infuraAPIKey = undefined;
			await utils.setupInfuraProvider(options);
			t.expect(options.api?.readonlyRPCMap).toBeUndefined();
		});

		t.it('should set up infura provider with infuraAPIKey', async () => {
			await utils.setupInfuraProvider(options);
			t.expect(options.api?.readonlyRPCMap?.['eip155:1']).toBe(`https://mainnet.infura.io/v3/testKey`);
		});

		t.it('Should allow customizing the readonlyRPCMap + merge with defaults', async () => {
			const customChainId = 'eip155:12345';
			const customEndpoint = 'https://mainnet.infura.io/12345';
			options.api!.readonlyRPCMap = {
				[customChainId]: customEndpoint,
			};
			await utils.setupInfuraProvider(options);
			t.expect(options.api?.readonlyRPCMap?.['eip155:1']).toBe(`https://mainnet.infura.io/v3/testKey`);
			t.expect(options.api?.readonlyRPCMap?.[customChainId]).toBe(customEndpoint);
		});
	});

	t.describe('setupDappMetadata', () => {
		t.beforeEach(() => {
			// Mock the document object to avoid undefined errors
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([]),
			} as any;

			t.vi.spyOn(utils, 'extractFavicon').mockReturnValue('xd');
		});

		t.afterEach(() => {
			t.vi.restoreAllMocks();
		});

		t.it('should attach dappMetadata to the instance if valid', async () => {
			(options.dapp as any).iconUrl = 'https://example.com/favicon.ico';
			options.dapp.url = 'https://example.com';
			const originalDappOptions = {
				...options.dapp,
			};
			await utils.setupDappMetadata(options);
			t.expect(options.dapp).toStrictEqual(originalDappOptions);
		});

		t.it('should set iconUrl to undenied if it does not start with http:// or https:// and favicon is undefined', async () => {
			(options.dapp as any).iconUrl = 'ftp://example.com/favicon.ico';
			options.dapp.url = 'https://example.com';
			const consoleWarnSpy = t.vi.spyOn(console, 'warn');

			await utils.setupDappMetadata(options);

			t.expect((options.dapp as any).iconUrl).toBeUndefined();
			t.expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid dappMetadata.iconUrl: URL must start with http:// or https://');
		});

		t.it('should set url to undenied if it does not start with http:// or https:// and favicon is undefined', async () => {
			options.dapp.url = 'wrong';
			const consoleWarnSpy = t.vi.spyOn(console, 'warn');

			await utils.setupDappMetadata(options);

			t.expect((options.dapp as any).iconUrl).toBeUndefined();
			t.expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid dappMetadata.url: URL must start with http:// or https://');
		});

		t.it('should prove that dapp is mandatory is platform is not browser', async () => {
			(options.dapp as any) = undefined;
			await t.expect(() => utils.setupDappMetadata(options)).toThrow('You must provide dapp url');
		});

		t.it('should prove that dapp is optional is platform is browser', async () => {
			(getPlatformType as any).mockReturnValue(PlatformType.DesktopWeb);
			t.vi.stubGlobal('window', {
				location: {
					protocol: 'https:',
					host: 'example.com',
				},
			});
			(options.dapp as any) = undefined;
			utils.setupDappMetadata(options);
			t.expect(options.dapp.url).toBe('https://example.com');
		});

		t.it('should set base64Icon to undefined if its length exceeds 163400 characters', async () => {
			const longString = new Array(163401).fill('a').join('');
			const consoleWarnSpy = t.vi.spyOn(console, 'warn');

			options.dapp = {
				iconUrl: 'https://example.com/favicon.ico',
				url: 'https://example.com',
				base64Icon: longString,
			};

			await utils.setupDappMetadata(options);

			t.expect((options.dapp as any).base64Icon).toBeUndefined();
			t.expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid dappMetadata.base64Icon: Base64-encoded icon string length must be less than 163400 characters');
		});

		t.it('should set iconUrl to the extracted favicon if iconUrl and base64Icon are not provided', async () => {
			options.dapp = {
				url: 'https://example.com',
			};

			global.window = {
				location: {
					protocol: 'https:',
					host: 'example.com',
				},
			} as any;

			// Mock document.getElementsByTagName to return a link element with favicon
			global.document = {
				getElementsByTagName: t.vi.fn().mockReturnValue([
					{
						getAttribute: (attr: string) => {
							if (attr === 'rel') return 'icon';
							if (attr === 'href') return '/favicon.ico';
							return null;
						},
					},
				]),
			} as any;

			await utils.setupDappMetadata(options);

			t.expect((options.dapp as any).iconUrl).toBe('https://example.com/favicon.ico');
		});
	});

	t.describe('isMetaMaskInstalled', () => {
		t.it('should return true if MetaMask is installed', () => {
			t.vi.stubGlobal('window', {
				ethereum: {
					isMetaMask: true,
				},
			});
			t.expect(utils.isMetaMaskInstalled()).toBe(true);
		});

		t.it('should return false if MetaMask is not installed', () => {
			t.vi.stubGlobal('window', undefined);
			t.expect(utils.isMetaMaskInstalled()).toBe(false);
		});
	});
});
