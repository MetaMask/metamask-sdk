export enum CAIP294EventNames {
  Announce = 'caip294:wallet_announce',
  Request = 'caip294:wallet_prompt',
}

export interface CAIP294ProviderInfo {
  providerId: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface CAIP294ProviderDetail {
  info: CAIP294ProviderInfo;
  provider: unknown;
}

export interface WalletInfo {
  name: string;
  icon: string;
  rdns: string;
  providerId: string;
}

export interface WalletDiscoveryOptions {
  timeout?: number;
  filterPredicate?: (wallet: WalletInfo) => boolean;
}

interface CAIP294AnnounceParams {
  name: string;
  icon: string;
  rdns: string;
  uuid: string;
  extensionId?: string;
}

interface CAIP294AnnounceEvent {
  id: number;
  jsonrpc: string;
  method: string;
  params: CAIP294AnnounceParams;
}

export function discoverWallets(options: WalletDiscoveryOptions = {}): Promise<WalletInfo[]> {
  const {
    timeout = 500,
    filterPredicate = () => true,
  } = options;

  console.log('discoverWallets', options);
  return new Promise((resolve, reject) => {
    const discoveredWallets: WalletInfo[] = [];

    const handleAnnouncement = (event: Event) => {
      const customEvent = event as CustomEvent;
      const params = customEvent.detail.params;

      if (params) {
        const walletInfo: WalletInfo = {
          name: params.name,
          icon: params.icon,
          rdns: params.rdns,
          providerId: params.extensionId || params.uuid,
        };

        if (filterPredicate(walletInfo)) {
          discoveredWallets.push(walletInfo);
        }
      }
    };

    window.addEventListener(CAIP294EventNames.Announce, handleAnnouncement);

    window.dispatchEvent(new CustomEvent(CAIP294EventNames.Request, {
      detail: {
        id: 1,
        jsonrpc: '2.0',
        method: 'wallet_prompt',
        params: {},
      },
    }));

    const timeoutId = setTimeout(() => {
      window.removeEventListener(CAIP294EventNames.Announce, handleAnnouncement);
      resolve(discoveredWallets);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener(CAIP294EventNames.Announce, handleAnnouncement);
    };
  });
}

// Utility functions for common filtering scenarios
export const walletFilters = {
  isMetaMask: (wallet: WalletInfo) =>
    wallet.name.toLowerCase().includes('metamask'),

  byName: (name: string) => (wallet: WalletInfo) =>
    wallet.name.toLowerCase().includes(name.toLowerCase()),

  byRdns: (rdns: string) => (wallet: WalletInfo) =>
    wallet.rdns === rdns,
};
