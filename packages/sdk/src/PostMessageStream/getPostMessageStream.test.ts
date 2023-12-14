import { ProviderConstants } from '../constants';
import { RemoteConnection } from '../services/RemoteConnection';
import { getPostMessageStream } from './getPostMessageStream';
import { RemoteCommunicationPostMessageStream } from './RemoteCommunicationPostMessageStream';

jest.mock('../services/RemoteConnection');
jest.mock('./RemoteCommunicationPostMessageStream');

describe('getPostMessageStream', () => {
  const mockRemoteConnection = RemoteConnection as jest.MockedClass<
    typeof RemoteConnection
  >;
  const mockPostMessageStream =
    RemoteCommunicationPostMessageStream as jest.MockedClass<
      typeof RemoteCommunicationPostMessageStream
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if remoteConnection is missing', () => {
    expect(() =>
      getPostMessageStream({
        name: ProviderConstants.CONTENT_SCRIPT,
        remoteConnection: undefined,
        debug: false,
      } as any),
    ).toThrow('Missing remote connection parameter');
  });

  it('should return a new RemoteCommunicationPostMessageStream if all parameters are present', () => {
    const fakeConnector = {};
    const fakePlatformManager = {};
    mockRemoteConnection.mockImplementation(
      () =>
        ({
          getConnector: jest.fn().mockReturnValue(fakeConnector),
          getPlatformManager: jest.fn().mockReturnValue(fakePlatformManager),
        } as any),
    );

    const result = getPostMessageStream({
      name: ProviderConstants.CONTENT_SCRIPT,
      remoteConnection: new RemoteConnection({
        getConnector: jest.fn().mockReturnValue(fakeConnector),
      } as any),
      debug: false,
    } as any);

    expect(result).toBeInstanceOf(RemoteCommunicationPostMessageStream);
    expect(mockPostMessageStream).toHaveBeenCalledWith({
      name: ProviderConstants.CONTENT_SCRIPT,
      remote: fakeConnector,
      platformManager: fakePlatformManager,
      debug: false,
    });
  });
});
