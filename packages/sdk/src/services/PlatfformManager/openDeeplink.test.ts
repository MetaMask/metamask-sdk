import { jest } from '@jest/globals';
import {
  PlatformManager,
  LINK_OPEN_DELAY,
} from '../../Platform/PlatfformManager';
import * as loggerModule from '../../utils/logger';
import { openDeeplink } from './openDeeplink';

describe('openDeeplink', () => {
  let instance: jest.Mocked<PlatformManager>;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    instance = {
      state: {
        debug: false,
        preferredOpenLink: null,
        useDeeplink: false,
      },
      isBrowser: jest.fn(),
      enableWakeLock: jest.fn(),
    } as unknown as jest.Mocked<PlatformManager>;
  });

  it('should open a universal link when state.useDeeplink is false', () => {
    global.window = { open: jest.fn() } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(global.window.open).toHaveBeenCalledWith('universalLink', '_blank');
  });

  it('should close the window after LINK_OPEN_DELAY', () => {
    const mockWin = { close: jest.fn() };
    global.window = {
      open: jest.fn().mockReturnValue(mockWin),
    } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    jest.advanceTimersByTime(LINK_OPEN_DELAY);

    expect(mockWin.close).toHaveBeenCalled();
  });

  it('should log debug info', () => {
    global.window = {
      open: jest.fn().mockImplementation(() => {
        throw new Error('failure');
      }),
    } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(spyLogger).toHaveBeenCalledWith(
      '[PlatfformManager: openDeeplink()] universalLink --> universalLink',
    );

    expect(spyLogger).toHaveBeenCalledWith(
      '[PlatfformManager: openDeeplink()] deepLink --> deeplink',
    );

    expect(spyLogger).toHaveBeenCalledWith(
      '[PlatfformManager: openDeeplink()] open link now useDeepLink=false link=universalLink',
    );
  });

  it('should call enableWakeLock when instance.isBrowser() is true', () => {
    instance.isBrowser.mockReturnValue(true);
    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(instance.enableWakeLock).toHaveBeenCalled();
  });

  it('should use state.preferredOpenLink when defined', () => {
    const mockPreferredOpenLink = jest.fn();
    instance.state.preferredOpenLink = mockPreferredOpenLink as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(mockPreferredOpenLink).toHaveBeenCalledWith(
      'universalLink',
      undefined,
    );
  });

  it('should open a deep link when state.useDeeplink is true', () => {
    instance.state.useDeeplink = true;
    global.window = { open: jest.fn() } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(global.window.open).toHaveBeenCalledWith('deeplink', '_blank');
  });

  it('should log an error if opening the link fails', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // do nothing
    });

    global.window = {
      open: jest.fn().mockImplementation(() => {
        throw new Error('failure');
      }),
    } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(console.log).toHaveBeenCalledWith(
      "[PlatfformManager: openDeeplink()] can't open link",
      new Error('failure'),
    );
  });
});
