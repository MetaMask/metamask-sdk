/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PlatformType } from '@metamask/sdk-communication-layer';
import { base64Encode } from '../../utils/base64';
import { MetaMaskSDK } from '../../sdk';
import { PlatformManager } from '../../Platform/PlatfformManager';
import { getOrCreateUuidForIdentifier, getPlatformDetails } from './handleUuid';

describe('Extension UUID Functions', () => {
  // Mocking localStorage
  beforeEach(() => {
    let store: { [key: string]: string } = {};

    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    };
  });

  afterEach(() => {
    // Clean up mocks after each test
    jest.restoreAllMocks();
  });

  describe('getOrCreateUuidForIdentifier', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should create and store a UUID if one does not exist', () => {
      const url = 'https://example.com';
      const name = 'ExampleDApp';
      const identifier = getOrCreateUuidForIdentifier({ url, name });

      const storedUuid = localStorage.getItem(base64Encode(url + name));

      expect(storedUuid).toBe(identifier);
      expect(storedUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u, // UUID v4 regex
      );
    });

    it('should return the same UUID if it already exists in localStorage', () => {
      const url = 'https://example.com';
      const name = 'ExampleDApp';
      const firstIdentifier = getOrCreateUuidForIdentifier({ url, name });
      const secondIdentifier = getOrCreateUuidForIdentifier({ url, name });

      expect(secondIdentifier).toBe(firstIdentifier);
    });

    it('should create a different UUID for different identifiers', () => {
      const url1 = 'https://example1.com';
      const name1 = 'ExampleDApp1';
      const url2 = 'https://example2.com';
      const name2 = 'ExampleDApp2';

      const identifier1 = getOrCreateUuidForIdentifier({
        url: url1,
        name: name1,
      });
      const identifier2 = getOrCreateUuidForIdentifier({
        url: url2,
        name: name2,
      });

      expect(identifier1).not.toBe(identifier2);
    });
  });

  describe('getPlatformDetails', () => {
    let sdkInstance: MetaMaskSDK;

    beforeEach(() => {
      sdkInstance = {
        dappMetadata: {
          url: 'https://example.com',
          name: 'ExampleDApp',
        },
        platformManager: {
          getPlatformType: jest.fn(),
        } as unknown as PlatformManager, // Ensure it's typed as PlatformManager
      } as MetaMaskSDK;
    });

    it('should return "extension" if platform type is DesktopWeb', () => {
      jest
        .spyOn(sdkInstance.platformManager!, 'getPlatformType')
        .mockReturnValue(PlatformType.DesktopWeb); // Ensure platformManager is not undefined here

      const result = getPlatformDetails(sdkInstance);

      expect(result.from).toBe('extension');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
      );
    });

    it('should return "mobile" if platform type is MetaMaskMobileWebview', () => {
      jest
        .spyOn(sdkInstance.platformManager!, 'getPlatformType')
        .mockReturnValue(PlatformType.MetaMaskMobileWebview);

      const result = getPlatformDetails(sdkInstance);

      expect(result.from).toBe('mobile');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
      );
    });

    it('should return "N/A" if platform type is neither DesktopWeb nor MetaMaskMobileWebview', () => {
      jest
        .spyOn(sdkInstance.platformManager!, 'getPlatformType')
        .mockReturnValue('OtherPlatform' as any); // Explicitly cast to any since 'OtherPlatform' is not in PlatformType

      const result = getPlatformDetails(sdkInstance);

      expect(result.from).toBe('N/A');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
      );
    });

    it('should return "N/A" if platform type is undefined', () => {
      jest
        .spyOn(sdkInstance.platformManager!, 'getPlatformType')
        .mockReturnValue(undefined as unknown as PlatformType);

      const result = getPlatformDetails(sdkInstance);

      expect(result.from).toBe('N/A');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
      );
    });

    it('should use default "no_url" and "no_name" if dappMetadata is undefined', () => {
      sdkInstance.dappMetadata = undefined;

      const result = getPlatformDetails(sdkInstance);

      expect(result.id).toBe(
        getOrCreateUuidForIdentifier({ url: 'no_url', name: 'no_name' }),
      );
    });
  });
});
