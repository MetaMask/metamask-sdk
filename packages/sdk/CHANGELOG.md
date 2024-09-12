# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.4]
### Added
- fix: update the `initializeMobileProvider` function to ensure it returns all connected accounts on mobile ([#1031](https://github.com/MetaMask/metamask-sdk/pull/1031))

## [0.28.3]
### Added
- fix: invalid display_uri event emitted

## [0.28.2]
### Added
- fix: sdk-react for react-native ([#1011](https://github.com/MetaMask/metamask-sdk/pull/1011))

## [0.28.1]
### Added
- fix: sdk _selectedAddress not always initialized and rn setup ([#1008](https://github.com/MetaMask/metamask-sdk/pull/1008))

## [0.28.0]
### Added
- fix: adds a unique id to RPC events for extension ([#996](https://github.com/MetaMask/metamask-sdk/pull/996))
- feat: connectwith working with async key exchange ([#1004](https://github.com/MetaMask/metamask-sdk/pull/1004))
- feat: socket reconnection optimization ([#994](https://github.com/MetaMask/metamask-sdk/pull/994))
- feat: full deeplink protocol ([#992](https://github.com/MetaMask/metamask-sdk/pull/992))
- feat: experimental deeplink protocoll ([#990](https://github.com/MetaMask/metamask-sdk/pull/990))
- feat: revert socket server changes ([#985](https://github.com/MetaMask/metamask-sdk/pull/985))
- feat: change the default value for 'dappId' to 'N/A' instead of an empty string ([#972](https://github.com/MetaMask/metamask-sdk/pull/972))

## [0.27.0]
### Added
- fix: adds extensionOnly default to true to SDK initialization ([#962](https://github.com/MetaMask/metamask-sdk/pull/962))
- feat: sets extensionOnly default to true ([#956](https://github.com/MetaMask/metamask-sdk/pull/956))
- chore: bump .change files ([#957](https://github.com/MetaMask/metamask-sdk/pull/957))
- feat: improve open deeplink on IOS Chrome ([#948](https://github.com/MetaMask/metamask-sdk/pull/948))

## [0.26.5]
### Added
- chore: update the '@metamask/providers' package to version '16.1.0'

## [0.26.4]
### Added
- chore: removes the 'defaultReadOnlyChainId' option from the SDK options ([#919](https://github.com/MetaMask/metamask-sdk/pull/919))
- chore: update SDK dependencies to resolve version conflicts ([#921](https://github.com/MetaMask/metamask-sdk/pull/921))
- chore: update the 'request' method in the 'wrapExtensionProvider' to throw an error when RPC calls fail ([#917](https://github.com/MetaMask/metamask-sdk/pull/917))

## [0.26.3]
### Added
- fix: update the 'request' method wrapper logic in 'wrapExtensionProvider' to handle connectAndSign issues ([#913](https://github.com/MetaMask/metamask-sdk/pull/913))

## [0.26.2]
### Added
- chore: terminate on 'ACCOUNTS_CHANGED' event when accounts are zero ([#909](https://github.com/MetaMask/metamask-sdk/pull/909))

## [0.26.1]
### Added
- feat: wallet_revokePermissions on terminate  ([#907](https://github.com/MetaMask/metamask-sdk/pull/907))

## [0.26.0]
### Added
- feat: add script to align version before publishing ([#902](https://github.com/MetaMask/metamask-sdk/pull/902))
- feat: close modal with error 4001 ([#898](https://github.com/MetaMask/metamask-sdk/pull/898))
- feat: emit url event ([#901](https://github.com/MetaMask/metamask-sdk/pull/901))
- chore: improve unit tests coverage ([#888](https://github.com/MetaMask/metamask-sdk/pull/888))

## [0.20.5]
### Added
- fix: extension events ([#877](https://github.com/MetaMask/metamask-sdk/pull/877))
- feat: set default sdk source ([#875](https://github.com/MetaMask/metamask-sdk/pull/875))

## [0.20.4]
### Added
- feat: create a new SDK for React Native ([#859](https://github.com/MetaMask/metamask-sdk/pull/859))

## [0.20.3]
### Added
- feat: re-enable jscc web ([#845](https://github.com/MetaMask/metamask-sdk/pull/845))

## [0.20.2]
### Added
- skip version because of publishing issue

## [0.20.1]
### Added
- skip version because of publishing issue

## [0.20.0]
### Added
- feat: track done event on extension analytics ([#834](https://github.com/MetaMask/metamask-sdk/pull/834))

## [0.19.0]
### Added
- feat: remove rn dependencies  ([#830](https://github.com/MetaMask/metamask-sdk/pull/830))
- feat: storage manager ([#829](https://github.com/MetaMask/metamask-sdk/pull/829))
- feat: full sdk persistence ([#823](https://github.com/MetaMask/metamask-sdk/pull/823))

## [0.18.6]
### Added
- fix: improve the validation of 'dappId' param in the 'setupAnalytics' function ([#817](https://github.com/MetaMask/metamask-sdk/pull/817))

## [0.18.5]
### Added
- fix: preferDesktop and onboarding ([#807](https://github.com/MetaMask/metamask-sdk/pull/807))
- fix: inpage provider support ([#806](https://github.com/MetaMask/metamask-sdk/pull/806))

## [0.18.4]
### Added
- fix: prefer desktop ([#800](https://github.com/MetaMask/metamask-sdk/pull/800))
- feat: logging initialization ([#799](https://github.com/MetaMask/metamask-sdk/pull/799))

## [0.18.3]
### Added
- fix: issue preventing opting out of analytics ([#794](https://github.com/MetaMask/metamask-sdk/pull/794))

## [0.18.2]
### Added
- fix: update the EIP_6369 provider info ([#788](https://github.com/MetaMask/metamask-sdk/pull/788))

## [0.18.1]
### Added
- feat: store account between refresh ([#779](https://github.com/MetaMask/metamask-sdk/pull/779))

## [0.18.0]
### Added
- feat: update prod socket server url ([#774](https://github.com/MetaMask/metamask-sdk/pull/774))

## [0.17.2]
### Added
- feat: separately handle extension connectWith ([#767](https://github.com/MetaMask/metamask-sdk/pull/767))
- fix: normalize uppercase account addresses in SDKProvider, to resolve MaxListenersExceededWarning ([#766](https://github.com/MetaMask/metamask-sdk/pull/766))

## [0.17.1]
### Added
- fix: adapt the "devreactnative" DApp for compatibility with new "metaMask/providers" version ([#757](https://github.com/MetaMask/metamask-sdk/pull/757))
- fix: invalid provider state to undefined instead of null ([#758](https://github.com/MetaMask/metamask-sdk/pull/758))

## [0.17.0]
### Added
- feat: update the "@metamask/providers" package to version 15.0.0 ([#752](https://github.com/MetaMask/metamask-sdk/pull/752))
- feat: restrict rpc method analytics ([#755](https://github.com/MetaMask/metamask-sdk/pull/755))
- feat: rpc event tracking ([#745](https://github.com/MetaMask/metamask-sdk/pull/745))
- refactor(sdk): update blockedDomainCheck to remove regex ([#740](https://github.com/MetaMask/metamask-sdk/pull/740))
- chore: disable logs when running unit tests in CI ([#727](https://github.com/MetaMask/metamask-sdk/pull/727))

## [0.16.0]
### Added
- feat: activate sourcemap support in all packages and resolve issues ([#730](https://github.com/MetaMask/metamask-sdk/pull/730))
- feat: add sdkVersion to analytics ([#726](https://github.com/MetaMask/metamask-sdk/pull/726))
- chore: reduce the bundle size ([#725](https://github.com/MetaMask/metamask-sdk/pull/725))
- feat: sdk bundle size opt methodology ([#722](https://github.com/MetaMask/metamask-sdk/pull/722))
- chore: use the 'debug' package as the new logger ([#716](https://github.com/MetaMask/metamask-sdk/pull/716))
- feat: add support for personal_ecRecover ([#707](https://github.com/MetaMask/metamask-sdk/pull/707))
- feat: expose channel id via hook + expose wallet status via sdk instance ([#704](https://github.com/MetaMask/metamask-sdk/pull/704))
- feat: automated github pages publication ([#599](https://github.com/MetaMask/metamask-sdk/pull/599))

## [0.15.0]
### Added
- chore: sourcemaps ([#687](https://github.com/MetaMask/metamask-sdk/pull/687))
- Revert "Release 48.0.0" ([#686](https://github.com/MetaMask/metamask-sdk/pull/686))
- Release 48.0.0 ([#684](https://github.com/MetaMask/metamask-sdk/pull/684))
- feat: disable sourcemaps ([#678](https://github.com/MetaMask/metamask-sdk/pull/678))
- feat: allow connect with request_permissions ([#685](https://github.com/MetaMask/metamask-sdk/pull/685))
- feat: permission system flow ([#675](https://github.com/MetaMask/metamask-sdk/pull/675))

## [0.14.3]
### Added
- feat: Conditionally Invoke getMobileProvider in setupExtensionPreferences Based on if Mobile Provider is Availabile ([#663](https://github.com/MetaMask/metamask-sdk/pull/663))
- feat: add dAppTitle to Infura Header for Enhanced dApp Identification ([#666](https://github.com/MetaMask/metamask-sdk/pull/666))

## [0.14.2]
### Added
- feat: change the 'enableDebug' option to 'enableAnalytics' ([#604](https://github.com/MetaMask/metamask-sdk/pull/604))
- feat: create an auto-translate script for the internationalization files ([#595](https://github.com/MetaMask/metamask-sdk/pull/595))
- chore: add expo demo app ([#577](https://github.com/MetaMask/metamask-sdk/pull/577))

## [0.14.1]
### Added
- feat: ui quick swap and new rpc call metamask_open ([#572](https://github.com/MetaMask/metamask-sdk/pull/572))
- fix: connect with not redirecting ([#561](https://github.com/MetaMask/metamask-sdk/pull/561))

## [0.14.0]
### Added
- feat: new rpc call metamask_connectwith ([#558](https://github.com/MetaMask/metamask-sdk/pull/558))
- chore: change favicon from base64 format to url ([#550](https://github.com/MetaMask/metamask-sdk/pull/550))

## [0.13.0]
### Added
- feat: add sdk instance to window scope to prevent double init ([#546](https://github.com/MetaMask/metamask-sdk/pull/546))
- fix: transfer the extracted favicon to base64 format in setupDappMetadata ([#536](https://github.com/MetaMask/metamask-sdk/pull/536))

## [0.12.4]
### Added
- sdk ui release version

## [0.12.3]
### Added
- fix: regex in setupDappMetadata function ([#528](https://github.com/MetaMask/metamask-sdk/pull/528))
- feat: add the option to add dapp icon in base64 format ([#521](https://github.com/MetaMask/metamask-sdk/pull/521))

## [0.12.2]
### Added
- feat: add the option to add iconUrl to the dappMetadata ([#511](https://github.com/MetaMask/metamask-sdk/pull/511))
- feat: optimize rollup builds ([#496](https://github.com/MetaMask/metamask-sdk/pull/496))

## [0.12.1]
### Added
- feat: propagate extension events ([#493](https://github.com/MetaMask/metamask-sdk/pull/493))
- feat: metamask/sdk-ui initial setup ([#487](https://github.com/MetaMask/metamask-sdk/pull/487))
- feat: add backward v3 json compatibility on i18n ([#483](https://github.com/MetaMask/metamask-sdk/pull/483))

## [0.12.0]
### Added
- feat: update onboard package ([#475](https://github.com/MetaMask/metamask-sdk/pull/475))
- feat: expose sdk version ([#474](https://github.com/MetaMask/metamask-sdk/pull/474))
- feat: set minimum required coverage to 50/100 ([#473](https://github.com/MetaMask/metamask-sdk/pull/473))
- feat: installmodal deeplink compatibility ([#471](https://github.com/MetaMask/metamask-sdk/pull/471))
- feat: socket handling optimization and devnext ui ([#468](https://github.com/MetaMask/metamask-sdk/pull/468))
- feat: expose rpc history tracker ([#462](https://github.com/MetaMask/metamask-sdk/pull/462))
- refactor: rewrite ios browser version detection for improved readibility ([#465](https://github.com/MetaMask/metamask-sdk/pull/465))
- feat: qrcode deeplinks ([#463](https://github.com/MetaMask/metamask-sdk/pull/463))
- feat: sdk option openDeepLink with dynamic url  ([#464](https://github.com/MetaMask/metamask-sdk/pull/464))

## [0.11.2]
### Added
- align version with sdk-react* packages

## [0.11.1]
### Added
- build: improve sdk bundle to work with nodejs strictmode ([#457](https://github.com/MetaMask/metamask-sdk/pull/457))

## [0.11.0]
### Added
- feat: enable wagmi config as option ([#447](https://github.com/MetaMask/metamask-sdk/pull/447))
- fix: socket io event handler not initializing properly ([#446](https://github.com/MetaMask/metamask-sdk/pull/446))
- feat: detect qrcode origin on wallet ([#443](https://github.com/MetaMask/metamask-sdk/pull/443))
- feat: rename metamask_chainRPCs to metamask_batch and add unit tests ([#440](https://github.com/MetaMask/metamask-sdk/pull/440))
- fix: add metadata to the sdk_extension_utilized analytics event ([#433](https://github.com/MetaMask/metamask-sdk/pull/433))
- feat: chaining of rpc calls ([#434](https://github.com/MetaMask/metamask-sdk/pull/434))

## [0.10.1]
### Added
- feat: send sdk_extension_utilized analytics event when extension is selected from cached choice. ([#425](https://github.com/MetaMask/metamask-sdk/pull/425))

## [0.10.0]
### Added
- feat: connectAndSign feature ([#410](https://github.com/MetaMask/metamask-sdk/pull/410))

## [0.9.0]
### Added
- feat: add sdk version and change modal order ([#405](https://github.com/MetaMask/metamask-sdk/pull/405))
- feat: implementing internationalization via i18next package ([#403](https://github.com/MetaMask/metamask-sdk/pull/403))
- feat: alias terminate to disconnect on sdk ([#399](https://github.com/MetaMask/metamask-sdk/pull/399))
- fix typos ([#401](https://github.com/MetaMask/metamask-sdk/pull/401))
- fix: modal cleanup and otp selection ([#402](https://github.com/MetaMask/metamask-sdk/pull/402))

## [0.8.0]
### Added
- feat: remove npm dependency warnings for peers packages
- feat: enable infura http headers for analytics ([#387](https://github.com/MetaMask/metamask-sdk/pull/387))
- feat: cache selected account and selected chain ([#385](https://github.com/MetaMask/metamask-sdk/pull/385))
- feat: adds contact form to npm packages ([#382](https://github.com/MetaMask/metamask-sdk/pull/382))
- feat: updates documentation links and platform status ([#378](https://github.com/MetaMask/metamask-sdk/pull/378))

## [0.7.1]
### Added
- feat: allow all react-native peer deps ([#366](https://github.com/MetaMask/metamask-sdk/pull/366))
- fix: sdk connection request event ([#364](https://github.com/MetaMask/metamask-sdk/pull/364))
- feat: wrap eth_accounts when disconnected to allow read only / offline calls ([#363](https://github.com/MetaMask/metamask-sdk/pull/363))

## [0.7.0]
### Added
- feat: rpc read only calls and infura provider ([#353](https://github.com/MetaMask/metamask-sdk/pull/353))
- feat: extend the time we resume the session without showing OTP ([#348](https://github.com/MetaMask/metamask-sdk/pull/348))
- feat: add codecov to CI ([#343](https://github.com/MetaMask/metamask-sdk/pull/343))

## [0.6.2]
### Added
- feat: add unit tests to the RemoteCommunicationPostMessageStream class ([#337](https://github.com/MetaMask/metamask-sdk/pull/337))
- feat: refactor the RemoteCommunicationPostMessage stream class ([#336](https://github.com/MetaMask/metamask-sdk/pull/336))
- feat: add unit tests to the MobilePortStream class ([#335](https://github.com/MetaMask/metamask-sdk/pull/335))
- feat: add unit tests to the PlatformManager class ([#333](https://github.com/MetaMask/metamask-sdk/pull/333))
- feat: refactor the PlatformManager class ([#332](https://github.com/MetaMask/metamask-sdk/pull/332))
- fix: edge case when modal not fully resetting after termination ([#339](https://github.com/MetaMask/metamask-sdk/pull/339))
- fix: initialize state in _initializeStateAsync to address uninitialized properties issue ([#331](https://github.com/MetaMask/metamask-sdk/pull/331))
- feat: add unit tests to the MetaMaskInstaller class ([#326](https://github.com/MetaMask/metamask-sdk/pull/326))
- feat: refactor the MetaMaskInstaller class ([#325](https://github.com/MetaMask/metamask-sdk/pull/325))
- feat: refactor the SDKProvider class for enhanced modularity and testability ([#321](https://github.com/MetaMask/metamask-sdk/pull/321))
- feat: add unit tests to uncovered parts of the sdk package ([#320](https://github.com/MetaMask/metamask-sdk/pull/320))
- feat: add unit tests to the MetaMaskSDK class ([#319](https://github.com/MetaMask/metamask-sdk/pull/319))

## [0.6.1]
### Added
- feat: refactor MetaMaskSDK class for enhanced modularity and testability  ([#309](https://github.com/MetaMask/metamask-sdk/pull/309))

## [0.6.0]
### Added
- feat: improved event tracking ([#298](https://github.com/MetaMask/metamask-sdk/pull/298))
- feat: reinitialize sdk on termination ([#296](https://github.com/MetaMask/metamask-sdk/pull/296))
- feat: remove invalid connect event (should contain chainId) ([#287](https://github.com/MetaMask/metamask-sdk/pull/287))
- feat: add sideEffects field to sdk package ([#286](https://github.com/MetaMask/metamask-sdk/pull/286))
- feat: refactor the RemoteConnection class ([#258](https://github.com/MetaMask/metamask-sdk/pull/258))
- feat: enable commit hooks and video examples  ([#252](https://github.com/MetaMask/metamask-sdk/pull/252))
- feat: restrict autoconnect desktopweb ([#248](https://github.com/MetaMask/metamask-sdk/pull/248))

## [0.5.6]
### Added
- feat: force provider connect state ([#245](https://github.com/MetaMask/metamask-sdk/pull/245))
- feat: optimize provider initialization ([#243](https://github.com/MetaMask/metamask-sdk/pull/243))

## [0.5.5]
### Added
- fix: install modal unmount ([#241](https://github.com/MetaMask/metamask-sdk/pull/241))

## [0.5.4]
### Added
- feat: monorepo examples integration ([#239](https://github.com/MetaMask/metamask-sdk/pull/239))
- feat: check init before connect (+dynamic platform import) ([#238](https://github.com/MetaMask/metamask-sdk/pull/238))
- fix: sdk hook connector error with strictmode ([#234](https://github.com/MetaMask/metamask-sdk/pull/234))
- fix: autoconnection setting ([#235](https://github.com/MetaMask/metamask-sdk/pull/235))
- fix: invalid types during build pipeline ([#233](https://github.com/MetaMask/metamask-sdk/pull/233))

## [0.5.3]
### Added
- feat: persist extension provider preferences
- feat: remove webrtc references ([#227](https://github.com/MetaMask/metamask-sdk/pull/227))
- refactor: simplify connection flow ([#226](https://github.com/MetaMask/metamask-sdk/pull/226))
- feat: cleanup obsolete walletconnect references ([#223](https://github.com/MetaMask/metamask-sdk/pull/223))
- feat: options to use metamask browser extension only (skip modal) ([#220](https://github.com/MetaMask/metamask-sdk/pull/220))
- fix: initial connection promise potentially dangling with browser extension ([#218](https://github.com/MetaMask/metamask-sdk/pull/218))

## [0.5.2]
### Added
- fix: invalid modal state ([#213](https://github.com/MetaMask/metamask-sdk/pull/213))

## [0.5.1]
### Added
- Revert "Release 12.0.0" ([#210](https://github.com/MetaMask/metamask-sdk/pull/210))
- Release 12.0.0 ([#208](https://github.com/MetaMask/metamask-sdk/pull/208))
- feat: optimize modal rendering and re-use existing node ([#206](https://github.com/MetaMask/metamask-sdk/pull/206))

## [0.5.0]
### Added
- feat: improved event tracking for extension and inappbrowser ([#200](https://github.com/MetaMask/metamask-sdk/pull/200))
- feat: autoextract favicon on web platforms ([#196](https://github.com/MetaMask/metamask-sdk/pull/196))
- feat: default to enable session persistence ([#197](https://github.com/MetaMask/metamask-sdk/pull/197))
- feat: sdk async init ([#191](https://github.com/MetaMask/metamask-sdk/pull/191))
- feat: switch between extension and mobile provider ([#189](https://github.com/MetaMask/metamask-sdk/pull/189))

## [0.4.2]
### Added
- feat: expose sdk provider ([#186](https://github.com/MetaMask/metamask-sdk/pull/186))

## [0.4.1]
### Added
- fix: invalid sdk types ([#182](https://github.com/MetaMask/metamask-sdk/pull/182))

## [0.4.0]
### Added
- fix: invalid types path ([#173](https://github.com/MetaMask/metamask-sdk/pull/173))
- fix(sdk): react native detection ([#174](https://github.com/MetaMask/metamask-sdk/pull/174))
- feat: linter improvements ([#175](https://github.com/MetaMask/metamask-sdk/pull/175))
- [FEAT] authorized improvements + typings ([#158](https://github.com/MetaMask/metamask-sdk/pull/158))

## [0.3.3]
### Added
- [FEAT] choose between extension and mobile wallet ([#146](https://github.com/MetaMask/metamask-sdk/pull/146))
- [fix] #145 missing css color ([#149](https://github.com/MetaMask/metamask-sdk/pull/149))
- [feat] skip suffix check if location does not exist ([#128](https://github.com/MetaMask/metamask-sdk/pull/128))

## [0.3.2]
### Added
- [fix] initial eth_requestAccounts ignored when refreshing session ([#139](https://github.com/MetaMask/metamask-sdk/pull/139))

## [0.3.1]
### Added
- fix types path ([#137](https://github.com/MetaMask/metamask-sdk/pull/137))

## [0.3.0]
### Added
- [fix] shouldInjectProvider  ([#118](https://github.com/MetaMask/metamask-sdk/pull/118))
- [FIX] reconnection instability ([#109](https://github.com/MetaMask/metamask-sdk/pull/109))
- [FEATURE] make metadata mandatory ([#97](https://github.com/MetaMask/metamask-sdk/pull/97))

## [0.2.4]
### Added
- [FEAT] improve logging + update examples ([#99](https://github.com/MetaMask/metamask-sdk/pull/99))

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.28.4...HEAD
[0.28.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.28.3...@metamask/sdk@0.28.4
[0.28.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.28.2...@metamask/sdk@0.28.3
[0.28.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.28.1...@metamask/sdk@0.28.2
[0.28.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.28.0...@metamask/sdk@0.28.1
[0.28.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.27.0...@metamask/sdk@0.28.0
[0.27.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.5...@metamask/sdk@0.27.0
[0.26.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.4...@metamask/sdk@0.26.5
[0.26.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.3...@metamask/sdk@0.26.4
[0.26.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.2...@metamask/sdk@0.26.3
[0.26.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.1...@metamask/sdk@0.26.2
[0.26.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.26.0...@metamask/sdk@0.26.1
[0.26.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.5...@metamask/sdk@0.26.0
[0.20.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.4...@metamask/sdk@0.20.5
[0.20.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.3...@metamask/sdk@0.20.4
[0.20.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.2...@metamask/sdk@0.20.3
[0.20.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.1...@metamask/sdk@0.20.2
[0.20.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.20.0...@metamask/sdk@0.20.1
[0.20.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.19.0...@metamask/sdk@0.20.0
[0.19.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.6...@metamask/sdk@0.19.0
[0.18.6]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.5...@metamask/sdk@0.18.6
[0.18.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.4...@metamask/sdk@0.18.5
[0.18.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.3...@metamask/sdk@0.18.4
[0.18.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.2...@metamask/sdk@0.18.3
[0.18.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.1...@metamask/sdk@0.18.2
[0.18.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.18.0...@metamask/sdk@0.18.1
[0.18.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.17.2...@metamask/sdk@0.18.0
[0.17.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.17.1...@metamask/sdk@0.17.2
[0.17.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.17.0...@metamask/sdk@0.17.1
[0.17.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.16.0...@metamask/sdk@0.17.0
[0.16.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.15.0...@metamask/sdk@0.16.0
[0.15.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.14.3...@metamask/sdk@0.15.0
[0.14.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.14.2...@metamask/sdk@0.14.3
[0.14.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.14.1...@metamask/sdk@0.14.2
[0.14.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.14.0...@metamask/sdk@0.14.1
[0.14.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.13.0...@metamask/sdk@0.14.0
[0.13.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.12.4...@metamask/sdk@0.13.0
[0.12.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.12.3...@metamask/sdk@0.12.4
[0.12.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.12.2...@metamask/sdk@0.12.3
[0.12.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.12.1...@metamask/sdk@0.12.2
[0.12.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.12.0...@metamask/sdk@0.12.1
[0.12.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.11.2...@metamask/sdk@0.12.0
[0.11.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.11.1...@metamask/sdk@0.11.2
[0.11.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.11.0...@metamask/sdk@0.11.1
[0.11.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.10.1...@metamask/sdk@0.11.0
[0.10.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.10.0...@metamask/sdk@0.10.1
[0.10.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.9.0...@metamask/sdk@0.10.0
[0.9.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.8.0...@metamask/sdk@0.9.0
[0.8.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.7.1...@metamask/sdk@0.8.0
[0.7.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.7.0...@metamask/sdk@0.7.1
[0.7.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.6.2...@metamask/sdk@0.7.0
[0.6.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.6.1...@metamask/sdk@0.6.2
[0.6.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.6.0...@metamask/sdk@0.6.1
[0.6.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.6...@metamask/sdk@0.6.0
[0.5.6]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.5...@metamask/sdk@0.5.6
[0.5.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.4...@metamask/sdk@0.5.5
[0.5.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.3...@metamask/sdk@0.5.4
[0.5.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.2...@metamask/sdk@0.5.3
[0.5.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.1...@metamask/sdk@0.5.2
[0.5.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.0...@metamask/sdk@0.5.1
[0.5.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.4.2...@metamask/sdk@0.5.0
[0.4.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.4.1...@metamask/sdk@0.4.2
[0.4.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.4.0...@metamask/sdk@0.4.1
[0.4.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.3.3...@metamask/sdk@0.4.0
[0.3.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.3.2...@metamask/sdk@0.3.3
[0.3.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.3.1...@metamask/sdk@0.3.2
[0.3.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.3.0...@metamask/sdk@0.3.1
[0.3.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.2.4...@metamask/sdk@0.3.0
[0.2.4]: https://github.com/MetaMask/metamask-sdk/releases/tag/@metamask/sdk@0.2.4
