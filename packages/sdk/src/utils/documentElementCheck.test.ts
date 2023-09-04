import { documentElementCheck } from './documentElementCheck';

describe('documentElementCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if the documentElement is an HTML node', () => {
    global.document = {
      documentElement: {
        nodeName: 'HTML',
      },
    } as any;

    expect(documentElementCheck()).toBe(true);
  });

  it('should return false if the documentElement is not an HTML node', () => {
    global.document = {
      documentElement: {
        nodeName: 'BODY',
      },
    } as any;

    expect(documentElementCheck()).toBe(false);
  });

  it('should return true if the documentElement is undefined', () => {
    global.document = {
      documentElement: undefined,
    } as any;

    expect(documentElementCheck()).toBe(true);
  });

  it('should return false if document is undefined', () => {
    global.document = undefined as any;

    expect(documentElementCheck()).toBe(false);
  });
});
