import { doctypeCheck } from './doctypeCheck';

describe('doctypeCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the doctype is HTML', () => {
    beforeEach(() => {
      global.window = {
        document: {
          doctype: {
            name: 'html',
          },
        },
      } as any;
    });

    it('should return true', () => {
      expect(doctypeCheck()).toBe(true);
    });
  });

  describe('when the doctype is not HTML', () => {
    beforeEach(() => {
      global.window = {
        document: {
          doctype: {
            name: 'xml',
          },
        },
      } as any;
    });

    it('should return false', () => {
      expect(doctypeCheck()).toBe(false);
    });
  });

  describe('when the doctype is undefined', () => {
    beforeEach(() => {
      global.window = {
        document: {
          doctype: undefined,
        },
      } as any;
    });

    it('should return false', () => {
      expect(doctypeCheck()).toBe(false);
    });
  });

  describe('when window or document is undefined', () => {
    it('should return false if window is undefined', () => {
      global.window = undefined as any;
      expect(doctypeCheck()).toBe(false);
    });

    it('should return false if document is undefined', () => {
      global.window = {
        document: undefined,
      } as any;
      expect(doctypeCheck()).toBe(false);
    });
  });
});
