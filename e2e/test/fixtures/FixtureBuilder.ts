/**
 * FixtureBuilder class provides a fluent interface for building fixture data.
 */
export class FixtureBuilder {
  fixture:
    | {
        state: {
          collectibles: {
            favorites: Record<string, unknown>;
          };
          engine: {
            backgroundState: {
              AccountTrackerController: {
                accounts: {
                  [address: string]: {
                    balance: string;
                  };
                };
                _U: number;
                _V: number;
                _X: null;
              };
              AddressBookController: {
                addressBook: Record<string, unknown>;
              };
              AssetsContractController: Record<string, unknown>;
              NftController: {
                allNftContracts: Record<string, unknown>;
                allNfts: Record<string, unknown>;
                ignoredNfts: [];
              };
              TokenListController: {
                tokenList: {
                  [address: string]: {
                    address: string;
                    symbol: string;
                    decimals: number;
                    name: string;
                    iconUrl: string;
                    type: string;
                    aggregators: string[];
                    occurrences: number;
                    fees: {
                      [address: string]: number;
                    };
                  };
                };
                tokensChainsCache: Record<string, unknown>;
                preventPollingOnNetworkRestart: boolean;
              };
              CurrencyRateController: {
                conversionDate: number;
                conversionRate: number;
                nativeCurrency: string;
                currentCurrency: string;
                pendingCurrentCurrency: null;
                pendingNativeCurrency: null;
                usdConversionRate: number;
              };
              KeyringController: {
                vault: string;
                keyrings: {
                  accounts: string[];
                  index: number;
                  type: string;
                }[];
              };
              NetworkController: {
                network: string;
                isCustomNetwork: boolean;
                providerConfig: {
                  type: string;
                  chainId: string;
                };
                networkDetails: {
                  isEIP1559Compatible: boolean;
                };
              };
              PhishingController: {
                listState: {
                  allowlist: [];
                  fuzzylist: string[];
                  version: number;
                  name: string;
                  tolerance: number;
                  lastUpdated: number;
                };
                whitelist: [];
                hotlistLastFetched: number;
                stalelistLastFetched: number;
              };
              PreferencesController: {
                featureFlags: Record<string, unknown>;
                frequentRpcList: {
                  rpcUrl: string;
                  chainId: string;
                  ticker: string;
                  nickname: string;
                }[];
                identities: {
                  [address: string]: {
                    address: string;
                    name: string;
                    importTime: number;
                  };
                };
                ipfsGateway: string;
                lostIdentities: Record<string, unknown>;
                selectedAddress: string;
                useTokenDetection: boolean;
                useNftDetection: boolean;
                displayNftMedia: boolean;
                isMultiAccountBalancesEnabled: boolean;
                disabledRpcMethodPreferences: {
                  eth_sign: boolean;
                };
                showTestNetworks: boolean;
                _U: number;
                _V: number;
                _W: {
                  featureFlags: Record<string, unknown>;
                  frequentRpcList: [];
                  identities: {
                    [address: string]: {
                      address: string;
                      name: string;
                      importTime: number;
                    };
                  };
                  ipfsGateway: string;
                  lostIdentities: Record<string, unknown>;
                  selectedAddress: string;
                  useTokenDetection: boolean;
                  useNftDetection: boolean;
                  displayNftMedia: boolean;
                  isMultiAccountBalancesEnabled: boolean;
                  disabledRpcMethodPreferences: {
                    eth_sign: boolean;
                  };
                  showTestNetworks: boolean;
                  showIncomingTransactions: {
                    [chainId: string]: boolean;
                  };
                };
                _X: null;
              };
              TokenBalancesController: {
                contractBalances: Record<string, unknown>;
              };
              TokenRatesController: {
                contractExchangeRates: Record<string, unknown>;
              };
              TokensController: {
                tokens: [];
                ignoredTokens: [];
                detectedTokens: [];
                allTokens: Record<string, unknown>;
                allIgnoredTokens: Record<string, unknown>;
                allDetectedTokens: Record<string, unknown>;
              };
              TransactionController: {
                methodData: Record<string, unknown>;
                transactions: [];
                internalTransactions: [];
                swapsTransactions: Record<string, unknown>;
              };
              SwapsController: {
                quotes: Record<string, unknown>;
                quoteValues: Record<string, unknown>;
                fetchParams: {
                  slippage: number;
                  sourceToken: string;
                  sourceAmount: number;
                  destinationToken: string;
                  walletAddress: string;
                };
                fetchParamsMetaData: {
                  sourceTokenInfo: {
                    decimals: number;
                    address: string;
                    symbol: string;
                  };
                  destinationTokenInfo: {
                    decimals: number;
                    address: string;
                    symbol: string;
                  };
                };
                topAggSavings: null;
                aggregatorMetadata: null;
                tokens: null;
                topAssets: null;
                approvalTransaction: null;
                aggregatorMetadataLastFetched: number;
                quotesLastFetched: number;
                topAssetsLastFetched: number;
                error: {
                  key: null;
                  description: null;
                };
                topAggId: null;
                tokensLastFetched: number;
                isInPolling: boolean;
                pollingCyclesLeft: number;
                quoteRefreshSeconds: null;
                usedGasEstimate: null;
                usedCustomGas: null;
                chainCache: {
                  [chainId: string]: {
                    aggregatorMetadata: null;
                    tokens: null;
                    topAssets: null;
                    aggregatorMetadataLastFetched: number;
                    topAssetsLastFetched: number;
                    tokensLastFetched: number;
                  };
                };
              };
              GasFeeController: {
                gasFeeEstimates: Record<string, unknown>;
                estimatedGasFeeTimeBounds: Record<string, unknown>;
                gasEstimateType: string;
              };
              TokenDetectionController: Record<string, unknown>;
              NftDetectionController: Record<string, unknown>;
              PermissionController: {
                subjects: Record<string, unknown>;
              };
              ApprovalController: {
                pendingApprovals: Record<string, unknown>;
                pendingApprovalCount: number;
                approvalFlows: [];
              };
            };
          };
          privacy: {
            approvedHosts: Record<string, unknown>;
            revealSRPTimestamps: [];
          };
          bookmarks: [];
          browser: {
            history: [];
            whitelist: [];
            tabs: {
              url: string;
              id: number;
            }[];
            activeTab: number;
          };
          modals: {
            networkModalVisible: boolean;
            shouldNetworkSwitchPopToWallet: boolean;
            collectibleContractModalVisible: boolean;
            receiveModalVisible: boolean;
            dappTransactionModalVisible: boolean;
            signMessageModalVisible: boolean;
          };
          settings: {
            searchEngine: string;
            primaryCurrency: string;
            lockTime: number;
            useBlockieIcon: boolean;
            hideZeroBalanceTokens: boolean;
          };
          alert: {
            isVisible: boolean;
            autodismiss: null;
            content: null;
            data: null;
          };
          transaction: {
            selectedAsset: Record<string, unknown>;
            transaction: Record<string, unknown>;
          };
          user: {
            loadingMsg: string;
            loadingSet: boolean;
            passwordSet: boolean;
            seedphraseBackedUp: boolean;
            backUpSeedphraseVisible: boolean;
            protectWalletModalVisible: boolean;
            gasEducationCarouselSeen: boolean;
            userLoggedIn: boolean;
            isAuthChecked: boolean;
            initialScreen: string;
            appTheme: string;
          };
          wizard: {
            step: number;
          };
          onboarding: {
            events: [];
          };
          notification: {
            notifications: [];
          };
          swaps: {
            1: {
              isLive: boolean;
            };
            isLive: boolean;
            hasOnboarded: boolean;
          };
          fiatOrders: {
            orders: [];
            customOrderIds: [];
            networks: {
              active: boolean;
              chainId: number;
              chainName: string;
              shortName: string;
              nativeTokenSupported: boolean;
            }[];
            selectedRegionAgg: null;
            selectedPaymentMethodAgg: null;
            getStartedAgg: boolean;
            authenticationUrls: [];
            activationKeys: [];
          };
          infuraAvailability: {
            isBlocked: boolean;
          };
          navigation: {
            currentRoute: string;
            currentBottomNavRoute: string;
          };
          networkOnboarded: {
            networkOnboardedState: Record<string, unknown>;
            networkState: {
              showNetworkOnboarding: boolean;
              nativeToken: string;
              networkType: string;
              networkUrl: string;
            };
            switchedNetwork: {
              networkUrl: string;
              networkStatus: boolean;
            };
          };
          security: {
            allowLoginWithRememberMe: boolean;
            automaticSecurityChecksEnabled: boolean;
            hasUserSelectedAutomaticSecurityCheckOption: boolean;
            isAutomaticSecurityChecksModalOpen: boolean;
          };
          experimentalSettings: {
            securityAlertsEnabled: boolean;
          };
        };
        asyncState: {
          '@MetaMask:existingUser': string;
          '@MetaMask:onboardingWizard': string;
          '@MetaMask:UserTermsAcceptedv1.0': string;
          '@MetaMask:WhatsNewAppVersionSeen': string;
        };
      }
    | undefined;

  constructor() {
    this.withDefaultFixture();
  }

  withDefaultFixture() {
    this.fixture = {
      state: {
        collectibles: {
          favorites: {},
        },
        engine: {
          backgroundState: {
            AccountTrackerController: {
              accounts: {
                '0xb0211940962A776CCd41FE1092fDe46c7e667e6b': {
                  balance: '0x0',
                },
              },
              _U: 0,
              _V: 1,
              _X: null,
            },
            AddressBookController: {
              addressBook: {},
            },
            AssetsContractController: {},
            NftController: {
              allNftContracts: {},
              allNfts: {},
              ignoredNfts: [],
            },
            TokenListController: {
              tokenList: {
                '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': {
                  address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
                  symbol: 'SNX',
                  decimals: 18,
                  name: 'Synthetix Network Token',
                  iconUrl:
                    'https://static.metafi.codefi.network/api/v1/tokenIcons/1/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f.png',
                  type: 'erc20',
                  aggregators: [
                    'Aave',
                    'Bancor',
                    'CMC',
                    'Crypto.com',
                    'CoinGecko',
                    '1inch',
                    'PMM',
                    'Synthetix',
                    'Zerion',
                    'Lifi',
                  ],
                  occurrences: 10,
                  fees: {
                    '0x5fd79d46eba7f351fe49bff9e87cdea6c821ef9f': 0,
                    '0xda4ef8520b1a57d7d63f1e249606d1a459698876': 0,
                  },
                },
              },
              tokensChainsCache: {},
              preventPollingOnNetworkRestart: false,
            },
            CurrencyRateController: {
              conversionDate: 1684232383.997,
              conversionRate: 1815.41,
              nativeCurrency: 'ETH',
              currentCurrency: 'usd',
              pendingCurrentCurrency: null,
              pendingNativeCurrency: null,
              usdConversionRate: 1815.41,
            },
            KeyringController: {
              vault:
                '{"cipher":"+IMrJYjZQ3XWUrCM5SeV5ayaA0ZygbaCV6ALW9gdirjl1GPsM9JAbrH0h4Gu/NSv4KzDpCzZMu1tVyyxkq62pu7Nx1/4YQU7wlTlbBuZz8keY/9ldkILILQvLKEzkOa/MPiHH7F77fvUnHKzMA960Y0VdcCN0MUKpNKaMoIHhnqJB2oUyh0HSz8/gRAkNJTFr5Rkjg+8I+o/O6cnvkS7rgL328U0+ZmBhBbEKdsCyfXuYw7JmFxAw/rPVOdgfJkISa9aJiGhagoBjZbF7g4pLNOj1xyOZtrzWgD4ZiG9cammcbvyJwlZvUZWgwOduprgnCHRckYN35tcOahuYxKtlyFG9LolYLV575FZmaxpE6n/yX5n1vUkJYFuoBF6+Ga+z0MbFGgu5clRwV5rjqBOOdZTIJqYjCFo2IrM9BzPJ/2dGSr7Siz4cEqyC85k32xb6hoqGdfoe3fn2NKJnuokN06cqiuNsZI7/sTeh0C0fd/imBu9nPNPX6zLLh3OreYj29YjXrvxY13uVq41X7Flbu4hAqJVzgq8jq1yWAj6mGQKGrqSfMonsrWZTvvdS+Qnvn3SJemWYJCaNsqGwg8117P/ZHqijlMeqB1Vnc6qg5meEe0i9YEMKZlwxfjEpVO6yw41LF2yfqVKsiK/4aPcqsFvMzv96ozGnjJ6Ko1HXQchWTVdgpHxzHfzGYjD2fJb/NCU9coUVDQ90P9MO5zk2VP0jOUwdYVTTIk9zh0Yenhbg81BbZOvjswHr/8XBkGSQz0kiXnAAR4Bn+suSHoPlDiEjh76wd6uJkv5BUGCHS3nTB9xggliqa7YEBof5MDAHnUyxIS5fwkxeksDgTYsffxGHd9qNqqU6mBqtl5oCecw1GVQSE0uHBKmz/2atYUe","iv":"5949f19153af04b74567967d8136a358","salt":"2rtO7xK++a3kHPrAeoofxA==","lib":"original"}',
              keyrings: [],
            },
            NetworkController: {
              network: '1',
              isCustomNetwork: false,
              providerConfig: {
                type: 'mainnet',
                chainId: '1',
              },
              networkDetails: {
                isEIP1559Compatible: true,
              },
            },
            PhishingController: {
              listState: {
                allowlist: [],
                fuzzylist: [],
                version: 2,
                name: 'MetaMask',
                tolerance: 1,
                lastUpdated: 1684231917,
              },
              whitelist: [],
              hotlistLastFetched: 1684231917,
              stalelistLastFetched: 1684231917,
            },
            PreferencesController: {
              featureFlags: {},
              frequentRpcList: [],
              identities: {
                '0xb0211940962A776CCd41FE1092fDe46c7e667e6b': {
                  address: '0xb0211940962A776CCd41FE1092fDe46c7e667e6b',
                  name: 'Account 1',
                  importTime: 1684232000456,
                },
              },
              ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
              lostIdentities: {},
              selectedAddress: '0xb0211940962A776CCd41FE1092fDe46c7e667e6b',
              useTokenDetection: true,
              useNftDetection: false,
              displayNftMedia: true,
              isMultiAccountBalancesEnabled: true,
              disabledRpcMethodPreferences: {
                eth_sign: false,
              },
              showTestNetworks: true,
              _U: 0,
              _V: 1,
              _W: {
                featureFlags: {},
                frequentRpcList: [],
                identities: {
                  '0xb0211940962A776CCd41FE1092fDe46c7e667e6b': {
                    address: '0xb0211940962A776CCd41FE1092fDe46c7e667e6b',
                    name: 'Account 1',
                    importTime: 1684232000456,
                  },
                },
                ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
                lostIdentities: {},
                selectedAddress: '0xb0211940962A776CCd41FE1092fDe46c7e667e6b',
                useTokenDetection: true,
                useNftDetection: false,
                displayNftMedia: true,
                isMultiAccountBalancesEnabled: true,
                disabledRpcMethodPreferences: {
                  eth_sign: false,
                },
                showTestNetworks: true,
                showIncomingTransactions: {
                  '0x1': true,
                  '0x5': true,
                  '0x38': true,
                  '0x61': true,
                  '0xa': true,
                  '0xa869': true,
                  '0x1a4': true,
                  '0x89': true,
                  '0x13881': true,
                  '0xa86a': true,
                  '0xfa': true,
                  '0xfa2': true,
                  '0xaa36a7': true,
                  '0xe704': true,
                  '0xe708': true,
                  '0x504': true,
                  '0x507': true,
                  '0x505': true,
                  '0x64': true,
                },
              },
              _X: null,
            },
            TokenBalancesController: {
              contractBalances: {},
            },
            TokenRatesController: {
              contractExchangeRates: {},
            },
            TokensController: {
              tokens: [],
              ignoredTokens: [],
              detectedTokens: [],
              allTokens: {},
              allIgnoredTokens: {},
              allDetectedTokens: {},
            },
            TransactionController: {
              methodData: {},
              transactions: [],
              internalTransactions: [],
              swapsTransactions: {},
            },
            SwapsController: {
              quotes: {},
              quoteValues: {},
              fetchParams: {
                slippage: 0,
                sourceToken: '',
                sourceAmount: 0,
                destinationToken: '',
                walletAddress: '',
              },
              fetchParamsMetaData: {
                sourceTokenInfo: {
                  decimals: 0,
                  address: '',
                  symbol: '',
                },
                destinationTokenInfo: {
                  decimals: 0,
                  address: '',
                  symbol: '',
                },
              },
              topAggSavings: null,
              aggregatorMetadata: null,
              tokens: null,
              topAssets: null,
              approvalTransaction: null,
              aggregatorMetadataLastFetched: 0,
              quotesLastFetched: 0,
              topAssetsLastFetched: 0,
              error: {
                key: null,
                description: null,
              },
              topAggId: null,
              tokensLastFetched: 0,
              isInPolling: false,
              pollingCyclesLeft: 3,
              quoteRefreshSeconds: null,
              usedGasEstimate: null,
              usedCustomGas: null,
              chainCache: {
                1: {
                  aggregatorMetadata: null,
                  tokens: null,
                  topAssets: null,
                  aggregatorMetadataLastFetched: 0,
                  topAssetsLastFetched: 0,
                  tokensLastFetched: 0,
                },
              },
            },
            GasFeeController: {
              gasFeeEstimates: {},
              estimatedGasFeeTimeBounds: {},
              gasEstimateType: 'none',
            },
            TokenDetectionController: {},
            NftDetectionController: {},
            PermissionController: {
              subjects: {},
            },
            ApprovalController: {
              pendingApprovals: {},
              pendingApprovalCount: 0,
              approvalFlows: [],
            },
          },
        },
        privacy: {
          approvedHosts: {},
          revealSRPTimestamps: [],
        },
        bookmarks: [],
        browser: {
          history: [],
          whitelist: [],
          tabs: [
            {
              url: 'https://home.metamask.io/',
              id: 1692550481062,
            },
          ],
          activeTab: 1692550481062,
        },
        modals: {
          networkModalVisible: false,
          shouldNetworkSwitchPopToWallet: true,
          collectibleContractModalVisible: false,
          receiveModalVisible: false,
          dappTransactionModalVisible: false,
          signMessageModalVisible: true,
        },
        settings: {
          searchEngine: 'DuckDuckGo',
          primaryCurrency: 'ETH',
          lockTime: 30000,
          useBlockieIcon: true,
          hideZeroBalanceTokens: false,
        },
        alert: {
          isVisible: false,
          autodismiss: null,
          content: null,
          data: null,
        },
        transaction: {
          selectedAsset: {},
          transaction: {},
        },
        user: {
          loadingMsg: '',
          loadingSet: false,
          passwordSet: true,
          seedphraseBackedUp: true,
          backUpSeedphraseVisible: false,
          protectWalletModalVisible: false,
          gasEducationCarouselSeen: false,
          userLoggedIn: true,
          isAuthChecked: false,
          initialScreen: '',
          appTheme: 'os',
        },
        wizard: {
          step: 0,
        },
        onboarding: {
          events: [],
        },
        notification: {
          notifications: [],
        },
        swaps: {
          1: {
            isLive: true,
          },
          isLive: true,
          hasOnboarded: false,
        },
        fiatOrders: {
          orders: [],
          customOrderIds: [],
          networks: [
            {
              active: true,
              chainId: 1,
              chainName: 'Ethereum Mainnet',
              shortName: 'Ethereum',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 10,
              chainName: 'Optimism Mainnet',
              shortName: 'Optimism',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 25,
              chainName: 'Cronos Mainnet',
              shortName: 'Cronos',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 56,
              chainName: 'BNB Chain Mainnet',
              shortName: 'BNB Chain',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 137,
              chainName: 'Polygon Mainnet',
              shortName: 'Polygon',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 250,
              chainName: 'Fantom Mainnet',
              shortName: 'Fantom',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 1284,
              chainName: 'Moonbeam Mainnet',
              shortName: 'Moonbeam',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 1285,
              chainName: 'Moonriver Mainnet',
              shortName: 'Moonriver',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 42161,
              chainName: 'Arbitrum Mainnet',
              shortName: 'Arbitrum',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 42220,
              chainName: 'Celo Mainnet',
              shortName: 'Celo',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 43114,
              chainName: 'Avalanche C-Chain Mainnet',
              shortName: 'Avalanche C-Chain',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 1313161554,
              chainName: 'Aurora Mainnet',
              shortName: 'Aurora',
              nativeTokenSupported: false,
            },
            {
              active: true,
              chainId: 1666600000,
              chainName: 'Harmony Mainnet (Shard 0)',
              shortName: 'Harmony  (Shard 0)',
              nativeTokenSupported: true,
            },
            {
              active: true,
              chainId: 11297108109,
              chainName: 'Palm Mainnet',
              shortName: 'Palm',
              nativeTokenSupported: false,
            },
            {
              active: true,
              chainId: 1337,
              chainName: 'Localhost',
              shortName: 'Localhost',
              nativeTokenSupported: true,
            },
            {
              active: false,
              chainId: 1,
              chainName: 'Tenderly',
              shortName: 'Tenderly',
              nativeTokenSupported: true,
            },
          ],
          selectedRegionAgg: null,
          selectedPaymentMethodAgg: null,
          getStartedAgg: false,
          authenticationUrls: [],
          activationKeys: [],
        },
        infuraAvailability: {
          isBlocked: false,
        },
        navigation: {
          currentRoute: 'AdvancedSettings',
          currentBottomNavRoute: 'Wallet',
        },
        networkOnboarded: {
          networkOnboardedState: {},
          networkState: {
            showNetworkOnboarding: false,
            nativeToken: '',
            networkType: '',
            networkUrl: '',
          },
          switchedNetwork: {
            networkUrl: '',
            networkStatus: false,
          },
        },
        security: {
          allowLoginWithRememberMe: false,
          automaticSecurityChecksEnabled: false,
          hasUserSelectedAutomaticSecurityCheckOption: true,
          isAutomaticSecurityChecksModalOpen: false,
        },
        experimentalSettings: {
          securityAlertsEnabled: false,
        },
      },
      asyncState: {
        '@MetaMask:existingUser': 'true',
        '@MetaMask:onboardingWizard': 'explored',
        '@MetaMask:UserTermsAcceptedv1.0': 'true',
        '@MetaMask:WhatsNewAppVersionSeen': '6.5.0',
      },
    };
    return this;
  }

  /**
   * Build and return the fixture object.
   * @returns {Object} - The built fixture object.
   */
  build(): Record<string, unknown> {
    return this.fixture as Record<string, unknown>;
  }
}
