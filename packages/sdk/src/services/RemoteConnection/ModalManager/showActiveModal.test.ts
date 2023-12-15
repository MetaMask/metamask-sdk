import { RemoteConnectionState } from '../RemoteConnection';
import { showActiveModal } from './showActiveModal';

describe('showActiveModal', () => {
  let state: RemoteConnectionState;

  const mockPendingModalMount = jest.fn();
  const mockInstallModalMount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      authorized: false,
      developerMode: false,
      pendingModal: {
        mount: mockPendingModalMount,
      },
      installModal: {
        mount: mockInstallModalMount,
      },
      useDeeplink: false,
      qrcodeLink: 'http://example.com',
    } as unknown as RemoteConnectionState;
  });

  it('should not mount any modal if the connection is already authorized', () => {
    state.authorized = true;

    showActiveModal(state);

    expect(mockPendingModalMount).not.toHaveBeenCalled();
    expect(mockInstallModalMount).not.toHaveBeenCalled();
  });

  it('should mount the pendingModal if available and not authorized', () => {
    showActiveModal(state);

    expect(mockPendingModalMount).toHaveBeenCalled();
    expect(mockInstallModalMount).not.toHaveBeenCalled();
  });

  it('should mount the installModal if pendingModal is not available and not authorized', () => {
    state.pendingModal = undefined;

    showActiveModal(state);

    expect(mockPendingModalMount).not.toHaveBeenCalled();
    expect(mockInstallModalMount).toHaveBeenCalledWith(state.qrcodeLink);
  });

  it('should mount the installModal without universalLink if it is not defined', () => {
    state.pendingModal = undefined;
    state.qrcodeLink = undefined;

    showActiveModal(state);

    expect(mockPendingModalMount).not.toHaveBeenCalled();
    expect(mockInstallModalMount).toHaveBeenCalledWith('');
  });
});
