import * as t from 'vitest';

import { SessionRequest, SessionStore } from '@metamask/mobile-wallet-protocol-core';
import { DappClient } from '@metamask/mobile-wallet-protocol-dapp-client';
import { Transport, SessionData } from '@metamask/multichain-api-client';
import { MultichainOptions, MultichainCore } from '../src/domain';
import { MultichainSDK } from '../src/multichain';

type GetItem = (key: string) => string | null;
type SetItem = (key: string, value: string) => void;
type RemoveItem = (key: string) => void;
type Clear = () => void;

export type NativeStorageStub = {
	data: Map<string, string>;
	getItem: t.Mock<GetItem>;
	setItem: t.Mock<SetItem>;
	removeItem: t.Mock<RemoveItem>;
	clear: t.Mock<Clear>;
};

export type MockedData = {
	initSpy: t.MockInstance<MultichainSDK['init']>;
	setupAnalyticsSpy: t.MockInstance<MultichainSDK['setupAnalytics']>;
	emitSpy: t.MockInstance<MultichainSDK['emit']>;
	showInstallModalSpy: t.MockInstance<any>;
	nativeStorageStub: NativeStorageStub;

	mockDappClient: t.Mocked<DappClient>;
	mockDefaultTransport: t.Mocked<any>;
	mockLogger: t.MockInstance<debug.Debugger>;

	// Mocking RPC method responses for all transports
	mockWalletGetSession: t.MockInstance<(request: any) => SessionData>;
	mockWalletCreateSession: t.MockInstance<(request: any) => SessionData>;
	mockWalletRevokeSession: t.MockInstance<(request: any) => void>;
	mockWalletInvokeMethod: t.MockInstance<(request: any) => void>;

	// Mocking MWP session request
	mockSessionRequest: t.MockInstance<() => SessionRequest>;
};

export type TestSuiteOptions<T extends MultichainOptions> = {
	platform: string;
	createSDK: Options<T>['createSDK'];
	options: Options<T>['options'];
	beforeEach: () => Promise<MockedData>;
	afterEach: (mocks: MockedData) => Promise<void>;
	storage: NativeStorageStub;
};

export type Options<T extends MultichainOptions> = {
	platform: 'web' | 'node' | 'rn' | 'web-mobile';
	options: T;
	createSDK: (options: T) => Promise<MultichainCore>;
	setupMocks?: (options: NativeStorageStub) => void;
	cleanupMocks?: () => void;
	tests: (options: TestSuiteOptions<T>) => void;
};

export type CreateTestFN = <T extends MultichainOptions>(options: Options<T>) => void;
