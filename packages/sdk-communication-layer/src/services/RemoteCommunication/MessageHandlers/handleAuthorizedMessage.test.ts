import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { handleAuthorizedMessage } from './handleAuthorizedMessage';

describe('handleAuthorizedMessage', () => {
  let instance: RemoteCommunication;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        authorized: false,
      },
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should set the authorized state to true', () => {
    handleAuthorizedMessage(instance);
    expect(instance.state.authorized).toBe(true);
  });

  it('should emit an AUTHORIZED event', () => {
    handleAuthorizedMessage(instance);
    expect(instance.emit).toHaveBeenCalledWith(EventType.AUTHORIZED);
  });
});
