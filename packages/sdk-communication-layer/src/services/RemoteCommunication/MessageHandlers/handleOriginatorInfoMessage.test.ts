/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { MessageType } from '../../../types/MessageType';
import { handleOriginatorInfoMessage } from './handleOriginatorInfoMessage';

describe('handleOriginatorInfoMessage', () => {
  let instance: RemoteCommunication;
  const mockMessage = {
    originatorInfo: 'testOriginatorInfo',
    originator: 'testOriginator',
  } as unknown as CommunicationLayerMessage;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        walletInfo: 'testWalletInfo',
        communicationLayer: {
          sendMessage: jest.fn(),
        },
        originatorInfo: null,
        isOriginator: true,
        paused: true,
      },
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should send a WALLET_INFO message with wallet details', () => {
    handleOriginatorInfoMessage(instance, mockMessage);
    expect(instance.state.communicationLayer!.sendMessage).toHaveBeenCalledWith(
      {
        type: MessageType.WALLET_INFO,
        walletInfo: 'testWalletInfo',
      },
    );
  });

  it('should update the originatorInfo state', () => {
    handleOriginatorInfoMessage(instance, mockMessage);
    expect(instance.state.originatorInfo).toBe('testOriginatorInfo');
  });

  it('should emit a CLIENTS_READY event', () => {
    handleOriginatorInfoMessage(instance, mockMessage);
    expect(instance.emit).toHaveBeenCalledWith(EventType.CLIENTS_READY, {
      isOriginator: true,
      originatorInfo: 'testOriginatorInfo',
    });
  });

  it('should set the paused state to false', () => {
    handleOriginatorInfoMessage(instance, mockMessage);
    expect(instance.state.paused).toBe(false);
  });
});
