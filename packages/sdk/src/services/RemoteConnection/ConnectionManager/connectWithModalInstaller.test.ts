import { EventType } from '@metamask/sdk-communication-layer';
import { showInstallModal } from '../ModalManager/showInstallModal';
import { METAMASK_CONNECT_BASE_URL } from '../../../constants';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { connectWithModalInstaller } from './connectWithModalInstaller';

jest.mock('../ModalManager/showInstallModal');

describe('connectWithModalInstaller', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;
  let linkParams: string;

  const mockShowInstallModal = showInstallModal as jest.Mock;
  const mockSdkOnce = jest.fn();
  const mockConnectorOnce = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      developerMode: false,
      connector: {
        once: mockConnectorOnce,
      },
    } as unknown as RemoteConnectionState;

    options = {
      sdk: {
        once: mockSdkOnce,
      },
      modals: {},
    } as unknown as RemoteConnectionProps;

    linkParams = 'some=test&params=here';
  });

  it('should reject the promise when no connector is available', async () => {
    state.connector = undefined;

    await expect(
      connectWithModalInstaller(state, options, linkParams),
    ).rejects.toThrow('No connector available');
  });

  it('should show the installation modal with the correct universal link', async () => {
    const expectedUniversalLink = `${METAMASK_CONNECT_BASE_URL}?${linkParams}`;

    mockConnectorOnce.mockImplementationOnce((event, callback) => {
      if (event === EventType.CLIENTS_READY) {
        callback();
      }
    });

    await connectWithModalInstaller(state, options, linkParams);

    expect(mockShowInstallModal).toHaveBeenCalledWith(
      state,
      options,
      expectedUniversalLink,
    );
  });

  it('should reject the promise when EventType.PROVIDER_UPDATE is emitted', async () => {
    const mockType = 'mockProviderUpdateType';

    mockSdkOnce.mockImplementationOnce((event, callback) => {
      if (event === EventType.PROVIDER_UPDATE) {
        callback(mockType);
      }
    });

    await expect(
      connectWithModalInstaller(state, options, linkParams),
    ).rejects.toStrictEqual(mockType);
  });

  it('should resolve the promise when EventType.CLIENTS_READY is emitted', async () => {
    mockConnectorOnce.mockImplementationOnce((event, callback) => {
      if (event === EventType.CLIENTS_READY) {
        callback();
      }
    });

    const res = await connectWithModalInstaller(state, options, linkParams);

    expect(res).toBeUndefined();
  });
});
