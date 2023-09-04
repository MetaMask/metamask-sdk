import { blockedDomainCheck } from './blockedDomainCheck';

describe('blockedDomainCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.window = {
      location: {
        href: 'https://www.google.com/',
      },
    } as any;
  });

  it('should return true if the current domain is blocked', () => {
    const blockedDomains = ['uscourts.gov', 'dropbox.com', 'webbyawards.com'];

    blockedDomains.forEach((domain) => {
      window.location.href = `https://${domain}/some/path`;
      expect(blockedDomainCheck()).toBe(true);
    });
  });

  it('should return false if the current domain is not blocked', () => {
    const unblockedDomains = ['google.com', 'yahoo.com', 'example.com'];

    unblockedDomains.forEach((domain) => {
      window.location.href = `https://${domain}/some/path`;
      expect(blockedDomainCheck()).toBe(false);
    });
  });
});
