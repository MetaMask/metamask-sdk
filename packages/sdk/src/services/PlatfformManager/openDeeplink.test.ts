import { jest } from '@jest/globals';
import { PlatformManager } from '../../Platform/PlatfformManager';
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
    const link = {
      click: jest.fn(),
      href: undefined,
      target: undefined,
      rel: undefined,
    };
    global.document = { createElement: jest.fn().mockReturnValue(link) } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(link.href).toStrictEqual('universalLink');
    expect(link.target).toStrictEqual('_self');
    expect(link.rel).toStrictEqual('noreferrer noopener');
    expect(link.click).toHaveBeenCalled();
  });

  it('should log debug info', () => {
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
    global.window = { location: { href: undefined } } as any;

    openDeeplink(instance, 'universalLink', 'deeplink');

    expect(global.window.location.href).toStrictEqual('deeplink');
  });

  it('should log an error if opening the link fails', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // do nothing
    });

    global.document = {
      createElement: jest.fn().mockImplementation(() => {
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
