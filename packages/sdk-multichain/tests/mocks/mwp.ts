

// t.vi.mock('@metamask/mobile-wallet-protocol-core', async () => {
//   const {SessionStore, ...actual} = await import('@metamask/mobile-wallet-protocol-core');
//   let store = new Map<string, string>();
//   return {
//     ...actual,
//     get SessionStore() {
//       const storageProps = {

//         get: t.vi.fn(() => Promise.resolve(store.get('session') ?? null)),
//         set: t.vi.fn((key: string, value: string) => {
//           store.set(key, value)
//           return  Promise.resolve()
//         }),
//         delete: t.vi.fn((key) => {
//           store.delete(key)
//           return Promise.resolve()
//         }),
//       }
//       const instance = new SessionStore(storageProps)
//       return instance;
//     },
//     __mockSessionStore: SessionStore,
//     __mockStorage: store,
//   }
// })


// t.vi.mock('../../src/multichain/transports/mwp');




import * as t from 'vitest';

type PendingRequests = {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

t.vi.mock('../../src/multichain/transports/mwp', async (importOriginal) => {
  const {
    MWPTransport
  } = await importOriginal<typeof import('../../src/multichain/transports/mwp')>();

  // Create a mock Map to store pending requests
  const mockPendingRequestsMap = new Map<string, PendingRequests>();

  // Create a mock class that extends the original MWPTransport
  class MockMWPTransport extends MWPTransport {
    private __mockPendingRequests = mockPendingRequestsMap;

    get pendingRequests() {
      return this.__mockPendingRequests;
    }

    set pendingRequests(pendingRequests: Map<string, PendingRequests>) {
      this.__mockPendingRequests = pendingRequests;
    }
  }

  return {
    MWPTransport: MockMWPTransport,
    __mockPendingRequestsMap: mockPendingRequestsMap
  };
});
