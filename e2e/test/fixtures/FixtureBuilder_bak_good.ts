// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from 'lodash';

function getGanachePort() {
  return process.env.GANACHE_PORT || '8545';
}

/**
 * FixtureBuilder class provides a fluent interface for building fixture data.
 */
export class FixtureBuilder {
  fixture: any;

  constructor() {
    this.withDefaultFixture();
  }

  withDefaultFixture() {
    this.fixture = {
      state: {
        _persist: {
          rehydrated: true,
          version: 1,
        },
        experimentalSettings: {
          securityAlertsEnabled: true,
        },
        engine: {
          backgroundState: {
            LoggingController: {
              logs: {},
            },
            ApprovalController: {
              approvalFlows: [],
              pendingApprovalCount: 0,
              pendingApprovals: {},
            },
            PermissionController: {
              subjects: {},
            },
            NotificationServicesController: {
              isFetchingMetamaskNotifications: false,
              isUpdatingMetamaskNotifications: false,
              metamaskNotificationsReadList: [],
              metamaskNotificationsList: [],
              isFeatureAnnouncementsEnabled: false,
              isMetamaskNotificationsFeatureSeen: false,
              isNotificationServicesEnabled: false,
              isCheckingAccountsPresence: false,
              isUpdatingMetamaskNotificationsAccount: [],
              subscriptionAccountsSeen: [],
            },
            UserStorageController: {
              isProfileSyncingUpdateLoading: false,
              isProfileSyncingEnabled: true,
            },
            PreferencesController: {
              useTransactionSimulations: true,
              smartTransactionsOptInStatus: false,
              useSafeChainsListValidation: true,
              useTokenDetection: true,
              showTestNetworks: false,
              disabledRpcMethodPreferences: {
                eth_sign: false,
              },
              showIncomingTransactions: {
                '0x507': true,
                '0xe708': true,
                '0xe704': true,
                '0xaa36a7': true,
                '0xfa2': true,
                '0x64': true,
                '0x505': true,
                '0xa86a': true,
                '0x38': true,
                '0x13881': true,
                '0x504': true,
                '0x89': true,
                '0xfa': true,
                '0xaa37dc': true,
                '0xa869': true,
                '0xa': true,
                '0xe705': true,
                '0x5': true,
                '0x61': true,
                '0x1': true,
              },
              selectedAddress: '0x6354fC52eE3f852A6470FDcFc2248d44910835E2',
              securityAlertsEnabled: true,
              displayNftMedia: true,
              lostIdentities: {},
              ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
              isMultiAccountBalancesEnabled: true,
              isIpfsGatewayEnabled: true,
              useNftDetection: true,
              identities: {
                '0x6354fC52eE3f852A6470FDcFc2248d44910835E2': {
                  importTime: 1725390448603,
                  address: '0x6354fC52eE3f852A6470FDcFc2248d44910835E2',
                  name: 'Account 1',
                },
              },
              featureFlags: {},
            },
            NftDetectionController: {},
            SnapController: {},
            TokenDetectionController: {},
            GasFeeController: {
              estimatedGasFeeTimeBounds: {},
              nonRPCGasFeeApisDisabled: false,
              gasEstimateType: 'none',
              gasFeeEstimates: {},
              gasFeeEstimatesByChainId: {},
            },
            SwapsController: {
              chainCache: {
                '0x1': {
                  tokensLastFetched: 0,
                  topAssetsLastFetched: 0,
                  aggregatorMetadataLastFetched: 0,
                  aggregatorMetadata: null,
                  topAssets: null,
                  tokens: null,
                },
              },
              usedGasEstimate: null,
              quoteRefreshSeconds: null,
              pollingCyclesLeft: 3,
              isInPolling: false,
              topAssetsLastFetched: 0,
              aggregatorMetadataLastFetched: 0,
              quotes: {},
              approvalTransaction: null,
              usedCustomGas: null,
              quotesLastFetched: 0,
              topAggId: null,
              topAssets: null,
              aggregatorMetadata: null,
              topAggSavings: null,
              quoteValues: {},
              error: {
                description: null,
                key: null,
              },
              fetchParamsMetaData: {
                destinationTokenInfo: {
                  symbol: '',
                  address: '',
                  decimals: 0,
                },
                sourceTokenInfo: {
                  symbol: '',
                  address: '',
                  decimals: 0,
                },
              },
              fetchParams: {
                walletAddress: '',
                sourceAmount: 0,
                sourceToken: '',
                destinationToken: '',
                slippage: 0,
              },
              tokensLastFetched: 0,
              tokens: null,
            },
            TransactionController: {
              submitHistory: [],
              lastFetchedBlockNumbers: {},
              transactions: [],
              methodData: {},
            },
            CurrencyRateController: {
              currentCurrency: 'usd',
              currencyRates: {
                ETH: {
                  usdConversionRate: 2458.64,
                  conversionRate: 2458.64,
                  conversionDate: 1725390421.808,
                },
              },
            },
            TokensController: {
              allTokens: {},
              detectedTokens: [],
              allDetectedTokens: {},
              ignoredTokens: [],
              allIgnoredTokens: {},
              tokens: [],
            },
            TokenBalancesController: {
              contractBalances: {},
            },
            AuthenticationController: {
              sessionData: {
                accessToken:
                  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZiMjgwZGQzLTQ0ZjUtNDJmYi1hM2ZjLTA3YTI4MzBiZjJiZCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9vaWRjLmFwaS5jeC5tZXRhbWFzay5pby9vYXV0aDIvdG9rZW4iXSwiY2xpZW50X2lkIjoiNzVmYTYyYTMtOWNhMC00YjkxLTlmZTUtNzZiZWM4NmIwMjU3IiwiZXhwIjoxNzI1Mzk0MDc4LCJleHQiOnt9LCJpYXQiOjE3MjUzOTA0NzgsImlzcyI6Imh0dHBzOi8vb2lkYy5hcGkuY3gubWV0YW1hc2suaW8iLCJqdGkiOiJkYTliNmQyMi03OWMyLTQ2NTItYmVhMi1hZmVkNDhlMjE4ZTEiLCJuYmYiOjE3MjUzOTA0NzgsInNjcCI6W10sInN1YiI6IjdiMDlkMjEzLTBhMWQtNDNiYy1iZGUwLWFlZTI1MDM2YTJjYyJ9.iENaAz-Rl8bt4T4OtmbdRol6BSYEQ4opnKESV3_iK_MYVAbb_r5A6HHBLe5PDkmgXKZpwSnfb9gzzz9e3h-FtlmaxV1QyHQIJ-v6Q3G00YrhwyzB68irjjYy6yE8vumRQCC2lS0cccC2dv8bOcP0jxaaAvi7uwxWuvU1MEtwA2Y9f08XWB6LTp_S_lnaxI6HvXSGas_KWUyhIAAbZ3mVvHIG7dw5_k-wL7MQZJeuEAO2lfaxdN6xXADzdVATZ86pGiqogVll9HDmbVfVj5JuWjpQtOEdvr0HcWaawjrJQE9cbJPHHdO1hij9r500wvx4FpdSPsxLID_7t4BmR9NbwEBbIt69zPxcx6hc4m8zdvW8z-dsCpibJqwmP92F4fwZhHHOFneT7JP5StDKQioku0McJND5GtISsMiezK-KxOf6uZLbFSQ5k0fTLmZCr31dl71P77PEyGLDp62NHhzXw2tT5EzAZ3bUQezd3292D_amtRQKGeYwBKpQqJqxbMimr7-K0XtUW9ikzaMTgLLF1LDfDeMfaKjxL3Pfyas_W8t2jZE4sRkmeKn8yaQSeG0cwrvL_1sBXylww_J06U1pfGfVabD5m10NElLXNJiDLwSsVFVU6CNB2ezlghO2H0PgUoC-6EL-HO5ALaGnT_7RJh0MaPv1qS_CtevvpqxM8MY',
                expiresIn: 'Tue Sep 03 2024 20:38:00 GMT+0100',
                profile: {
                  profileId: '7b09d213-0a1d-43bc-bde0-aee25036a2cc',
                  identifierId:
                    '8750cbf391b39b6d5deb99934d01b398cad7bc21519d12a51da4ea30a3a35dfa',
                },
              },
              isSignedIn: true,
            },
            PPOMController: {
              storageMetadata: [],
              versionInfo: [],
            },
            KeyringController: {
              vault:
                '{"cipher":"LxukZhvitBqDHqJ13nmrYzowuI/LzE67dhpshEqmOQ4tnxuvnlS2bTet8eznfQpzdnJZ3XwmZmhL7cZXjOGF+xIotbyRSAWFUgvf6Z/WoPWqWSDYxQvliEKZgi/Qy4LXUCg6jbN8AThxb528oC9rROmiJYe1JrTEZ1/TciyDKDIKl7ULjthFk8fDhKV6hVeysGtIvmJV0Z4+twg+DhiKS20i+lzgPiAqrH+103E38vGtaNVnoYvYQtkJy2kbFkUppmukfx6jpI2NdPnBev0C4qSvw+CxngP7Re7HYAeWAJvDUmYGPeM5w9jaWfAGCL2oWInDVXA1ATyixlXr5kQpkKwzH3BjXFlg1CDkpg0nsvQeshlj+qqzVSzlgEN/VYYFG5V5FvZS7snxKy/eJDfdghnCeTWbc24hz36FHdW0WqzoZeId31sYSAvau8n6SZEaSjmkxGlGkjs2MHsc9Yi1QvDB01Kkg30w16vymZeQ1+SEoLIXYkVshcaSrvTXFVglmzU9yBfNX4h3W1OcQcfBX569X/3WkQg4CCxhMVObeTISD2a+K/Ck3Q7nQpcMQY5i/usA/AXw32cn9Gc0d4DRom/+1iy4JgTVmb2MNp0LjUpKCf52BEnqE9RY0Lw4Yf+AMZrG7W4z28PshNx6oSLcZZPZthynW2w1YfUzYLnU4AYU+wc3I10m1d9zv5/wqlg7LPVRg2BqpQshBT2mHLnZ7rJGUqJ3DZR+46/ypokJteRZ4PwEA/+ijVlDMLxczbZB/lN+Azl8ZU/9O3tNmmKNPR/04u9ZM1WHaZATNM41zdrQ5M4bHZ7C9ETSFM1qBjKgSkVggJ+9me6p8X2DCLaA5AFdddjdKkLNJBDixjeenv/IJW76KW7vZ5UGCdf1srJX","iv":"629963ba022c2fe8f9441abea420432c","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":5000}},"lib":"original","salt":"hzdebnDIBPCmeGwd3M6hmw=="}',
              keyrings: [
                {
                  accounts: ['0x6354fc52ee3f852a6470fdcfc2248d44910835e2'],
                  type: 'HD Key Tree',
                },
                {
                  accounts: [],
                  type: 'QR Hardware Wallet Device',
                },
              ],
              isUnlocked: true,
            },
            PhishingController: {
              stalelistLastFetched: 0,
              hotlistLastFetched: 0,
              whitelist: [],
              phishingLists: [],
            },
            AddressBookController: {
              addressBook: {},
            },
            TokenListController: {
              preventPollingOnNetworkRestart: false,
            },
            NftController: {
              ignoredNfts: [],
              allNfts: {},
              allNftContracts: {},
            },
            NetworkController: {
              networkConfigurations: {},
              networksMetadata: {
                mainnet: {
                  EIPS: {
                    '1559': true,
                  },
                  status: 'available',
                },
              },
              providerConfig: {
                ticker: 'ETH',
                chainId: '0x1',
                type: 'mainnet',
              },
              selectedNetworkClientId: 'mainnet',
            },
            SmartTransactionsController: {
              smartTransactionsState: {
                feesByChainId: {
                  '0xaa36a7': {},
                  '0x1': {},
                },
                livenessByChainId: {
                  '0xaa36a7': true,
                  '0x1': true,
                },
                liveness: true,
                fees: {},
                smartTransactions: {
                  '0x1': [],
                },
              },
            },
            AccountsController: {
              internalAccounts: {
                selectedAccount: 'f1815703-aaab-4474-bace-62cc0229865d',
                accounts: {
                  'f1815703-aaab-4474-bace-62cc0229865d': {
                    address: '0x6354fc52ee3f852a6470fdcfc2248d44910835e2',
                    methods: [
                      'personal_sign',
                      'eth_sign',
                      'eth_signTransaction',
                      'eth_signTypedData_v1',
                      'eth_signTypedData_v3',
                      'eth_signTypedData_v4',
                    ],
                    metadata: {
                      lastSelected: 1725390448650,
                      keyring: {
                        type: 'HD Key Tree',
                      },
                      importTime: 1725390448649,
                      name: 'Account 1',
                    },
                    options: {},
                    type: 'eip155:eoa',
                    id: 'f1815703-aaab-4474-bace-62cc0229865d',
                  },
                },
              },
            },
            AssetsContractController: {},
            AccountTrackerController: {
              accountsByChainId: {
                '0x1': {
                  '0x6354fC52eE3f852A6470FDcFc2248d44910835E2': {
                    balance: '0x0',
                  },
                },
              },
              accounts: {
                '0x6354fC52eE3f852A6470FDcFc2248d44910835E2': {
                  balance: '0x0',
                },
              },
            },
          },
        },
        navigation: {
          currentBottomNavRoute: 'Wallet',
          currentRoute: 'Wallet',
        },
        originThrottling: {
          origins: {},
        },
        notification: {
          notifications: [],
        },
        onboarding: {
          events: [],
        },
        legalNotices: {
          newPrivacyPolicyToastShownDate: null,
          newPrivacyPolicyToastClickedOrClosed: true,
        },
        collectibles: {
          isNftFetchingProgress: false,
          favorites: {},
        },
        wizard: {
          step: 0,
        },
        alert: {
          data: null,
          content: null,
          autodismiss: null,
          isVisible: false,
        },
        networkOnboarded: {
          switchedNetwork: {
            networkStatus: false,
            networkUrl: '',
          },
          networkState: {
            networkUrl: '',
            networkType: '',
            nativeToken: '',
            showNetworkOnboarding: false,
          },
          networkOnboardedState: {},
        },
        infuraAvailability: {
          isBlocked: false,
        },
        user: {
          ambiguousAddressEntries: {},
          appTheme: 'os',
          initialScreen: '',
          isAuthChecked: false,
          userLoggedIn: true,
          gasEducationCarouselSeen: false,
          loadingMsg: '',
          loadingSet: false,
          protectWalletModalVisible: false,
          passwordSet: true,
          seedphraseBackedUp: false,
          backUpSeedphraseVisible: false,
        },
        sdk: {
          dappConnections: {},
          approvedHosts: {},
          connections: {},
        },
        swaps: {
          '0x1': {
            featureFlags: {
              v2: {
                swapAndSend: {
                  enabled: true,
                },
              },
              smartTransactions: {
                returnTxHashAsap: false,
                maxDeadline: 160,
                expectedDeadline: 45,
              },
              mobileActiveAndroid: true,
              mobileActiveIOS: true,
              extensionActive: true,
              mobileActive: true,
              mobile_active: true,
              fallbackToV1: false,
              fallback_to_v1: false,
              extension_active: true,
            },
            isLive: true,
          },
          featureFlags: {
            smartTransactions: {
              mobileActiveIOS: false,
              mobileActiveAndroid: false,
              extensionActive: true,
              mobileActive: true,
            },
            smart_transactions: {
              extension_active: true,
              mobile_active: true,
            },
          },
          hasOnboarded: true,
          isLive: true,
        },
        smartTransactions: {
          optInModalAppVersionSeen: null,
        },
        accounts: {
          reloadAccounts: false,
        },
        signatureRequest: {},
        privacy: {
          revealSRPTimestamps: [],
          approvedHosts: {},
        },
        transaction: {
          securityAlertResponses: {},
          transaction: {},
          selectedAsset: {},
        },
        browser: {
          visitedDappsByHostname: {},
          tabs: [],
          activeTab: null,
          favicons: [],
          whitelist: [],
          history: [],
        },
        bookmarks: [],
        settings: {
          basicFunctionalityEnabled: true,
          hideZeroBalanceTokens: false,
          lockTime: 30000,
          primaryCurrency: 'ETH',
          useBlockieIcon: true,
          searchEngine: 'DuckDuckGo',
        },
        modals: {
          signMessageModalVisible: true,
          dappTransactionModalVisible: false,
          collectibleContractModalVisible: false,
          receiveModalVisible: false,
          shouldNetworkSwitchPopToWallet: true,
          networkModalVisible: false,
        },
        security: {
          isNFTAutoDetectionModalViewed: false,
          dataCollectionForMarketing: false,
          isAutomaticSecurityChecksModalOpen: false,
          allowLoginWithRememberMe: false,
          hasUserSelectedAutomaticSecurityCheckOption: true,
          automaticSecurityChecksEnabled: false,
        },
      },
      asyncState: {
        '@MetaMask:existingUser': 'true',
        '@MetaMask:onboardingWizard': 'explored',
        '@MetaMask:UserTermsAcceptedv1.0': 'true',
        '@MetaMask:WhatsNewAppVersionSeen': '7.24.3',
      },
    };
    return this;
  }

  withKeyringController() {
    merge(this.fixture.state.engine.backgroundState.KeyringController, {
      keyrings: [
        {
          type: 'HD Key Tree',
          accounts: ['0x37cc5ef6bfe753aeaf81f945efe88134b238face'],
        },
        { type: 'QR Hardware Wallet Device', accounts: [] },
      ],
      vault:
        '{"cipher":"T+MXWPPwXOh8RLxpryUuoFCObwXqNQdwak7FafAoVeXOehhpuuUDbjWiHkeVs9slsy/uzG8z+4Va+qyz4dlRnd/Gvc/2RbHTAb/LG1ECk1rvLZW23JPGkBBVAu36FNGCTtT+xrF4gRzXPfIBVAAgg40YuLJWkcfVty6vGcHr3R3/9gpsqs3etrF5tF4tHYWPEhzhhx6HN6Tr4ts3G9sqgyEhyxTLCboAYWp4lsq2iTEl1vQ6T/UyBRNhfDj8RyQMF6hwkJ0TIq2V+aAYkr5NJguBBSi0YKPFI/SGLrin9/+d66gcOSFhIH0GhUbez3Yf54852mMtvOH8Vj7JZc664ukOvEdJIpvCw1CbtA9TItyVApkjQypLtE+IdV3sT5sy+v0mK7Xc054p6+YGiV8kTiTG5CdlI4HkKvCOlP9axwXP0aRwc4ffsvp5fKbnAVMf9+otqmOmlA5nCKdx4FOefTkr/jjhMlTGV8qUAJ2c6Soi5X02fMcrhAfdUtFxtUqHovOh3KzOe25XhjxZ6KCuix8OZZiGtbNDu3xJezPc3vzkTFwF75ubYozLDvw8HzwI+D5Ifn0S3q4/hiequ6NGiR3Dd0BIhWODSvFzbaD7BKdbgXhbJ9+3FXFF9Xkp74msFp6o7nLsx02ywv/pmUNqQhwtVBfoYhcFwqZZQlOPKcH8otguhSvZ7dPgt7VtUuf8gR23eAV4ffVsYK0Hll+5n0nZztpLX4jyFZiV/kSaBp+D2NZM2dnQbsWULKOkjo/1EpNBIjlzjXRBg5Ui3GgT3JXUDx/2GmJXceacrbMcos3HC2yfxwUTXC+yda4IrBx/81eYb7sIjEVNxDuoBxNdRLKoxwmAJztxoQLF3gRexS45QKoFZZ0kuQ9MqLyY6HDK","iv":"3271713c2b35a7c246a2a9b263365c3d","keyMetadata":{"algorithm":"PBKDF2","params":{"iterations":5000}},"lib":"original","salt":"l4e+sn/jdsaofDWIB/cuGQ=="}',
    });
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
