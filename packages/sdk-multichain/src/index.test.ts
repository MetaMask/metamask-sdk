import * as t from "vitest";
import { vi } from "vitest";
import { JSDOM as Page } from "jsdom";
import { createMetamaskSDK as createMetamaskSDKWeb } from "./index.browser";
import { MultichainSDKBaseOptions, MultichainSDKBase } from "./domain";
import { MultichainSDK } from "./multichain";
import * as loggerModule from "./domain/logger";
import * as analyticsModule from "@metamask/sdk-analytics";
import type { SessionData } from "@metamask/multichain-api-client";
import type { Scope } from "./domain/multichain/api/types";

type NativeStorageStub = {
	data: Map<string, string>;
	getItem: t.Mock<(key: string) => string | null>;
	setItem: t.Mock<(key: string, value: string) => void>;
	removeItem: t.Mock<(key: string) => void>;
	clear: t.Mock<() => void>;
};

// Mock the multichain-api-client with proper implementations
vi.mock("@metamask/multichain-api-client", () => {
	const mockTransport = {
		connect: vi.fn().mockResolvedValue(true),
		disconnect: vi.fn().mockResolvedValue(undefined),
		isConnected: true,
		request: vi.fn(),
		onNotification: vi.fn().mockReturnValue(() => {}),
	};

	const mockMultichainClient = {
		createSession: vi.fn(),
		getSession: vi.fn(),
		revokeSession: vi.fn(),
		invokeMethod: vi.fn(),
		extendsRpcApi: vi.fn(),
		onNotification: vi.fn().mockReturnValue(() => {}),
	};

	const mockGetDefaultTransport = vi.fn().mockReturnValue(mockTransport);
	const mockGetMultichainClient = vi.fn().mockReturnValue(mockMultichainClient);

	return {
		getDefaultTransport: mockGetDefaultTransport,
		getMultichainClient: mockGetMultichainClient,
		__mockTransport: mockTransport,
		__mockMultichainClient: mockMultichainClient,
		__mockGetDefaultTransport: mockGetDefaultTransport,
		__mockGetMultichainClient: mockGetMultichainClient,
	};
});

vi.mock("./domain/logger", () => {
	const mockLogger = vi.fn();
	return {
		createLogger: vi.fn(() => mockLogger),
		enableDebug: vi.fn(() => {}),
		isEnabled: vi.fn(() => true),
		__mockLogger: mockLogger,
	};
});

t.vi.mock("@metamask/sdk-analytics");

function createMultiplatformTestCase(
	platform: "web" | "node" | "rn",
	options: MultichainSDKBaseOptions,
	createSDK: (options: MultichainSDKBaseOptions) => Promise<MultichainSDKBase>,
	setupMocks?: (options: NativeStorageStub) => void,
	cleanupMocks?: () => void,
) {
	t.describe(`Testing MultichainSDK in ${platform}`, () => {
		let sdk: MultichainSDKBase;
		let setupAnalyticsSpy: any;
		let initSpy: any;
		let nativeStorageStub: NativeStorageStub;

		// Mock session data for testing
		const mockSessionData: SessionData = {
			sessionScopes: {
				"eip155:1": {
					methods: ["eth_sendTransaction", "eth_accounts"],
					notifications: ["accountsChanged", "chainChanged"],
					accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
				},
			},
			expiry: new Date(Date.now() + 3600000).toISOString(),
		};

		t.beforeEach(async () => {
			(loggerModule as any).__mockLogger.mockReset();
			setupAnalyticsSpy?.mockRestore();
			initSpy?.mockRestore();
			t.vi.clearAllMocks();
			t.vi.resetModules();
			t.vi.unstubAllGlobals();

			// Get mocks from the module mock
			const multichainModule = await import("@metamask/multichain-api-client");
			const mockTransport = (multichainModule as any).__mockTransport;
			const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
			const mockGetDefaultTransport = (multichainModule as any).__mockGetDefaultTransport;
			const mockGetMultichainClient = (multichainModule as any).__mockGetMultichainClient;

			// Reset transport mocks
			mockTransport.connect.mockResolvedValue(true);
			mockTransport.disconnect.mockResolvedValue(undefined);
			mockTransport.isConnected = true;
			mockTransport.request.mockResolvedValue({});
			mockTransport.onNotification.mockReturnValue(() => {});

			// Reset multichain client mocks
			mockMultichainClient.createSession.mockResolvedValue(mockSessionData);
			mockMultichainClient.getSession.mockResolvedValue(mockSessionData);
			mockMultichainClient.revokeSession.mockResolvedValue(undefined);
			mockMultichainClient.invokeMethod.mockResolvedValue({});
			mockMultichainClient.onNotification.mockReturnValue(() => {});

			// Reset factory function mocks
			mockGetDefaultTransport.mockReturnValue(mockTransport);
			mockGetMultichainClient.mockReturnValue(mockMultichainClient);

			nativeStorageStub = {
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
			};

			nativeStorageStub.data.set("DEBUG", "metamask-sdk:*");

			setupMocks?.(nativeStorageStub);

			// Mock analytics methods
			t.vi.mocked(analyticsModule.analytics).setGlobalProperty = t.vi.fn();
			t.vi.mocked(analyticsModule.analytics).enable = t.vi.fn();
			t.vi.mocked(analyticsModule.analytics).track = t.vi.fn();
			setupAnalyticsSpy = t.vi.spyOn(MultichainSDK.prototype as any, "setupAnalytics");
			initSpy = t.vi.spyOn(MultichainSDK.prototype as any, "init");
		});

		t.afterEach(() => {
			nativeStorageStub.data.clear();
			cleanupMocks?.();
			// Reset mock implementations and call history
			(loggerModule as any).__mockLogger.mockReset();
			setupAnalyticsSpy?.mockRestore();
			initSpy?.mockRestore();
			t.vi.clearAllMocks();
			t.vi.resetModules();
			t.vi.unstubAllGlobals();
		});

		t.describe("init", () => {
			t.it(`${platform} should call setupAnalytics if analytics is ENABLED and trigger analytics.enable and init evt`, async () => {
				options.analytics.enabled = true;
				sdk = await createSDK(options);
				t.expect(sdk).toBeDefined();
				t.expect(initSpy).toHaveBeenCalled();
				t.expect(setupAnalyticsSpy).toHaveBeenCalled();
				t.expect(analyticsModule.analytics.enable).toHaveBeenCalled();
				t.expect(analyticsModule.analytics.track).toHaveBeenCalledWith("sdk_initialized", {});
			});

			t.it(`${platform} should NOT call analytics.enable if analytics is DISABLED`, async () => {
				options.analytics.enabled = false;
				sdk = await createSDK(options);
				t.expect(sdk).toBeDefined();
				t.expect(initSpy).toHaveBeenCalled();
				t.expect(setupAnalyticsSpy).toHaveBeenCalled();
				t.expect(analyticsModule.analytics.enable).not.toHaveBeenCalled();
				t.expect(analyticsModule.analytics.track).not.toHaveBeenCalled();
			});

			t.it(`${platform} should call init and setupAnalytics with logger configuration`, async () => {
				const mockLogger = (loggerModule as any).__mockLogger;

				sdk = await createSDK(options);
				t.expect(sdk).toBeDefined();
				t.expect(mockLogger).not.toHaveBeenCalled();

				t.expect(initSpy).toHaveBeenCalled();
				t.expect(setupAnalyticsSpy).toHaveBeenCalled();
				t.expect(sdk.isInitialized).toBe(true);
				t.expect(loggerModule.enableDebug).toHaveBeenCalledWith("metamask-sdk:core");
			});
			t.it(`${platform} should properly initialize provider and get session during init`, async () => {
				sdk = await createSDK(options);

				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
				const mockGetDefaultTransport = (multichainModule as any).__mockGetDefaultTransport;
				const mockGetMultichainClient = (multichainModule as any).__mockGetMultichainClient;

				t.expect(sdk).toBeDefined();
				t.expect(sdk.isInitialized).toBe(true);
				t.expect(sdk.session).toEqual(mockSessionData);

				// Verify the provider was created with the correct transport
				t.expect(mockGetDefaultTransport).toHaveBeenCalled();
				t.expect(mockGetMultichainClient).toHaveBeenCalledWith({ transport: mockTransport });
				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			});
			t.it(`${platform} Should gracefully handle init errors by just logging them and return non initialized sdk`, async () => {
				const testError = new Error("Test error");
				initSpy.mockImplementation(() => {
					throw testError;
				});

				sdk = await createSDK(options);

				t.expect(sdk).toBeDefined();
				t.expect(sdk.isInitialized).toBe(false);

				// Access the mock logger from the module
				const mockLogger = (loggerModule as any).__mockLogger;

				// Verify that the logger was called with the error
				t.expect(mockLogger).toHaveBeenCalledWith("MetaMaskSDK error during initialization", testError);
			});
		});

		t.describe("session", () => {
			t.it(`${platform} should handle session upgrades`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = false;
				mockTransport.connect.mockResolvedValue(true);
				mockMultichainClient.getSession.mockResolvedValue(mockSessionData);

				sdk = await createSDK(options);

				t.expect(sdk).toBeDefined();
				t.expect(sdk.isInitialized).toBe(true);
				t.expect(sdk.session).not.toBeUndefined();

				const mockedSessionUpgradeData: SessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction", "eth_accounts"],
							notifications: ["accountsChanged", "chainChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};

				const scopes = ["eip155:137"] as Scope[];
				const caipAccountIds = ["eip155:137:0x1234567890abcdef1234567890abcdef12345678"] as any;
				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(mockTransport.connect).toHaveBeenCalled();
				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.revokeSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
					optionalScopes: {
						"eip155:137": {
							methods: [],
							notifications: [],
							accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				});
				t.expect(result).toEqual(mockedSessionUpgradeData);
			});

			t.it(`${platform} should handle session retrieval when no session exists`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				// Mock no session scenario
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				sdk = await createSDK(options);

				t.expect(sdk).toBeDefined();
				t.expect(sdk.isInitialized).toBe(true);
				t.expect(sdk.session).toBeUndefined();
				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
			});

			t.it(`${platform} should handle provider errors during session retrieval`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;
				const sessionError = new Error("Session error");

				// Clear previous calls and set up the error mock
				t.vi.clearAllMocks();
				mockMultichainClient.getSession.mockRejectedValue(sessionError);

				sdk = await createSDK(options);

				t.expect(sdk).toBeDefined();
				t.expect(sdk.isInitialized).toBe(false);

				// Access the mock logger from the module
				const mockLogger = (loggerModule as any).__mockLogger;

				// Verify that the logger was called with the error
				t.expect(mockLogger).toHaveBeenCalledWith("MetaMaskSDK error during initialization", sessionError);
			});
		});

		t.describe(`${platform} connect method tests`, () => {
			t.beforeEach(async () => {
				sdk = await createSDK(options);
			});

			t.it(`${platform} should connect transport and create session when not connected`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				// Configure mocks for this specific test BEFORE creating SDK
				mockTransport.isConnected = false;
				mockTransport.connect.mockResolvedValue(true);
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				const newSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};
				mockMultichainClient.createSession.mockResolvedValue(newSessionData);

				// Create a new SDK instance with the mock configured correctly
				const testSdk = await createSDK(options);

				const scopes = ["eip155:1"] as Scope[];
				const caipAccountIds = ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"] as any;

				const result = await testSdk.connect(scopes, caipAccountIds);

				t.expect(mockTransport.connect).toHaveBeenCalled();
				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.revokeSession).not.toHaveBeenCalled();
				t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
					optionalScopes: {
						"eip155:1": {
							methods: [],
							notifications: [],
							accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				});
				t.expect(result).toEqual(newSessionData);
			});

			t.it(`${platform} should skip transport connection when already connected`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				// Mock transport as already connected
				mockTransport.isConnected = true;
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				const newSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};
				mockMultichainClient.createSession.mockResolvedValue(newSessionData);

				const scopes = ["eip155:1"] as Scope[];
				const caipAccountIds = ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"] as any;

				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(mockTransport.connect).not.toHaveBeenCalled();
				t.expect(mockMultichainClient.createSession).toHaveBeenCalled();
				t.expect(result).toEqual(newSessionData);
			});

			t.it(`${platform} should handle invalid CAIP account IDs gracefully`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				// Mock console.error to capture invalid account ID errors
				const consoleErrorSpy = t.vi.spyOn(console, "error").mockImplementation(() => {});

				const newSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: [],
						},
					},
				};
				mockMultichainClient.createSession.mockResolvedValue(newSessionData);

				const scopes = ["eip155:1"] as Scope[];
				const caipAccountIds = ["invalid-account-id", "eip155:1:0x1234567890abcdef1234567890abcdef12345678"] as any;

				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid CAIP account ID: "invalid-account-id"', t.expect.any(Error));
				t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
					optionalScopes: {
						"eip155:1": {
							methods: [],
							notifications: [],
							accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				});
				t.expect(result).toEqual(newSessionData);

				consoleErrorSpy.mockRestore();
			});

			t.it(`${platform} should return existing session when scopes don't overlap`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;

				const existingSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:137": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:137:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};
				mockMultichainClient.getSession.mockResolvedValue(existingSessionData);

				const scopes = ["eip155:137"] as Scope[]; // Different scope than existing session
				const caipAccountIds = ["eip155:137:0x1234567890abcdef1234567890abcdef12345678"] as any;

				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.createSession).not.toHaveBeenCalled();
				t.expect(mockMultichainClient.revokeSession).not.toHaveBeenCalled();
				t.expect(result).toEqual(existingSessionData);
			});

			t.it(`should ${platform} simulate sesion upgrade by adding new session scopes to connect`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;

				const existingSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};

				const newSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};

				mockMultichainClient.getSession.mockResolvedValue(existingSessionData);
				mockMultichainClient.createSession.mockResolvedValue(newSessionData);

				const scopes = ["eip155:137"] as Scope[]; // Same scope as existing session
				const caipAccountIds = ["eip155:137:0x1234567890abcdef1234567890abcdef12345678"] as any;

				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(mockMultichainClient.getSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.revokeSession).toHaveBeenCalled();
				t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
					optionalScopes: {
						"eip155:137": {
							methods: [],
							notifications: [],
							accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				});
				t.expect(result).toEqual(newSessionData);
			});

			t.it(`${platform} should handle multiple scopes and accounts correctly`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				const newSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
						"eip155:137": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:137:0x9876543210fedcba9876543210fedcba98765432"],
						},
					},
				};
				mockMultichainClient.createSession.mockResolvedValue(newSessionData);

				const scopes = ["eip155:1", "eip155:137"] as Scope[];
				const caipAccountIds = ["eip155:1:0x1234567890abcdef1234567890abcdef12345678", "eip155:137:0x9876543210fedcba9876543210fedcba98765432"] as any;

				const result = await sdk.connect(scopes, caipAccountIds);

				t.expect(mockMultichainClient.createSession).toHaveBeenCalledWith({
					optionalScopes: {
						"eip155:1": {
							methods: [],
							notifications: [],
							accounts: ["0x1234567890abcdef1234567890abcdef12345678"],
						},
						"eip155:137": {
							methods: [],
							notifications: [],
							accounts: ["0x9876543210fedcba9876543210fedcba98765432"],
						},
					},
				});
				t.expect(result).toEqual(newSessionData);
			});

			t.it(`${platform} should handle transport connection errors`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;

				// Reset the transport mock to simulate connection failure
				mockTransport.isConnected = false;
				const connectionError = new Error("Failed to connect transport");
				mockTransport.connect.mockRejectedValue(connectionError);

				const scopes = ["eip155:1"] as Scope[];
				const caipAccountIds = ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"] as any;

				await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow("Failed to connect transport");
			});

			t.it(`${platform} should handle session creation errors`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;
				mockMultichainClient.getSession.mockResolvedValue(undefined);

				const sessionError = new Error("Failed to create session");
				mockMultichainClient.createSession.mockRejectedValue(sessionError);

				const scopes = ["eip155:1"] as Scope[];
				const caipAccountIds = ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"] as any;

				await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow("Failed to create session");
			});

			t.it(`${platform} should handle session revocation errors`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockTransport.isConnected = true;

				const existingSessionData = {
					...mockSessionData,
					sessionScopes: {
						"eip155:1": {
							methods: ["eth_sendTransaction"],
							notifications: ["accountsChanged"],
							accounts: ["eip155:1:0x1234567890abcdef1234567890abcdef12345678"],
						},
					},
				};

				mockMultichainClient.getSession.mockResolvedValue(existingSessionData);

				const revocationError = new Error("Failed to revoke session");
				mockMultichainClient.revokeSession.mockRejectedValue(revocationError);

				const scopes = ["eip155:137"] as Scope[]; // Same scope as existing session to trigger revocation
				const caipAccountIds = ["eip155:137:0x1234567890abcdef1234567890abcdef12345678"] as any;
				await t.expect(sdk.connect(scopes, caipAccountIds)).rejects.toThrow("Failed to revoke session");
			});
		});

		t.describe(`${platform} disconnect method tests`, () => {
			t.beforeEach(async () => {
				sdk = await createSDK(options);
			});

			t.it(`${platform} should disconnect transport successfully`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;

				mockTransport.disconnect.mockResolvedValue(undefined);

				await sdk.disconnect();

				t.expect(mockTransport.disconnect).toHaveBeenCalled();
			});

			t.it(`${platform} should handle disconnect errors`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockTransport = (multichainModule as any).__mockTransport;

				const disconnectError = new Error("Failed to disconnect transport");
				mockTransport.disconnect.mockRejectedValue(disconnectError);

				await t.expect(sdk.disconnect()).rejects.toThrow("Failed to disconnect transport");
			});
		});

		t.describe(`${platform} onNotification method tests`, () => {
			t.beforeEach(async () => {
				sdk = await createSDK(options);
			});

			t.it(`${platform} should register notification listener`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				const mockListener = t.vi.fn();
				const mockUnsubscribe = t.vi.fn();
				mockMultichainClient.onNotification.mockReturnValue(mockUnsubscribe);

				const unsubscribe = sdk.onNotification(mockListener);

				t.expect(mockMultichainClient.onNotification).toHaveBeenCalledWith(mockListener);
				t.expect(unsubscribe).toBe(mockUnsubscribe);
			});
		});

		t.describe(`${platform} revokeSession method tests`, () => {
			t.beforeEach(async () => {
				sdk = await createSDK(options);
			});

			t.it(`${platform} should revoke session successfully`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				mockMultichainClient.revokeSession.mockResolvedValue(undefined);

				await sdk.revokeSession();

				t.expect(mockMultichainClient.revokeSession).toHaveBeenCalled();
			});

			t.it(`${platform} should handle revoke session errors`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				const revokeError = new Error("Failed to revoke session");
				mockMultichainClient.revokeSession.mockRejectedValue(revokeError);

				await t.expect(sdk.revokeSession()).rejects.toThrow("Failed to revoke session");
			});
		});

		t.describe(`${platform} invokeMethod method tests`, () => {
			t.beforeEach(async () => {
				sdk = await createSDK(options);
			});

			t.it(`${platform} should invoke method successfully`, async () => {
				// Get mocks from the module mock
				const multichainModule = await import("@metamask/multichain-api-client");
				const mockMultichainClient = (multichainModule as any).__mockMultichainClient;

				// Mock the RPCClient response
				const mockResponse = { result: "success" };

				// We need to mock the invokeMethod on the rpcClient
				// Since rpcClient is private, we'll access it through the sdk instance
				const mockRpcClient = {
					invokeMethod: t.vi.fn().mockResolvedValue(mockResponse),
				};

				// Replace the rpcClient in the sdk instance
				(sdk as any).rpcClient = mockRpcClient;

				const options = {
					scope: "eip155:1",
					method: "eth_accounts",
					params: [],
				} as any;

				const result = await sdk.invokeMethod(options);

				t.expect(mockRpcClient.invokeMethod).toHaveBeenCalledWith(options);
				t.expect(result).toEqual(mockResponse);
			});

			t.it(`${platform} should handle invoke method errors`, async () => {
				// Mock the RPCClient response
				const mockError = new Error("Failed to invoke method");

				// We need to mock the invokeMethod on the rpcClient
				const mockRpcClient = {
					invokeMethod: t.vi.fn().mockRejectedValue(mockError),
				};

				// Replace the rpcClient in the sdk instance
				(sdk as any).rpcClient = mockRpcClient;

				const options = {
					scope: "eip155:1",
					method: "eth_accounts",
					params: [],
				} as any;

				await t.expect(sdk.invokeMethod(options)).rejects.toThrow("Failed to invoke method");
			});
		});
	});
}

t.describe("MultichainSDK", () => {
	createMultiplatformTestCase(
		"web",
		{
			dapp: {
				name: "Test Dapp",
				url: "https://test.dapp",
			},
			analytics: {
				enabled: false,
			},
			ui: {
				headless: false,
			},
		},
		createMetamaskSDKWeb,
		(nativeStorageStub) => {
			const dom = new Page("<!DOCTYPE html><p>Hello world</p>", { url: "https://dapp.io/" });
			const globalStub = {
				...dom.window,
				addEventListener: t.vi.fn(),
				removeEventListener: t.vi.fn(),
				localStorage: nativeStorageStub,
			};
			t.vi.stubGlobal("navigator", {
				...dom.window.navigator,
				product: "Chrome",
			});
			t.vi.stubGlobal("window", globalStub);
			t.vi.stubGlobal("location", dom.window.location);
		},
	);
});
