import { base64Encode } from '../../utils/base64';
import { getOrCreateUuidForIdentifier } from './handleUuid';

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
      const identifier = getOrCreateUuidForIdentifier(url, name);

      const storedUuid = localStorage.getItem(base64Encode(url + name));

      expect(storedUuid).toBe(identifier);
      expect(storedUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u, // UUID v4 regex
      );
    });

    it('should return the same UUID if it already exists in localStorage', () => {
      const url = 'https://example.com';
      const name = 'ExampleDApp';
      const firstIdentifier = getOrCreateUuidForIdentifier(url, name);
      const secondIdentifier = getOrCreateUuidForIdentifier(url, name);

      expect(secondIdentifier).toBe(firstIdentifier);
    });

    it('should create a different UUID for different identifiers', () => {
      const url1 = 'https://example1.com';
      const name1 = 'ExampleDApp1';
      const url2 = 'https://example2.com';
      const name2 = 'ExampleDApp2';

      const identifier1 = getOrCreateUuidForIdentifier(url1, name1);
      const identifier2 = getOrCreateUuidForIdentifier(url2, name2);

      expect(identifier1).not.toBe(identifier2);
    });
  });
});
