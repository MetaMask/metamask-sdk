/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DisconnectOptions } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import { RemoteConnectionState } from '../RemoteConnection';
import { handleDisconnect } from './handleDisconnect';

jest.mock('../../Ethereum', () => ({
  Ethereum: {
    getProvider: jest.fn().mockReturnValue({
      handleDisconnect: jest.fn(),
    }),
  },
}));

describe('handleDisconnect', () => {
  let state: RemoteConnectionState;
  let options: DisconnectOptions;
  const mockDisconnect = jest.fn();
  const mockUnmount = jest.fn();

  beforeEach(() => {
    state = {
      developerMode: false,
      pendingModal: {
        unmount: mockUnmount,
      },
      otpAnswer: 'sample',
      connector: {
        disconnect: mockDisconnect,
      },
    } as unknown as RemoteConnectionState;

    options = {
      terminate: false,
    };
  });

  it('should log debug message when developerMode is true', async () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {
      // do nothing
    });
    state.developerMode = true;

    await handleDisconnect(state, options);

    expect(consoleSpy).toHaveBeenCalledWith(
      'RemoteConnection::disconnect()',
      options,
    );

    consoleSpy.mockRestore();
  });

  it('should call handleDisconnect on Ethereum provider when options.terminate is true', async () => {
    options.terminate = true;

    await handleDisconnect(state, options);

    expect(Ethereum.getProvider().handleDisconnect).toHaveBeenCalledWith({
      terminate: true,
    });
  });

  it('should call unmount on state.pendingModal when options.terminate is true', async () => {
    options.terminate = true;

    await handleDisconnect(state, options);

    expect(mockUnmount).toHaveBeenCalled();
  });

  it('should set otpAnswer to undefined on state when options.terminate is true', async () => {
    options.terminate = true;

    await handleDisconnect(state, options);

    expect(state.otpAnswer).toBeUndefined();
  });

  it('should call disconnect on state.connector with given options', async () => {
    await handleDisconnect(state, options);

    expect(mockDisconnect).toHaveBeenCalledWith(options);
  });
});
