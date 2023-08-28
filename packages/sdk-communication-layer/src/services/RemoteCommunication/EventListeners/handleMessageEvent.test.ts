import { RemoteCommunication } from '../../../RemoteCommunication';
import { onCommunicationLayerMessage } from '../MessageHandlers';
import { handleMessageEvent } from './handleMessageEvent';

jest.mock('../MessageHandlers');

describe('handleMessageEvent', () => {
  let instance: RemoteCommunication;

  const mockOnCommunicationLayerMessage =
    onCommunicationLayerMessage as jest.MockedFunction<
      typeof onCommunicationLayerMessage
    >;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {} as unknown as RemoteCommunication;
  });

  it('should forward messages directly if they are not encapsulated', () => {
    const handler = handleMessageEvent(instance);
    const mockMessage = { type: 'mockType' } as any;

    handler(mockMessage);
    expect(mockOnCommunicationLayerMessage).toHaveBeenCalledWith(
      mockMessage,
      instance,
    );
  });

  it('should extract and forward encapsulated messages', () => {
    const handler = handleMessageEvent(instance);
    const encapsulatedMockMessage = {
      type: 'outerType',
      message: { type: 'innerType' },
    } as any;

    handler(encapsulatedMockMessage);

    expect(mockOnCommunicationLayerMessage).toHaveBeenCalledWith(
      encapsulatedMockMessage.message,
      instance,
    );
  });
});
