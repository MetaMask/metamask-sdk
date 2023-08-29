import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';

describe('onOTPModalDisconnect', () => {
  let options: RemoteConnectionProps;
  let state: RemoteConnectionState;

  beforeEach(() => {
    options = {
      communicationLayerPreference: jest.fn(),
      sdk: jest.fn(),
      platformManager: jest.fn(),
      modals: {},
    } as unknown as RemoteConnectionProps;

    state = {
      developerMode: false,
      authorized: false,
      otpAnswer: undefined,
    } as unknown as RemoteConnectionState;
  });

  it('should call onPendingModalDisconnect if defined', () => {
    const mockOnPendingModalDisconnect = jest.fn();
    options.modals.onPendingModalDisconnect = mockOnPendingModalDisconnect;

    onOTPModalDisconnect(options, state);

    expect(mockOnPendingModalDisconnect).toHaveBeenCalled();
  });

  it('should not call onPendingModalDisconnect if not defined', () => {
    delete options.modals.onPendingModalDisconnect;

    onOTPModalDisconnect(options, state);

    expect(options.modals.onPendingModalDisconnect).toBeUndefined();
  });

  it('should call unmount on pendingModal if defined', () => {
    const mockUnmount = jest.fn();
    state.pendingModal = {
      unmount: mockUnmount,
    };

    onOTPModalDisconnect(options, state);

    expect(mockUnmount).toHaveBeenCalled();
  });

  it('should not call unmount if pendingModal is not defined', () => {
    delete state.pendingModal;

    onOTPModalDisconnect(options, state);

    expect(state.pendingModal).toBeUndefined();
  });
});
