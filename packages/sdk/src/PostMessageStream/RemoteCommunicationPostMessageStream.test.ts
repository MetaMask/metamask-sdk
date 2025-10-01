import {
  CommunicationLayerMessage,
  EventType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { onMessage } from '../services/RemoteCommunicationPostMessageStream/onMessage';
import { write } from '../services/RemoteCommunicationPostMessageStream/write';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';

jest.mock('../services/RemoteCommunicationPostMessageStream/onMessage');
jest.mock('../services/RemoteCommunicationPostMessageStream/write');

describe('RemoteCommunicationPostMessageStream', () => {
  let instance: RemoteCommunicationPostMessageStream;
  const mockRemoteCommunication: RemoteCommunication = { on: jest.fn() } as any;
  const mockPlatformManager: PlatformManager = {} as any;

  beforeEach(() => {
    instance = new RemoteCommunicationPostMessageStream({
      name: ProviderConstants.PROVIDER,
      remote: mockRemoteCommunication,
      deeplinkProtocol: false,
      platformManager: mockPlatformManager,
    });
  });

  it('should properly initialize', () => {
    expect(instance.state._name).toBe(ProviderConstants.PROVIDER);
    expect(instance.state.remote).toBe(mockRemoteCommunication);
    expect(instance.state.platformManager).toBe(mockPlatformManager);
    expect(mockRemoteCommunication.on).toHaveBeenCalledWith(
      EventType.MESSAGE,
      expect.any(Function),
    );
  });

  it('should initialize with hideReturnToAppNotification option', () => {
    const instanceWithOption = new RemoteCommunicationPostMessageStream({
      name: ProviderConstants.PROVIDER,
      remote: mockRemoteCommunication,
      deeplinkProtocol: false,
      platformManager: mockPlatformManager,
      hideReturnToAppNotification: true,
    });

    expect(instanceWithOption.state.hideReturnToAppNotification).toBe(true);
  });

  it('should have hideReturnToAppNotification as false by default', () => {
    expect(instance.state.hideReturnToAppNotification).toBe(false);
  });

  it('should call _write properly', async () => {
    const chunk = 'someData';
    const encoding = 'utf8';
    const callback = jest.fn();

    await instance._write(chunk, encoding, callback);

    expect(write).toHaveBeenCalledWith(instance, chunk, encoding, callback);
  });

  it('should return undefined when _read is called', () => {
    const result = instance._read();
    expect(result).toBeUndefined();
  });

  it('should call _onMessage properly', () => {
    const message: CommunicationLayerMessage = {}; // your mock message
    instance._onMessage(message);

    expect(onMessage).toHaveBeenCalledWith(instance, message);
  });

  it('should have a start method that does not throw', () => {
    expect(() => instance.start()).not.toThrow();
  });
});
