import { blockedDomainCheck } from './blockedDomainCheck';

describe('blockedDomainCheck', () => {
  function mockUrl(urlString: string) {
    const urlObj = new URL(urlString);

    Object.defineProperty(window, 'location', {
      value: {
        hostname: urlObj.hostname,
        origin: urlObj.origin,
        pathname: urlObj.pathname,
      },
      writable: true,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();

    global.window = {
      location: {
        href: 'https://www.google.com/',
      },
    } as any;
  });

  describe('should return true for blocked domain when', () => {
    it('the domain is blocked', () => {
      mockUrl('https://execution.consensys.io');
      expect(blockedDomainCheck()).toBe(true);
    });

    it('the subdomain of a blocked domain is accessed', () => {
      mockUrl('https://subdomain.execution.consensys.io');
      expect(blockedDomainCheck()).toBe(true);
    });

    it('a blocked href is accessed', () => {
      mockUrl(
        'https://cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
      );
      expect(blockedDomainCheck()).toBe(true);
    });

    it('a blocked href with query params is accessed', () => {
      mockUrl(
        'https://cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html?foo=bar',
      );
      expect(blockedDomainCheck()).toBe(true);
    });

    it('a blocked href with trailing slash is accessed', () => {
      mockUrl(
        'https://cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html/',
      );
      expect(blockedDomainCheck()).toBe(true);
    });

    it('a blocked href with hash is accessed', () => {
      mockUrl(
        'https://cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html#',
      );
      expect(blockedDomainCheck()).toBe(true);
    });

    it('a blocked href with another protocol is accessed', () => {
      mockUrl(
        'http://cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html#',
      );
      expect(blockedDomainCheck()).toBe(true);
    });
  });

  describe('should return false for blocked domain when', () => {
    it('the domain is not blocked', () => {
      mockUrl('https://example.com');
      expect(blockedDomainCheck()).toBe(false);
    });

    it('the href is not blocked', () => {
      mockUrl('https://google.com/some/path');
      expect(blockedDomainCheck()).toBe(false);
    });
  });
});
