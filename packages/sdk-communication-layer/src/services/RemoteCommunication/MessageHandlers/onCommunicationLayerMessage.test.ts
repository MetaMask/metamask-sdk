import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { MessageType } from '../../../types/MessageType';
import { EventType } from '../../../types/EventType';
import { onCommunicationLayerMessage } from './onCommunicationLayerMessage';
import { handleOriginatorInfoMessage } from './handleOriginatorInfoMessage';
import { handleAuthorizedMessage } from './handleAuthorizedMessage';
import { handleOtpMessage } from './handleOtpMessage';
import { handlePauseMessage } from './handlePauseMessage';
import { handleReadyMessage } from './handleReadyMessage';
import { handleTerminateMessage } from './handleTerminateMessage';
import { handleWalletInfoMessage } from './handleWalletInfoMessage';

jest.mock('./handleOriginatorInfoMessage');
jest.mock('./handleAuthorizedMessage');
jest.mock('./handleOtpMessage');
jest.mock('./handlePauseMessage');
jest.mock('./handleReadyMessage');
jest.mock('./handleTerminateMessage');
jest.mock('./handleWalletInfoMessage');

const mockHandleAuthorizedMessage =
  handleAuthorizedMessage as jest.MockedFunction<
    typeof handleAuthorizedMessage
  >;
const mockHandleOtpMessage = handleOtpMessage as jest.MockedFunction<
  typeof handleOtpMessage
>;
const mockHandlePauseMessage = handlePauseMessage as jest.MockedFunction<
  typeof handlePauseMessage
>;
const mockHandleReadyMessage = handleReadyMessage as jest.MockedFunction<
  typeof handleReadyMessage
>;
const mockHandleTerminateMessage =
  handleTerminateMessage as jest.MockedFunction<typeof handleTerminateMessage>;
const mockHandleWalletInfoMessage =
  handleWalletInfoMessage as jest.MockedFunction<
    typeof handleWalletInfoMessage
  >;

describe('onCommunicationLayerMessage', () => {
  let instance: RemoteCommunication;
  let message: CommunicationLayerMessage;

  const mockHandleOriginatorInfoMessage =
    handleOriginatorInfoMessage as jest.MockedFunction<
      typeof handleOriginatorInfoMessage
    >;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        isOriginator: false,
        ready: false,
        context: 'test-context',
      },
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should log the message if debug mode is enabled', () => {
    instance.state.debug = true;
    const consoleDebugSpy = jest.spyOn(console, 'debug');
    message = { type: MessageType.READY }; // Any arbitrary message type
    onCommunicationLayerMessage(message, instance);
    expect(consoleDebugSpy).toHaveBeenCalled();
    consoleDebugSpy.mockRestore();
  });

  it('should set the ready status to true', () => {
    message = { type: MessageType.READY };
    onCommunicationLayerMessage(message, instance);
    expect(instance.state.ready).toBe(true);
  });

  it('should invoke handleOriginatorInfoMessage for ORIGINATOR_INFO messages when not originator', () => {
    message = { type: MessageType.ORIGINATOR_INFO };

    onCommunicationLayerMessage(message, instance);

    expect(mockHandleOriginatorInfoMessage).toHaveBeenCalled();
  });

  it('should invoke handleWalletInfoMessage for WALLET_INFO messages when originator', () => {
    instance.state.isOriginator = true;
    message = { type: MessageType.WALLET_INFO };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleWalletInfoMessage).toHaveBeenCalled();
  });

  it('should invoke handleTerminateMessage for TERMINATE messages', () => {
    message = { type: MessageType.TERMINATE };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleTerminateMessage).toHaveBeenCalled();
  });

  it('should invoke handlePauseMessage for PAUSE messages', () => {
    message = { type: MessageType.PAUSE };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandlePauseMessage).toHaveBeenCalled();
  });

  it('should invoke handleReadyMessage for READY messages when originator', () => {
    instance.state.isOriginator = true;
    message = { type: MessageType.READY };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleReadyMessage).toHaveBeenCalled();
  });

  it('should invoke handleOtpMessage for OTP messages when originator', () => {
    instance.state.isOriginator = true;
    message = { type: MessageType.OTP };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleOtpMessage).toHaveBeenCalled();
  });

  it('should invoke handleAuthorizedMessage for AUTHORIZED messages when originator', () => {
    instance.state.isOriginator = true;
    message = { type: MessageType.AUTHORIZED };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleAuthorizedMessage).toHaveBeenCalled();
  });

  it('should emit a MESSAGE event for unrecognized message types', () => {
    message = { type: 'UNRECOGNIZED_TYPE' as MessageType };
    onCommunicationLayerMessage(message, instance);
    expect(instance.emit).toHaveBeenCalledWith(EventType.MESSAGE, message);
  });

  it('should NOT invoke handleWalletInfoMessage for WALLET_INFO messages when not originator', () => {
    instance.state.isOriginator = false;
    message = { type: MessageType.WALLET_INFO };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleWalletInfoMessage).not.toHaveBeenCalled();
  });

  it('should NOT invoke handleReadyMessage for READY messages when not originator', () => {
    instance.state.isOriginator = false;
    message = { type: MessageType.READY };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleReadyMessage).not.toHaveBeenCalled();
  });

  it('should NOT invoke handleOtpMessage for OTP messages when not originator', () => {
    instance.state.isOriginator = false;
    message = { type: MessageType.OTP };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleOtpMessage).not.toHaveBeenCalled();
  });

  it('should NOT invoke handleAuthorizedMessage for AUTHORIZED messages when not originator', () => {
    instance.state.isOriginator = false;
    message = { type: MessageType.AUTHORIZED };
    onCommunicationLayerMessage(message, instance);
    expect(mockHandleAuthorizedMessage).not.toHaveBeenCalled();
  });
});
