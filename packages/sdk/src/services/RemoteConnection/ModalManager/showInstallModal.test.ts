import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { showInstallModal } from './showInstallModal';

describe('showInstallModal', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;
  const mockInstallModalMount = jest.fn();
  const mockModalsInstall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockModalsInstall.mockReturnValue({
      mount: mockInstallModalMount,
    });

    showInstallModal(state, options, link);

    expect(mockModalsInstall).toHaveBeenCalled();
    expect(mockInstallModalMount).toHaveBeenCalledWith(link);
  });
});
