import { hasNativeWakeLock } from '../utils/hasNativeWakeLockSupport';
import { isOldIOS } from '../utils/isOldIOS';
import { logger } from '../utils/logger';
import { mp4 } from './Media';
import { WakeLockManager } from './WakeLockManager';

jest.mock('../utils/logger');
jest.mock('../utils/hasNativeWakeLockSupport');
jest.mock('../utils/isOldIOS');

describe('WakeLockManager', () => {
  let wakeLockManager: WakeLockManager;
  let originalDocument: Document;
  let originalWindow: Window;
  let originalNavigator: Navigator;

  const mockClearInterval = jest.fn();

  beforeAll(() => {
    originalDocument = global.document;
    originalWindow = global.window;
    originalNavigator = global.navigator;

    // Mocking document, window, and navigator
    global.document = {
      createElement: jest.fn((tagName: string) => {
        if (tagName === 'video') {
          return {
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            play: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn(),
            load: jest.fn(),
            remove: jest.fn(),
            appendChild: jest.fn(),
            currentTime: 0,
            duration: 2,
            src: '',
            firstChild: {},
          };
        }

        if (tagName === 'source') {
          return {
            src: '',
            type: '',
          };
        }
        return {};
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      visibilityState: 'visible',
      hidden: false,
    } as any;

    global.window = {
      setInterval: jest.fn(),
      clearInterval: mockClearInterval,
      location: {
        href: 'http://example.com',
      },
      setTimeout: jest.fn(),
      stop: jest.fn(),
    } as any;

    global.navigator = {
      wakeLock: {
        request: jest.fn().mockResolvedValue({}),
      },
    } as any;
  });

  afterAll(() => {
    global.document = originalDocument;
    global.window = originalWindow as any;
    global.navigator = originalNavigator;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    wakeLockManager = new WakeLockManager();
  });

  describe('constructor', () => {
    it('should initialize with default parameters', () => {
      expect(wakeLockManager).toBeDefined();
      expect(wakeLockManager.isEnabled()).toBe(false);
    });

    it('should initialize with debug mode', () => {
      wakeLockManager = new WakeLockManager(true);
      expect(wakeLockManager.isEnabled()).toBe(false);
    });
  });

  describe('start', () => {
    it('should add event listeners if hasNativeWakeLock is true', () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(true);
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      wakeLockManager.start();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'fullscreenchange',
        expect.any(Function),
      );
    });

    it('should set up noSleepVideo if isOldIOS is false', () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(false);
      (isOldIOS as jest.Mock).mockReturnValue(false);

      wakeLockManager.start();

      expect(wakeLockManager.noSleepVideo).toBeDefined();
      expect(wakeLockManager.noSleepVideo?.setAttribute).toHaveBeenCalledWith(
        'title',
        'MetaMask SDK - Listening for responses',
      );
    });

    it('should not set up noSleepVideo if isOldIOS is true', () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(false);
      (isOldIOS as jest.Mock).mockReturnValue(true);

      wakeLockManager.start();

      expect(wakeLockManager.noSleepVideo).toBeUndefined();
    });
  });

  describe('_addSourceToVideo', () => {
    it('should add source to video element', () => {
      const videoElement = document.createElement('video') as any;
      wakeLockManager._addSourceToVideo(videoElement, 'mp4', mp4);

      expect(videoElement.appendChild).toHaveBeenCalled();
      const sourceElement = videoElement.appendChild.mock.calls[0][0];
      expect(sourceElement.src).toBe(mp4);
      expect(sourceElement.type).toBe('video/mp4');
    });
  });

  describe('isEnabled', () => {
    it('should return the enabled state', () => {
      expect(wakeLockManager.isEnabled()).toBe(false);
      wakeLockManager.enabled = true;
      expect(wakeLockManager.isEnabled()).toBe(true);
    });
  });

  describe('setDebug', () => {
    it('should set debug mode', () => {
      wakeLockManager.setDebug(true);
      expect(logger).toHaveBeenCalledWith(
        '[WakeLockManager: setDebug()] activate debug mode',
      );
    });
  });

  describe('enable', () => {
    it('should enable wake lock if hasNativeWakeLock is true', async () => {
      wakeLockManager.enabled = false;
      (hasNativeWakeLock as jest.Mock).mockReturnValue(true);
      const mockWakeLock = { request: jest.fn().mockResolvedValue({}) };
      (global.navigator as any).wakeLock = mockWakeLock;

      await wakeLockManager.enable();

      expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
      expect(wakeLockManager.isEnabled()).toBe(true);
    });

    it('should handle wake lock request failure', async () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(true);
      const mockWakeLock = {
        request: jest.fn().mockRejectedValue(new Error('test')),
      };
      (global.navigator as any).wakeLock = mockWakeLock;

      const result = await wakeLockManager.enable();

      expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
      expect(wakeLockManager.isEnabled()).toBe(false);
      expect(result).toBe(false);
    });

    it('should handle old iOS devices', async () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(false);
      (isOldIOS as jest.Mock).mockReturnValue(true);

      const result = await wakeLockManager.enable();

      expect(wakeLockManager.isEnabled()).toBe(true);
      expect(result).toBe(true);
    });
  });

  describe('disable', () => {
    it('should disable no sleep timer for old iOS', () => {
      (isOldIOS as jest.Mock).mockReturnValue(true);
      wakeLockManager.noSleepTimer = 1234;
      wakeLockManager.enabled = true;

      wakeLockManager.disable();

      expect(mockClearInterval).toHaveBeenCalledWith(1234);
      expect(wakeLockManager.noSleepTimer).toBeUndefined();
      expect(wakeLockManager.isEnabled()).toBe(false);
    });

    it('should disable native wake lock', () => {
      (hasNativeWakeLock as jest.Mock).mockReturnValue(true);
      wakeLockManager.enabled = true;

      // Initialize wakeLockManager._wakeLock with an object that has a release method
      const releaseSpy = jest.fn();
      wakeLockManager._wakeLock = { release: releaseSpy };

      wakeLockManager.disable();

      expect(releaseSpy).toHaveBeenCalled();
      expect(wakeLockManager.isEnabled()).toBe(false);
    });
  });
});
