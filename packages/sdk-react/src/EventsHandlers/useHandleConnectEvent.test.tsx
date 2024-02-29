import { renderHook } from '@testing-library/react-hooks';
import { useHandleConnectEvent } from './useHandleConnectEvent';
import { EventHandlerProps } from '../MetaMaskProvider';
import * as loggerModule from '../utils/logger';

describe('useHandleConnectEvent', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const eventHandlerProps = {
    setConnected: jest.fn(),
    setError: jest.fn(),
    setConnecting: jest.fn(),
    setChainId: jest.fn(),
    debug: true,
  } as unknown as EventHandlerProps;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlerProps.setConnecting = jest.fn();
    eventHandlerProps.setConnected = jest.fn();
    eventHandlerProps.setChainId = jest.fn();
    eventHandlerProps.setError = jest.fn();
  });

  it('should handle connect event correctly ', () => {
    const mockConnectParam = {
      chainId: '0x2',
    };

    const { result } = renderHook(() =>
      useHandleConnectEvent(eventHandlerProps),
    );
    result.current(mockConnectParam);

    expect(spyLogger).toHaveBeenCalledWith(
      "[MetaMaskProvider: useHandleConnectEvent()] on 'connect' event.",
      mockConnectParam,
    );
    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockConnectParam.chainId,
    );
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });

  it('should prioritize external chainId over connectParam chainId', () => {
    const mockConnectParam = {
      chainId: '0x2',
    };

    eventHandlerProps.chainId = '0x3';

    const { result } = renderHook(() =>
      useHandleConnectEvent(eventHandlerProps),
    );
    result.current(mockConnectParam);

    expect(eventHandlerProps.setConnecting).toHaveBeenCalledWith(false);
    expect(eventHandlerProps.setConnected).toHaveBeenCalledWith(true);
    expect(eventHandlerProps.setChainId).toHaveBeenCalledWith(
      mockConnectParam.chainId,
    );
    expect(eventHandlerProps.setError).toHaveBeenCalledWith(undefined);
  });
});
