import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
import { SocketService } from '../../../SocketService';
import { DEFAULT_SERVER_URL } from '../../../config';
import { ECIESProps } from '../../../ECIES';
import { initCommunicationLayer } from './initCommunicationLayer';

jest.mock('../../../SocketService');

describe('initCommunicationLayer', () => {
  let instance: any;

  const mockOn = jest.fn();

  (SocketService as jest.MockedFunction<any>).mockImplementation(() => {
    return {
      on: mockOn,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        context: 'testContext',
        transports: {},
        logging: false,
        dappMetadata: {
          url: 'https://sample-app.com',
          name: 'Sample App',
        },
        platformType: 'web',
        communicationLayer: {
          on: mockOn,
        },
      },
    };
  });

  it('should throw error for invalid communication protocol', () => {
    expect(() => {
      initCommunicationLayer({
        communicationLayerPreference: 'UNKNOWN' as CommunicationLayerPreference,
        instance,
      });
    }).toThrow('Invalid communication protocol');
  });

  it('should initialize socket service for SOCKET communication preference', () => {
    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
        context: 'testContext',
      }),
    );
  });

  it('should populate originatorInfo using dappMetadata', () => {
    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(instance.state.originatorInfo).toStrictEqual(
      expect.objectContaining({
        url: 'https://sample-app.com',
        title: 'Sample App',
      }),
    );
  });

  it('should populate originatorInfo using document.URL and document.title if dappMetadata is not available', () => {
    delete instance.state.dappMetadata;
    Object.defineProperty(global, 'document', {
      value: {
        URL: 'https://test-url.com',
        title: 'Test Title',
      },
      writable: true,
    });

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(instance.state.originatorInfo).toStrictEqual(
      expect.objectContaining({
        url: 'https://test-url.com',
        title: 'Test Title',
      }),
    );
  });

  it('should use DEFAULT_SERVER_URL if communicationServerUrl is not provided', () => {
    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationServerUrl: DEFAULT_SERVER_URL,
      }),
    );
  });

  it('should forward ecies props if provided', () => {
    const eciesProps: ECIESProps = {
      debug: true,
      privateKey: 'mockPrivateKey',
    };

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
      ecies: eciesProps,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        ecies: eciesProps,
      }),
    );
  });

  it('should register event listeners for the communication layer', () => {
    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(mockOn).toHaveBeenCalledTimes(12); // because we have 11 events to listen to
  });

  it('should pass otherPublicKey to SocketService if provided', () => {
    const publicKey = 'samplePublicKey';

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      otherPublicKey: publicKey,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        otherPublicKey: publicKey,
      }),
    );
  });

  it('should enable reconnect in SocketService if reconnect is true', () => {
    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      reconnect: true,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        reconnect: true,
      }),
    );
  });

  it('should pass logging option to SocketService', () => {
    instance.state.logging = true;

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        logging: true,
      }),
    );
  });

  it('should catch and log errors during event listener registration', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockOn.mockImplementationOnce(() => {
      throw new Error('Mock Event Listener Error');
    });

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      instance,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error registering handler'),
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should use provided communicationServerUrl', () => {
    const customServerUrl = 'https://custom-server-url.com';

    initCommunicationLayer({
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      communicationServerUrl: customServerUrl,
      instance,
    });

    expect(SocketService).toHaveBeenCalledWith(
      expect.objectContaining({
        communicationServerUrl: customServerUrl,
      }),
    );
  });
});
