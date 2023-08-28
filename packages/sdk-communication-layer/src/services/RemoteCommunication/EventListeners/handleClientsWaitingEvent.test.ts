/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { EventType } from '../../../types/EventType';
import { handleClientsWaitingEvent } from './handleClientsWaitingEvent';

jest.useFakeTimers();

describe('handleClientsWaitingEvent', () => {
  let instance: RemoteCommunication;
  const mockEmit = jest.fn();
  const mockSetConnectionStatus = jest.fn();

  jest.spyOn(console, 'debug').mockImplementation();

  const spyClearTimeout = jest.spyOn(global, 'clearTimeout');
  const spySetTimeout = jest.spyOn(global, 'setTimeout');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        context: 'mockContext',
        originatorConnectStarted: true,
        ready: false,
        autoConnectOptions: {
          timeout: 4000,
        },
      },
      emit: mockEmit,
      setConnectionStatus: mockSetConnectionStatus,
    } as unknown as RemoteCommunication;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should log event details if debug is enabled', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(console.debug).toHaveBeenCalledWith(
      `RemoteCommunication::mockContext::on 'clients_waiting' numberUsers=5 ready=false autoStarted=true`,
    );
  });

  it('should update instance state to WAITING', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.WAITING,
    );
  });

  it('should emit CLIENTS_WAITING event with number of waiting users', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_WAITING, 5);
  });

  it('should set a timer if originator connection started automatically', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(spySetTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      instance.state.autoConnectOptions!.timeout,
    );
  });

  it('should update state to TIMEOUT after timer expires and client is not ready', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);

    jest.runAllTimers();

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.TIMEOUT,
    );
  });

  it('should clear timer after executing', () => {
    const handler = handleClientsWaitingEvent(instance);
    handler(5);

    const timeoutId = (setTimeout as unknown as jest.Mock).mock.results[0]
      .value;
    jest.runAllTimers();
    expect(spyClearTimeout).toHaveBeenCalledWith(timeoutId);
  });

  it('should not set a timer if originator connection was not auto started', () => {
    instance.state.originatorConnectStarted = false;
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(spySetTimeout).not.toHaveBeenCalled();
  });

  it('should default to a 3-second timeout if no specific timeout is provided', () => {
    instance.state.autoConnectOptions!.timeout = undefined;
    const handler = handleClientsWaitingEvent(instance);
    handler(5);
    expect(spySetTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
  });
});
