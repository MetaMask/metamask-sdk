import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import * as loggerModule from '../../../utils/logger';
import { showInstallModal } from './showInstallModal';

describe('showInstallModal', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;
  const mockInstallModalMount = jest.fn();
  const mockModalsInstall = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockModalsInstall.mockImplementation(() => {
      return {
        mount: mockInstallModalMount,
      };
    });

    state = {
      developerMode: false,
      installModal: {
        mount: mockInstallModalMount,
      },
    } as unknown as RemoteConnectionState;

    options = {
      modals: {
        install: mockModalsInstall,
      },
      getMetaMaskInstaller: jest.fn(),
      sdk: {
        terminate: jest.fn(),
      },
      connectWithExtensionProvider: jest.fn(),
    } as unknown as RemoteConnectionProps;
  });

  it('should initialize and mount a new installModal if not already initialized', () => {
    const link = 'http://example.com/newqrcode';
    state.installModal = undefined;

    showInstallModal(state, options, link);

    expect(mockModalsInstall).toHaveBeenCalledWith({
      link,
      installer: undefined,
      terminate: expect.any(Function),
      debug: state.developerMode,
      connectWithExtension: expect.any(Function),
    });
    expect(mockModalsInstall).toHaveBeenCalledTimes(1);
    expect(mockInstallModalMount).toHaveBeenCalledWith(link);
    expect(mockInstallModalMount).toHaveBeenCalledTimes(1);
  });

  it('should terminate the connection and possibly log the termination', () => {
    const link = 'http://example.com/terminate';

    showInstallModal(state, options, link);

    const terminateCall = mockModalsInstall.mock.calls[0][0]
      .terminate as () => void;

    terminateCall();

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteConnection: showInstallModal() => terminate()] terminate connection',
    );
    expect(options.sdk.terminate).toHaveBeenCalledTimes(1);
  });

  it('should call connectWithExtensionProvider and return false', () => {
    const link = 'http://example.com/extension';

    jest.spyOn(options, 'connectWithExtensionProvider').mockImplementation();

    showInstallModal(state, options, link);

    const connectWithExtensionCall = mockModalsInstall.mock.calls[0][0]
      .connectWithExtension as () => boolean;

    const result = connectWithExtensionCall();

    expect(options.connectWithExtensionProvider).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('should still return false if connectWithExtensionProvider is not defined', () => {
    const link = 'http://example.com/extensionNoProvider';

    options.connectWithExtensionProvider = undefined;

    showInstallModal(state, options, link);

    const connectWithExtensionCall = mockModalsInstall.mock.calls[0][0]
      .connectWithExtension as () => boolean;

    const result = connectWithExtensionCall();

    expect(result).toBe(false);
  });

  it('should not throw error if mount is not defined', () => {
    const link = 'http://example.com/newqrcode';
    state.installModal = undefined;
    mockModalsInstall.mockReturnValueOnce({});

    expect(() => {
      showInstallModal(state, options, link);
    }).not.toThrow();
  });

  it('should not throw error if installModal is not defined', () => {
    const link = 'http://example.com/newqrcode';
    state.installModal = undefined;
    options.modals.install = undefined;

    expect(() => {
      showInstallModal(state, options, link);
    }).not.toThrow();
  });
});
