import {
  METAMASK_DEEPLINK_BASE,
  METAMASK_CONNECT_BASE_URL,
} from '../../../constants';
import { RemoteConnectionState } from '../RemoteConnection';
import { connectWithDeeplink } from './connectWithDeeplink';

describe('connectWithDeeplink', () => {
  const mockOpenDeeplink = jest.fn();

  let state: RemoteConnectionState;
  let linkParams: string;

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      developerMode: false,
      connector: null,
    } as unknown as RemoteConnectionState;

    linkParams = 'some=test&params=here';
  });

  it('should form and attempt to open the correct universal and deep link', async () => {
    const expectedUniversalLink = `${METAMASK_CONNECT_BASE_URL}?${linkParams}`;
    const expectedDeeplink = `${METAMASK_DEEPLINK_BASE}?${linkParams}`;

    state.platformManager = {
      openDeeplink: mockOpenDeeplink,
    } as unknown as RemoteConnectionState['platformManager'];

    await connectWithDeeplink(state, linkParams);

    expect(mockOpenDeeplink).toHaveBeenCalledWith(
      expectedUniversalLink,
      expectedDeeplink,
      '_self',
    );
  });

  it('should not attempt to open a link if platformManager or openDeeplink is not available', async () => {
    state.platformManager = undefined;

    await connectWithDeeplink(state, linkParams);

    expect(mockOpenDeeplink).not.toHaveBeenCalled();
  });
});
