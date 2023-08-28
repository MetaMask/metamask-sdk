/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { handleAuthorization } from './handleAuthorization';

describe('handleAuthorization', () => {
  let instance: RemoteCommunication;
  let message: CommunicationLayerMessage;

  const mockOnce = jest.fn();
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'testContext',
        ready: true,
        authorized: false,
        isOriginator: true,
        walletInfo: {
          version: '7.3',
        },
        communicationLayer: {
          sendMessage: mockSendMessage,
        },
      },
      once: mockOnce,
    } as unknown as RemoteCommunication;

    message = {
      method: 'sampleMethod',
      data: 'sampleData',
    };
  });

  it('should send message immediately if wallet version is less than 7.3', async () => {
    instance.state.walletInfo!.version = '7.2';

    await handleAuthorization(instance, message);

    expect(instance.state.communicationLayer?.sendMessage).toHaveBeenCalledWith(
      message,
    );
    expect(instance.once).not.toHaveBeenCalled();
  });

  it('should send message immediately if isOriginator is false or authorized is true', async () => {
    instance.state.isOriginator = false;

    await handleAuthorization(instance, message);

    expect(instance.state.communicationLayer?.sendMessage).toHaveBeenCalledWith(
      message,
    );
    expect(instance.once).not.toHaveBeenCalled();

    jest.clearAllMocks();
    instance.state.isOriginator = true;
    instance.state.authorized = true;

    await handleAuthorization(instance, message);

    expect(instance.state.communicationLayer?.sendMessage).toHaveBeenCalledWith(
      message,
    );
    expect(instance.once).not.toHaveBeenCalled();
  });

  it('should wait for the AUTHORIZED event if neither of the above conditions are met before sending the message', async () => {
    mockOnce.mockImplementation((_, callback) => callback());

    await handleAuthorization(instance, message);

    expect(instance.state.communicationLayer?.sendMessage).toHaveBeenCalledWith(
      message,
    );

    expect(instance.once).toHaveBeenCalledWith(
      EventType.AUTHORIZED,
      expect.any(Function),
    );
  });

  it('should log debug information if debug is enabled', async () => {
    instance.state.debug = true;
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    await handleAuthorization(instance, message);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `RemoteCommunication::${instance.state.context}::sendMessage::handleAuthorization ready=${instance.state.ready} authorized=${instance.state.authorized} method=${message.method}`,
    );

    consoleLogSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  it('should correctly handle wallet versions like 7.10 vs 7.9', async () => {
    instance.state.walletInfo!.version = '7.10';

    await handleAuthorization(instance, message);

    expect(instance.state.communicationLayer?.sendMessage).toHaveBeenCalledWith(
      message,
    );
    expect(instance.once).not.toHaveBeenCalled();
  });
});
