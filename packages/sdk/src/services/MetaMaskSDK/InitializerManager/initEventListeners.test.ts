import { EventType } from '@metamask/sdk-communication-layer';
import { MetaMaskSDK } from '../../../sdk';
import { initEventListeners } from './initEventListeners';

describe('initEventListeners', () => {
  let instance: MetaMaskSDK;
  const mockEmit = jest.fn();
  const mockOn = jest.fn(
    (_event: EventType, _callback: (data: any) => void) => {
      // do nothing
    },
  );
  const mockGetConnector = jest.fn(() => ({
    on: mockOn,
  }));

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      remoteConnection: {
        getConnector: mockGetConnector,
      },
      emit: mockEmit,
    } as unknown as MetaMaskSDK;
  });

  it('should attach a listener for EventType.CONNECTION_STATUS', () => {
    initEventListeners(instance);

    expect(mockOn).toHaveBeenCalledWith(
      EventType.CONNECTION_STATUS,
      expect.any(Function),
    );
  });

  it('should attach a listener for EventType.SERVICE_STATUS', () => {
    initEventListeners(instance);

    expect(mockOn).toHaveBeenCalledWith(
      EventType.SERVICE_STATUS,
      expect.any(Function),
    );
  });

  it('should propagate EventType.CONNECTION_STATUS events', () => {
    const fakeConnectionStatus = { some: 'data' };
    mockOn.mockImplementation((event, callback) => {
      if (event === EventType.CONNECTION_STATUS) {
        callback(fakeConnectionStatus);
      }
    });

    initEventListeners(instance);

    expect(mockEmit).toHaveBeenCalledWith(
      EventType.CONNECTION_STATUS,
      fakeConnectionStatus,
    );
  });

  it('should propagate EventType.SERVICE_STATUS events', () => {
    const fakeServiceStatus = { some: 'info' };
    mockOn.mockImplementation((event, callback) => {
      if (event === EventType.SERVICE_STATUS) {
        callback(fakeServiceStatus);
      }
    });

    initEventListeners(instance);

    expect(mockEmit).toHaveBeenCalledWith(
      EventType.SERVICE_STATUS,
      fakeServiceStatus,
    );
  });
});
