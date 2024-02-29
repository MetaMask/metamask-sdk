import { RemoteCommunicationPostMessageStream } from '../../PostMessageStream/RemoteCommunicationPostMessageStream';
import { ProviderConstants } from '../../constants';
import * as loggerModule from '../../utils/logger';
import { onMessage } from './onMessage';

describe('onMessage', () => {
  let instance: jest.Mocked<RemoteCommunicationPostMessageStream>;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
      push: jest.fn(),
    } as unknown as jest.Mocked<RemoteCommunicationPostMessageStream>;
  });

  it('should debug log if debug is enabled', () => {
    const message = {
      name: ProviderConstants.PROVIDER,
      data: {},
    };

    onMessage(instance, message);

    expect(spyLogger).toHaveBeenCalledWith(
      `[RCPMS: onMessage()] message=${message}`,
    );
  });

  it('should return early if message is not an object', () => {
    const message = null as any;
    onMessage(instance, message);
    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should return early if message data is not an object', () => {
    const message = {
      name: ProviderConstants.PROVIDER,
      data: undefined,
    };

    onMessage(instance, message);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should return early if message name is not PROVIDER', () => {
    const message = {
      name: 'OTHER_PROVIDER',
      data: {},
    };

    onMessage(instance, message);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should push message if all conditions are met', () => {
    const message = {
      name: ProviderConstants.PROVIDER,
      data: {},
    };

    onMessage(instance, message);

    expect(instance.push).toHaveBeenCalledWith(message);
  });
});
