import { MetaMaskSDK } from '../../../sdk';
import { resume } from './resume';

describe('resume', () => {
  let instance: MetaMaskSDK;
  let mockIsReady: jest.Mock;
  let mockStartConnection: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReady = jest.fn();
    mockStartConnection = jest.fn();

    instance = {
      debug: false,
      remoteConnection: {
        getConnector: jest.fn().mockReturnValue({ isReady: mockIsReady }),
        startConnection: mockStartConnection,
      },
    } as unknown as MetaMaskSDK;
  });

  describe('Remote Connection', () => {
    it('should start the remote connection if connector is not ready', async () => {
      mockIsReady.mockReturnValue(false);

      await resume(instance);

      expect(mockStartConnection).toHaveBeenCalled();
    });

    it('should not start the remote connection if connector is ready', async () => {
      mockIsReady.mockReturnValue(true);

      await resume(instance);

      expect(mockStartConnection).not.toHaveBeenCalled();
    });

    it('should not start the connection if remoteConnection or connector is undefined', async () => {
      instance.remoteConnection = undefined;

      await resume(instance);

      expect(mockStartConnection).not.toHaveBeenCalled();
    });
  });

  describe('Debug Mode', () => {
    it('should log debug messages when debug is true and getConnector().isReady is false', async () => {
      instance.debug = true;
      mockIsReady.mockReturnValue(false);
      jest.spyOn(console, 'debug').mockImplementation();

      await resume(instance);

      expect(console.debug).toHaveBeenCalledWith('SDK::resume channel');
    });
  });
});
