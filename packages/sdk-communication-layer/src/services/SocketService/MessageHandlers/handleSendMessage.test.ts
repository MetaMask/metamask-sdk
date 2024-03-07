import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { handleKeyHandshake, validateKeyExchange } from '../KeysManager';
import { handleSendMessage } from './handleSendMessage';
import { encryptAndSendMessage } from './encryptAndSendMessage';
import { trackRpcMethod } from './trackRpcMethod';
import { handleRpcReplies } from './handleRpcReplies';

jest.mock('../KeysManager');
jest.mock('./encryptAndSendMessage');
jest.mock('./trackRpcMethod');
jest.mock('./handleRpcReplies');

describe('handleSendMessage', () => {
  const mockedHandleKeyHandshake = handleKeyHandshake as jest.MockedFunction<
    typeof handleKeyHandshake
  >;
  const mockedValidateKeyExchange = validateKeyExchange as jest.MockedFunction<
    typeof validateKeyExchange
  >;
  const mockedEncryptAndSendMessage =
    encryptAndSendMessage as jest.MockedFunction<typeof encryptAndSendMessage>;
  const mockedTrackRpcMethod = trackRpcMethod as jest.MockedFunction<
    typeof trackRpcMethod
  >;
  const mockedHandleRpcReplies = handleRpcReplies as jest.MockedFunction<
    typeof handleRpcReplies
  >;

  let instance: SocketService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedHandleKeyHandshake.mockImplementation(() => Promise.resolve());
    mockedValidateKeyExchange.mockImplementation(() => Promise.resolve());
    mockedEncryptAndSendMessage.mockImplementation(() => Promise.resolve());
    mockedTrackRpcMethod.mockImplementation(() => Promise.resolve());
    mockedHandleRpcReplies.mockImplementation(() => Promise.resolve());

    instance = {
      state: {
        channelId: 'channel-1',
        debug: false,
        context: 'testContext',
        keyExchange: {
          areKeysExchanged: jest.fn().mockReturnValue(true),
        },
      },
      remote: {
        state: {},
      },
    } as unknown as SocketService;
  });

  it('should error if channel is not yet established', () => {
    instance.state.channelId = undefined;
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };

    expect(() => handleSendMessage(instance, message)).toThrow(
      'Create a channel first',
    );
  });

  it('should process key handshake messages', async () => {
    const message: CommunicationLayerMessage = {
      type: 'key_handshake' as any,
      id: '123',
      method: 'testMethod',
    };
    await handleSendMessage(instance, message);

    expect(mockedHandleKeyHandshake).toHaveBeenCalledWith(instance, message);
    expect(mockedValidateKeyExchange).not.toHaveBeenCalled();
    expect(mockedEncryptAndSendMessage).not.toHaveBeenCalled();
  });

  it('should handle regular messages correctly', async () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };

    await handleSendMessage(instance, message);

    expect(mockedHandleKeyHandshake).not.toHaveBeenCalled();
    expect(mockedValidateKeyExchange).toHaveBeenCalledWith(instance, message);
    expect(mockedTrackRpcMethod).toHaveBeenCalledWith(instance, message);
    expect(mockedEncryptAndSendMessage).toHaveBeenCalledWith(instance, message);
  });

  it('should manage RPC replies and log if there are issues', async () => {
    const mockError = new Error('Test RPC Error');
    mockedHandleRpcReplies.mockRejectedValueOnce(mockError);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'eth_requestAccounts',
    };

    await handleSendMessage(instance, message);

    expect(mockedHandleRpcReplies).toHaveBeenCalledWith(instance, message);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error handleRpcReplies',
      mockError,
    );

    consoleWarnSpy.mockRestore();
  });
});
