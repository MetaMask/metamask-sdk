import EventEmitter2 from 'eventemitter2';
import { KeyExchange } from './KeyExchange';
import { SocketService } from './SocketService';

jest.mock('./ECIES');
jest.mock('./types/CommunicationLayer'); // Assuming CommunicationLayer is a class that can be mocked.

describe('KeyExchange', () => {
  let keyExchange: KeyExchange;
  let mockCommunicationLayer: jest.Mocked<SocketService>;

  beforeEach(() => {
    // Create a mock CommunicationLayer instance
    mockCommunicationLayer = new EventEmitter2() as jest.Mocked<SocketService>;

    // Initialize the KeyExchange instance with the mocked CommunicationLayer
    keyExchange = new KeyExchange({
      communicationLayer: mockCommunicationLayer,
      context: 'testContext',
      sendPublicKey: true,
      ecies: {},
      logging: { keyExchangeLayer: true },
    });
  });

  it('should properly initialize', () => {
    expect(keyExchange).toBeInstanceOf(KeyExchange);
    // Additional checks for properties can be done here.
  });

  // More tests will go here...
});
