import { validateKeyExchange } from '../validateKeyExchange';
import { SocketService } from '../../../../SocketService';
import { CommunicationLayerMessage } from '../../../../types/CommunicationLayerMessage';
import { KeyExchangeMessageType } from '../../../../types/KeyExchangeMessageType';

describe('validateKeyExchange', () => {
  let instance: SocketService;
  const mockConsoleDebug = jest.spyOn(console, 'debug');
  const mockAreKeysExchanged = jest.fn();
  const testMessage: CommunicationLayerMessage = {
    type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
    data: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'testContext',
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
        },
      },
    } as unknown as SocketService;
  });

  it('should not throw an error if keys have been exchanged', () => {
    mockAreKeysExchanged.mockReturnValue(true);
    expect(() => validateKeyExchange(instance, testMessage)).not.toThrow();
  });

  it('should throw an error if keys have not been exchanged', () => {
    mockAreKeysExchanged.mockReturnValue(false);
    expect(() => validateKeyExchange(instance, testMessage)).toThrow(
      'Keys not exchanged BBB',
    );
  });

  it('should log debug message if debugging is enabled and keys have not been exchanged', () => {
    mockAreKeysExchanged.mockReturnValue(false);
    instance.state.debug = true;

    try {
      validateKeyExchange(instance, testMessage);
    } catch (e) {
      // do nothing
    }

    expect(mockConsoleDebug).toHaveBeenCalledWith(
      `SocketService::testContext::sendMessage() ERROR keys not exchanged`,
      testMessage,
    );
  });
});
