/** biome-ignore-all lint/suspicious/noExplicitAny: Tests require it */
/** biome-ignore-all lint/suspicious/noAsyncPromiseExecutor: ok for tests */
/** biome-ignore-all lint/style/noNonNullAssertion: Tests require it */

/**
 * Fixtures files, allows us to create a standardized test configuration for each platform
 * Allows us to run the tests in Node, React Native and Web without changing the overall logic or having to add manual testing
 *
 * We first have mocks in tests/mocks/index.ts, in that file we declare all the mocked packages and data that is needed to run the tests
 *
 * We also have tests/env/index.ts, that file contains everything that is needed to virtualize the environment for each platform, mocking window object,
 * and whatever else is required by the platform
 *
 * Finally we have the createTest function, that is used to create the test configuration for each platform, and the runTestsInNodeEnv, runTestsInRNEnv and runTestsInWebEnv functions,
 * that are used to run the tests for each platform.
 */

import './mocks';
import * as t from 'vitest';
import { vi } from 'vitest';
import type { MultichainOptions } from '../src/domain';
import { MultichainSDK } from '../src/multichain';

// Import createSDK functions for convenience
import { createMetamaskSDK as createMetamaskSDKWeb } from '../src/index.browser';
import { createMetamaskSDK as createMetamaskSDKRN } from '../src/index.native';
import { createMetamaskSDK as createMetamaskSDKNode } from '../src/index.node';
import type { NativeStorageStub, MockedData, TestSuiteOptions, CreateTestFN } from '../tests/types';

import { getDefaultTransport, TransportResponse } from '@metamask/multichain-api-client';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';

import { setupNodeMocks, setupRNMocks, setupWebMobileMocks, setupWebMocks } from './env';

export const TRANSPORT_REQUEST_RESPONSE_DELAY = 50;


// Helper functions to create standardized test configurations
export const runTestsInNodeEnv = <T extends MultichainOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void) => {
	return createTest({
		platform: 'node',
		createSDK: createMetamaskSDKNode,
		options,
		setupMocks: setupNodeMocks,
		tests: testSuite,
	});
};

export const runTestsInRNEnv = <T extends MultichainOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void) => {
	return createTest({
		platform: 'rn',
		createSDK: createMetamaskSDKRN,
		options,
		setupMocks: setupRNMocks,
		tests: testSuite,
	});
};

export const runTestsInWebEnv = <T extends MultichainOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void, dappUrl?: string) => {
	return createTest({
		platform: 'web',
		createSDK: createMetamaskSDKWeb,
		options,
		setupMocks: (nativeStorageStub) => setupWebMocks(nativeStorageStub, dappUrl),
		tests: testSuite,
	});
};

export const runTestsInWebMobileEnv = <T extends MultichainOptions>(options: T, testSuite: (options: TestSuiteOptions<T>) => void, dappUrl?: string) => {
	return createTest({
		platform: 'web-mobile',
		createSDK: createMetamaskSDKWeb,
		options,
		setupMocks: (nativeStorageStub) => setupWebMobileMocks(nativeStorageStub, dappUrl),
		tests: testSuite,
	});
};
export const createTest: CreateTestFN = ({ platform, options, createSDK, setupMocks, cleanupMocks, tests }) => {
  const mockWalletGetSession = t.vi.fn(() => Promise.reject('Please mock mockWalletGetSession')) as any;
  const mockWalletCreateSession = t.vi.fn(() => Promise.reject('Please mock mockWalletCreateSession')) as any;
  const mockSessionRequest = t.vi.fn(() => Promise.reject('Please mock mockSessionRequest')) as any;
  const mockWalletInvokeMethod = t.vi.fn(() => Promise.reject('Please mock mockWalletInvokeMethod')) as any;
  const mockWalletRevokeSession = t.vi.fn() as any;

	const nativeStorageStub: NativeStorageStub = {
    data: new Map<string, string>(),
    getItem: t.vi.fn((key: string) => nativeStorageStub.data.get(key) || null),
    setItem: t.vi.fn((key: string, value: string) => {
      nativeStorageStub.data.set(key, value);
    }),
    removeItem: t.vi.fn((key: string) => {
      nativeStorageStub.data.delete(key);
    }),
    clear: t.vi.fn(() => {
      nativeStorageStub.data.clear();
    }),
  }
	let setupAnalyticsSpy!: t.MockInstance<MultichainSDK['setupAnalytics']>;
	let initSpy!: t.MockInstance<MultichainSDK['init']>;
	let emitSpy!: t.MockInstance<MultichainSDK['emit']>;
	let showInstallModalSpy!: t.MockInstance<any>;
	let mockLogger!: t.MockInstance<debug.Debugger>;
	let mockDefaultTransport!: t.Mocked<any>;

  let pendingRequests:Map<string,  {
    resolve: (value: TransportResponse<unknown>) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>

	async function beforeEach() {
		try {
      pendingRequests = new Map();

      nativeStorageStub.data.clear();

      const defaultTransportMock = t.vi.mocked(getDefaultTransport);
      const createDappClientMock = t.vi.mocked(DappClient);

			const loggerActual = (await import('../src/domain/logger')) as any;
			const mwpCoreActual = (await import('@metamask/mobile-wallet-protocol-core')) as any;
      const mwpTransportActual = (await import('../src/multichain/transports/mwp')) as any;

      mockLogger = loggerActual.__mockLogger;
      mwpTransportActual.__mockPendingRequestsMap = pendingRequests;

      let requestId = 0;
			mockDefaultTransport = {
        isDefaultTransport: true,
				connect: t.vi.fn(async () => {
					mockDefaultTransport.__isConnected = true;
				}),
				disconnect: t.vi.fn(() => {
					mockDefaultTransport.__isConnected = false;
				}),
				isConnected: t.vi.fn(() => {
					return mockDefaultTransport.__isConnected;
				}),
				request: t.vi.fn(async (payload) => {
					try {
            const id = payload.id ?? requestId++;

						if (payload.method === 'wallet_getSession') {
							const result = await  mockWalletGetSession();
							return Promise.resolve({
								id,
								jsonrpc: '2.0',
								method: 'wallet_getSession',
								result,
							});
						}

						if (payload.method === 'wallet_createSession') {
							const result =  await mockWalletCreateSession();
							return Promise.resolve({
								id,
								jsonrpc: '2.0',
								method: 'wallet_createSession',
								result,
							});
						}
						if (payload.method === 'wallet_revokeSession') {
							const result = await mockWalletRevokeSession();
							return Promise.resolve({
								id,
								jsonrpc: '2.0',
								method: 'wallet_revokeSession',
								result,
							});
						}
            if (payload.method === 'wallet_invokeMethod') {
							const result = await mockWalletInvokeMethod();
							return Promise.resolve({
								id,
								jsonrpc: '2.0',
								method: 'wallet_invokeMethod',
								result,
							});
						}

						return Promise.reject(new Error(`Forgot to mock ${payload.method} RPC call?`));
					} catch (err) {
						return Promise.reject(err);
					}
				}),
				onNotification: t.vi.fn((callback: (data: any) => void) => {
					mockDefaultTransport.__notificationCallback = callback;
					return () => {
						mockDefaultTransport.__notificationCallback = null;
					};
				}),
				__isConnected: false,
				__notificationCallback: null as ((data: any) => void) | null,
				__triggerNotification: t.vi.fn((data: any) => {
					if (mockDefaultTransport.__notificationCallback) {
						mockDefaultTransport.__notificationCallback(data);
					}
				}),
			};

      // Set debug flag
			nativeStorageStub.data.set('DEBUG', 'metamask-sdk:*');

			// Create spies for SDK methods
			initSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'init');
			setupAnalyticsSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'setupAnalytics');
			emitSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'emit');
			showInstallModalSpy = t.vi.spyOn(MultichainSDK.prototype as any, 'showInstallModal');

			mwpCoreActual.__mockStorage = nativeStorageStub.data;

			// const storageMock = await import('@metamask/mobile-wallet-protocol-core') as any;
			// vi.spyOn(storageMock.__mockSessionStore, 'list')
			//   .mockImplementation(async () => Promise.resolve([await mockSessionRequest()]));

      const eventListeners = new Map<string, Array<{ handler: (...args: any[]) => void; once: boolean }>>();
      const mockDappClient = {
        __state: 'DISCONNECTED' as any,
        get state() {
          return mockDappClient.__state;
        },
        set state(state: string) {
          mockDappClient.__state = state;
        },
        resume:t.vi.fn(async() => {
          mockDappClient.emit('connected');
          mockDappClient.state = 'CONNECTED' as any;
          return Promise.resolve();
        }),
        connect:t.vi.fn(async (data: any) => {
          try {
            console.log('mockDappClient.connect start');
            //Establish the connection automatically
            mockDappClient.emit('connected');
            (mockDappClient as any).state = 'CONNECTED' as any;

            //Send session request for mwp
            const sessionRequest = mockSessionRequest();
            mockDappClient.emit('session_request', sessionRequest);

            if (data?.initialPayload) {
              //Allow the initial wallet_createSession request to be sent
              console.log('mockDappClient.connect awaiting sendRequest');
              await mockDappClient.sendRequest(data.initialPayload);
              console.log('mockDappClient.connect sendRequest finished');
            }
            console.log('mockDappClient.connect end');
          } catch (err) {
            console.error('mockDappClient.connect caught error', err);
            return Promise.reject(err);
          }
        }),
        disconnect:t.vi.fn(async () => {
          mockDappClient.emit('disconnected');
          return Promise.resolve();
        }),
        sendRequest:t.vi.fn(async (request: any) => {
          try  {
            const id = request.id ?? requestId++;
            if (request.method === 'wallet_getSession') {
              return new Promise<void>((resolve, reject) => {
                const req = {
                  resolve: (result: any) => {
                    mockDappClient.emit('message', {
                      data: {
                        id,
                      jsonrpc: '2.0',
                      method: 'wallet_getSession',
                      result,
                      },
                    });
                    resolve();
                  },
                  reject: reject, timeout: null as any
                }
                pendingRequests.set(id,req );
                setTimeout(async () => {
                  try {
                   const result =await  mockWalletGetSession();
                   req.resolve(result);
                  } catch (err) {
                   req.reject(err)
                  }
                 }, TRANSPORT_REQUEST_RESPONSE_DELAY);
               });
            }
            if (request.method === 'wallet_createSession') {

               return new Promise<void>((resolve, reject) => {
                const req = {
                  resolve: (result: any) => {
                    console.log('mockDappClient.sendRequest wallet_createSession resolving');
                    mockDappClient.emit('message', {
                      data: {
                        id,
                        jsonrpc: '2.0',
                        method: 'wallet_createSession',
                        result,
                      },
                    });
                    resolve();
                  },
                  reject: reject, timeout: null as any
                }
                pendingRequests.set(id,req );
                setTimeout(async () => {
                  try {
                   console.log('mockDappClient.sendRequest wallet_createSession calling mockWalletCreateSession');
                   const result =await  mockWalletCreateSession();
                   req.resolve(result);
                  } catch (err) {
                   console.error('mockDappClient.sendRequest wallet_createSession caught error', err);
                   req.reject(err)
                  }
                 }, TRANSPORT_REQUEST_RESPONSE_DELAY);
               });
            }

            if (request.method === 'wallet_revokeSession') {
              return new Promise<void>((resolve, reject) => {
                const req = {
                  resolve: (result: any) => {
                    mockDappClient.emit('message', {
                      data: {
                        id,
                        jsonrpc: '2.0',
                        method: 'wallet_revokeSession',
                        result,
                      },
                    });
                    resolve();
                  },
                  reject: reject, timeout: null as any
                }
                pendingRequests.set(id,req );
                setTimeout(async () => {
                  try {
                   const result =await  mockWalletRevokeSession();
                   req.resolve(result);
                  } catch (err) {
                   req.reject(err)
                  }
                 }, TRANSPORT_REQUEST_RESPONSE_DELAY);
               });
            }

            if (request.method === 'wallet_invokeMethod') {
              return new Promise<void>((resolve, reject) => {
                const req = {
                  resolve: (result: any) => {
                    mockDappClient.emit('message', {
                      data: {
                        id,
                      jsonrpc: '2.0',
                      method: 'wallet_invokeMethod',
                      result,
                      },
                    });
                    resolve();
                  },
                  reject: reject, timeout: null as any
                }
                pendingRequests.set(id,req );
                setTimeout(async () => {
                  try {
                   const result =await  mockWalletInvokeMethod();
                   req.resolve(result);
                  } catch (err) {
                   req.reject(err)
                  }
                 }, TRANSPORT_REQUEST_RESPONSE_DELAY);
               });
            }

            return Promise.reject(new Error('Forgot to mock this RPC call?'));
          } catch (err) {
            throw err;
          }
        }),

        // Event handling methods
        once:t.vi.fn((event: string, handler: (...args: any[]) => void) => {
          if (!eventListeners.has(event)) {
            eventListeners.set(event, []);
          }
          eventListeners.get(event)!.push({ handler, once: true });
        }),

        on:t.vi.fn((event: string, handler: (...args: any[]) => void) => {
          if (!eventListeners.has(event)) {
            eventListeners.set(event, []);
          }
          eventListeners.get(event)!.push({ handler, once: false });
        }),

        off:t.vi.fn((event: string, handler?: (...args: any[]) => void) => {
          if (!eventListeners.has(event)) return;

          if (handler) {
            // Remove specific handler
            const listeners = eventListeners.get(event)!;
            const index = listeners.findIndex((listener) => listener.handler === handler);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          } else {
            // Remove all handlers for this event
            eventListeners.delete(event);
          }
        }),

        // Method to emit events (for testing purposes)
        emit:t.vi.fn((event: string, ...args: any[]) => {
          if (!eventListeners.has(event)) return;

          const listeners = eventListeners.get(event)!;
          // Create a copy to iterate over, as 'once' handlers will modify the original array
          const listenersToCall = [...listeners];

          listenersToCall.forEach(({ handler, once }) => {
            try {
              handler(...args);
            } catch (error) {
              console.error(`Error in event handler for '${event}':`, error);
            }

            // Remove 'once' handlers after calling them
            if (once) {
              const index = listeners.findIndex((l) => l.handler === handler);
              if (index !== -1) {
                listeners.splice(index, 1);
              }
            }
          });
        }),

        // Helper methods for testing
        getEventListeners:t.vi.fn((event?: string) => {
          if (event) {
            return eventListeners.get(event) || [];
          }
          return Object.fromEntries(eventListeners);
        }),

        clearEventListeners:t.vi.fn((event?: string) => {
          if (event) {
            eventListeners.delete(event);
          } else {
            eventListeners.clear();
          }
        }),
      } as any;


      createDappClientMock.mockImplementation(() => mockDappClient);
      defaultTransportMock.mockReturnValue(mockDefaultTransport);

			t.vi.spyOn(MultichainSDK.prototype as any, 'createDappClient').mockImplementation(() => {
				return mockDappClient;
			});

			// Setup platform-specific mocks
			setupMocks?.(nativeStorageStub);
			return {
				initSpy,
				setupAnalyticsSpy,
				emitSpy,
				showInstallModalSpy,
				nativeStorageStub,
				mockDappClient,
				mockDefaultTransport,
				mockLogger,
				mockWalletGetSession,
				mockWalletCreateSession,
				mockWalletRevokeSession,
        mockWalletInvokeMethod,
				mockSessionRequest,
			};
		} catch (error) {
			console.error('Error in beforeEach', error);
			debugger;
			throw error;
		}
	}

	async function afterEach(mocks: MockedData) {
		// Clear storage
		mocks.nativeStorageStub.data.clear();

		// Restore spies
		mocks.setupAnalyticsSpy?.mockRestore();
		mocks.initSpy?.mockRestore();
		mocks.emitSpy?.mockRestore();

		mocks.mockWalletGetSession.mockRestore();
		mocks.mockWalletCreateSession.mockRestore();
		mocks.mockSessionRequest.mockRestore();
		mocks.mockWalletRevokeSession.mockRestore();
		mocks.showInstallModalSpy.mockRestore();

		// Clear all mocks
		vi.clearAllMocks();

		// Run custom cleanup
		cleanupMocks?.();
	}

	tests({
		platform,
		createSDK,
		options,
		beforeEach,
		afterEach,
		storage: nativeStorageStub,
	});
};
