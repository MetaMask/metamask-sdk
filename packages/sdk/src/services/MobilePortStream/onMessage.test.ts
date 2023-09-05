import { MobilePortStream } from '../../PortStream/MobilePortStream';
import { onMessage } from './onMessage';

describe('onMessage', () => {
  let instance: jest.Mocked<MobilePortStream>;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      _origin: 'http://example.com',
      _name: 'testPort',
      push: jest.fn(),
    } as unknown as jest.Mocked<MobilePortStream>;
  });

  it('should ignore messages from incorrect origins', () => {
    const event = {
      origin: 'http://bad-origin.com',
      data: {
        data: {},
      },
    };

    onMessage(instance, event);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should ignore invalid messages', () => {
    const event = {
      origin: instance._origin,
      data: 'string',
    };

    onMessage(instance, event);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should ignore messages without data object', () => {
    const event = {
      origin: instance._origin,
      data: {},
    };

    onMessage(instance, event);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should ignore messages not targeted at this instance', () => {
    const event = {
      origin: instance._origin,
      data: {
        target: 'wrongTarget',
        data: {},
      },
    };

    onMessage(instance, event);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should ignore outgoing messages', () => {
    const event = {
      origin: instance._origin,
      data: {
        target: instance._name,
        data: {
          data: {
            toNative: true,
          },
        },
      },
    };

    onMessage(instance, event);

    expect(instance.push).not.toHaveBeenCalled();
  });

  it('should push Buffer messages', () => {
    instance._origin = 'someOrigin';
    instance._name = 'someName';

    const eventData = { someKey: 'someValue' };
    const bufferData = Buffer.from(JSON.stringify(eventData));

    const event = {
      origin: 'someOrigin',
      data: {
        target: 'someName',
        data: bufferData,
      },
    };

    onMessage(instance, event);

    expect(instance.push).toHaveBeenCalledWith({
      data: bufferData,
      target: 'someName',
    });
  });

  it('should push other valid messages', () => {
    const message = {
      target: instance._name,
      data: {},
    };

    const event = {
      origin: instance._origin,
      data: message,
    };

    onMessage(instance, event);

    expect(instance.push).toHaveBeenCalledWith(message);
  });
});
