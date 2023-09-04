import { extractFavicon } from './extractFavicon';

describe('extractFavicon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if document is undefined', () => {
    global.document = undefined as any;

    expect(extractFavicon()).toBeUndefined();
  });

  it('should return favicon href if rel is icon', () => {
    global.document = {
      getElementsByTagName: jest.fn().mockReturnValue([
        {
          getAttribute: (attr: string) =>
            attr === 'rel' ? 'icon' : '/favicon.ico',
        },
      ]),
    } as any;

    expect(extractFavicon()).toBe('/favicon.ico');
  });

  it('should return favicon href if rel is shortcut icon', () => {
    global.document = {
      getElementsByTagName: jest.fn().mockReturnValue([
        {
          getAttribute: (attr: string) =>
            attr === 'rel' ? 'shortcut icon' : '/favicon.ico',
        },
      ]),
    } as any;

    expect(extractFavicon()).toBe('/favicon.ico');
  });

  it('should return undefined if no favicon is found', () => {
    global.document = {
      getElementsByTagName: jest.fn().mockReturnValue([]),
    } as any;

    expect(extractFavicon()).toBeUndefined();
  });

  it('should return undefined if rel attribute is different', () => {
    global.document = {
      getElementsByTagName: jest.fn().mockReturnValue([
        {
          getAttribute: (attr: string) =>
            attr === 'rel' ? 'something else' : '/favicon.ico',
        },
      ]),
    } as any;

    expect(extractFavicon()).toBeUndefined();
  });
});
