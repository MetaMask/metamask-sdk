# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.33.0]
### Added
- Add rpc ingore list to analytics ([#1293](https://github.com/MetaMask/metamask-sdk/pull/1293))
- Integrate sdk-analytics with SDK ([#1289](https://github.com/MetaMask/metamask-sdk/pull/1289))

### Fixed
- Updates and Fixes to Analytics ([#1294](https://github.com/MetaMask/metamask-sdk/pull/1294))


## [0.32.1]
### Fixed
- fix: Fix analytics for unwanted events when using extension ([#1219](https://github.com/MetaMask/metamask-sdk/pull/1219))

## [0.32.0]
### Uncategorized
- feat: add turborepo for improved monorepo development experience ([#1195](https://github.com/MetaMask/metamask-sdk/pull/1195))

## [0.31.5]
### Added
- feat: improves the react connected hook when using extension & emit terminate when using extension ([#1186](https://github.com/MetaMask/metamask-sdk/pull/1186))

## [0.31.4]
### Fixed
- refactor(sdk): always send RPC requests via network and deeplink ([#1181](https://github.com/MetaMask/metamask-sdk/pull/1181))

## [0.31.3]
### Fixed
- fix(analytics): improve dapp details tracking and SDK RPC request analytics ([#1179](https://github.com/MetaMask/metamask-sdk/pull/1179))

## [0.31.2]
### Fixed
- fix: nextjs build fix pr ([#1163](https://github.com/MetaMask/metamask-sdk/pull/1163))
- Set initial modal tab based on preferDesktop option ([#1158](https://github.com/MetaMask/metamask-sdk/pull/1158))

## [0.31.1]
### Changed
- fix: Tell webpack about dynamic import + fixed polyfills ([#1151](https://github.com/MetaMask/metamask-sdk/pull/1151))

## [0.31.0]
### Changed
- refactor(sdk-install-modal-web): migrate from i18next to custom SimpleI18n implementation ([#1141](https://github.com/MetaMask/metamask-sdk/pull/1141))

## [0.30.2]
### Uncategorized
- align version with sdk

## [0.30.0]

## [0.29.2]
### Added
- feat: default options for pure js and useDeeplink default to true ([#1070](https://github.com/MetaMask/metamask-sdk/pull/1070))

## [0.29.1]
### Added
- feat: bump versions for publishing ([#1068](https://github.com/MetaMask/metamask-sdk/pull/1068))

## [0.29.0]
### Added
- feat: auto activate deeplink protocol when wallet supports it ([#1056](https://github.com/MetaMask/metamask-sdk/pull/1056))
- feat: handle connection reject event ([#1020](https://github.com/MetaMask/metamask-sdk/pull/1020))

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
### Uncategorized
- feat: revert socket server changes ([#985](https://github.com/MetaMask/metamask-sdk/pull/985))

## [0.27.0]
### Added
- fix: adds extensionOnly default to true to SDK initialization ([#962](https://github.com/MetaMask/metamask-sdk/pull/962))
- feat: sets extensionOnly default to true ([#956](https://github.com/MetaMask/metamask-sdk/pull/956))
- chore: bump .change files ([#957](https://github.com/MetaMask/metamask-sdk/pull/957))
- feat: improve open deeplink on IOS Chrome ([#948](https://github.com/MetaMask/metamask-sdk/pull/948))

## [0.26.5]
### Added
- chore: update the '@metamask/providers' package to version '16.1.0'
- chore: update the 'babel' packages ([#939](https://github.com/MetaMask/metamask-sdk/pull/939))

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

## [0.26.0]
### Added
- feat: add script to align version before publishing ([#902](https://github.com/MetaMask/metamask-sdk/pull/902))

## [0.20.5]
### Added
- chore: add unit tests to the sdk-react package ([#868](https://github.com/MetaMask/metamask-sdk/pull/868))

## [0.20.4]
### Added
- feat: create a new SDK for React Native ([#859](https://github.com/MetaMask/metamask-sdk/pull/859))

## [0.20.3]
### Added
- feat: force change ([#848](https://github.com/MetaMask/metamask-sdk/pull/848))

## [0.20.2]
### Added
- skip version because of publishing issue


## [0.20.1]
### Added
- feat: trigger new version ([#840](https://github.com/MetaMask/metamask-sdk/pull/840))
- Revert "Release 63.0.0" ([#839](https://github.com/MetaMask/metamask-sdk/pull/839))
- Release 62.0.0 ([#838](https://github.com/MetaMask/metamask-sdk/pull/838))
- Revert "feat: release 62.0.0" ([#837](https://github.com/MetaMask/metamask-sdk/pull/837))
- feat: release 62.0.0 ([#836](https://github.com/MetaMask/metamask-sdk/pull/836))

## [0.20.0]
### Added
- feat: align version ([#835](https://github.com/MetaMask/metamask-sdk/pull/835))

## [0.19.0]
### Added
- feat: full sdk persistence ([#823](https://github.com/MetaMask/metamask-sdk/pull/823))

## [0.18.6]
### Added
- fix: improve the validation of 'dappId' param in the 'setupAnalytics' function ([#817](https://github.com/MetaMask/metamask-sdk/pull/817))

## [0.18.5]
### Added
- feat: update 'sdk-react' to be in '0.18.5' ([#810](https://github.com/MetaMask/metamask-sdk/pull/810))

## [0.18.4]
### Added
- fix: prefer desktop ([#800](https://github.com/MetaMask/metamask-sdk/pull/800))
- feat: logging initialization ([#799](https://github.com/MetaMask/metamask-sdk/pull/799))

## [0.18.0]
### Added
- feat: update the examples apps to the latest sdk version '0.17.2' ([#773](https://github.com/MetaMask/metamask-sdk/pull/773))

## [0.17.2]
### Added
- fix: normalize uppercase account addresses in SDKProvider, to resolve MaxListenersExceededWarning ([#766](https://github.com/MetaMask/metamask-sdk/pull/766))

## [0.17.1]
### Added
- fix: adapt the "devreactnative" DApp for compatibility with new "metaMask/providers" version ([#757](https://github.com/MetaMask/metamask-sdk/pull/757))

## [0.17.0]
### Added
- feat: update the "@metamask/providers" package to version 15.0.0 ([#752](https://github.com/MetaMask/metamask-sdk/pull/752))
- feat: restrict rpc method analytics ([#755](https://github.com/MetaMask/metamask-sdk/pull/755))
- feat: rpc event tracking ([#745](https://github.com/MetaMask/metamask-sdk/pull/745))
- chore: disable logs when running unit tests in CI ([#727](https://github.com/MetaMask/metamask-sdk/pull/727))

## [0.16.0]
### Added
- feat: activate sourcemap support in all packages and resolve issues ([#730](https://github.com/MetaMask/metamask-sdk/pull/730))
- chore: reduce the bundle size ([#725](https://github.com/MetaMask/metamask-sdk/pull/725))
- chore: use the 'debug' package as the new logger ([#716](https://github.com/MetaMask/metamask-sdk/pull/716))
- Fix/sdk config provider ([#714](https://github.com/MetaMask/metamask-sdk/pull/714))
- feat: expose channel id via hook + expose wallet status via sdk instance ([#704](https://github.com/MetaMask/metamask-sdk/pull/704))
- feat: automated github pages publication ([#599](https://github.com/MetaMask/metamask-sdk/pull/599))

## [0.15.0]
### Added
- feat: disable sourcemaps ([#678](https://github.com/MetaMask/metamask-sdk/pull/678))

## [0.14.2]
### Added
- chore: add expo demo app ([#577](https://github.com/MetaMask/metamask-sdk/pull/577))
- feat: change default options with useDeeplinks to false ([#576](https://github.com/MetaMask/metamask-sdk/pull/576))

## [0.14.1]
### Added
- align version with sdk

## [0.14.0]
### Added
- feat: account reset issue on _init event ([#556](https://github.com/MetaMask/metamask-sdk/pull/556))
- feat: expose rpc history and keep track of last call ([#555](https://github.com/MetaMask/metamask-sdk/pull/555))

## [0.13.0]
### Added
- fix: storage UI and devreact ([#545](https://github.com/MetaMask/metamask-sdk/pull/545))

## [0.12.4]
### Added
- feat: build setup for ui and lab ([#537](https://github.com/MetaMask/metamask-sdk/pull/537))
- feat: add debug and rn compatibility to config provider ([#532](https://github.com/MetaMask/metamask-sdk/pull/532))

## [0.12.3]
### Added
- feat: sdk config context as part of sdk-react ([#529](https://github.com/MetaMask/metamask-sdk/pull/529))

## [0.12.2]
### Added
- feat: add processing state when computing balance ([#519](https://github.com/MetaMask/metamask-sdk/pull/519))
- feat: design system part2 ([#517](https://github.com/MetaMask/metamask-sdk/pull/517))
- feat: optimize rollup builds ([#496](https://github.com/MetaMask/metamask-sdk/pull/496))
- fix: linting changelog issue after updating scripts ([#509](https://github.com/MetaMask/metamask-sdk/pull/509))
- fix: invalid changelog linter script ([#506](https://github.com/MetaMask/metamask-sdk/pull/506))

## [0.12.1]
### Added
- align version with sdk

## [0.12.0]
### Added
- feat: set minimum required coverage to 50/100 ([#473](https://github.com/MetaMask/metamask-sdk/pull/473))
- feat: socket handling optimization and devnext ui ([#468](https://github.com/MetaMask/metamask-sdk/pull/468))
- feat: expose rpc history tracker ([#462](https://github.com/MetaMask/metamask-sdk/pull/462))

## [0.11.2]
### Added
- align version with sdk

## [0.11.1]
### Added
- align version with sdk

## [0.11.0]
### Added
- fix: setChainId cause a build error ([#452](https://github.com/MetaMask/metamask-sdk/pull/452))
- fix: chainId is undefined on first connection with extension ([#445](https://github.com/MetaMask/metamask-sdk/pull/445))
- feat: enable wagmi config as option ([#447](https://github.com/MetaMask/metamask-sdk/pull/447))
- feat: rename metamask_chainRPCs to metamask_batch and add unit tests ([#440](https://github.com/MetaMask/metamask-sdk/pull/440))
- fix: account balance not updating when chain changes ([#435](https://github.com/MetaMask/metamask-sdk/pull/435))

## [0.10.1]
### Added
- chore: align version number with sdk

## [0.10.0]
### Added
- fix: balance only display when debug is set ([#408](https://github.com/MetaMask/metamask-sdk/pull/408))
- feat: add unit tests to the sdk-react package ([#369](https://github.com/MetaMask/metamask-sdk/pull/369))

## [0.9.0]
### Added
- feat: implementing internationalization via i18next package ([#403](https://github.com/MetaMask/metamask-sdk/pull/403))
- feat: automatically compute account balance and return from sdk-react ([#400](https://github.com/MetaMask/metamask-sdk/pull/400))

## [0.8.0]
### Added
- feat: update account and chain values in sdk hook on extension ([#386](https://github.com/MetaMask/metamask-sdk/pull/386))
- feat: add extensionActive info into hook ([#384](https://github.com/MetaMask/metamask-sdk/pull/384))
- feat: adds contact form to npm packages ([#382](https://github.com/MetaMask/metamask-sdk/pull/382))

## [0.7.0]
### Added
- feat: rpc read only calls and infura provider ([#353](https://github.com/MetaMask/metamask-sdk/pull/353))
- feat: add codecov to CI ([#343](https://github.com/MetaMask/metamask-sdk/pull/343))

## [0.6.2]
### Added
- docs: add readme info for sdk-react and sdk-react-ui ([#342](https://github.com/MetaMask/metamask-sdk/pull/342))

## [0.6.1]
### Added
- feat: align versions ([#323](https://github.com/MetaMask/metamask-sdk/pull/323))

## [0.6.0]
### Added
- refactor: move wagmi to sdk-react-ui ([#271](https://github.com/MetaMask/metamask-sdk/pull/271))

## [0.5.6]
### Added
- feat: react hooks with wagmi ([#246](https://github.com/MetaMask/metamask-sdk/pull/246))

## [0.5.4]
### Added
- feat: monorepo examples integration ([#239](https://github.com/MetaMask/metamask-sdk/pull/239))
- fix: sdk hook connector error with strictmode ([#234](https://github.com/MetaMask/metamask-sdk/pull/234))

## [0.5.3]
### Added
- Upgrade to latest sdk

## [0.3.1]
### Added
- Release 3.0.0
- fix types path ([#137](https://github.com/MetaMask/metamask-sdk/pull/137))
- [FEAT] add nextjs demo project in examples/ ([#123](https://github.com/MetaMask/metamask-sdk/pull/123))
- [fix] publishing config ([#135](https://github.com/MetaMask/metamask-sdk/pull/135))
- [feat] initial beta released

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.33.0...HEAD
[0.33.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.32.1...@metamask/sdk-react@0.33.0
[0.32.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.32.0...@metamask/sdk-react@0.32.1
[0.32.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.5...@metamask/sdk-react@0.32.0
[0.31.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.4...@metamask/sdk-react@0.31.5
[0.31.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.3...@metamask/sdk-react@0.31.4
[0.31.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.2...@metamask/sdk-react@0.31.3
[0.31.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.1...@metamask/sdk-react@0.31.2
[0.31.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.31.0...@metamask/sdk-react@0.31.1
[0.31.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.30.2...@metamask/sdk-react@0.31.0
[0.30.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.30.0...@metamask/sdk-react@0.30.2
[0.30.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.29.2...@metamask/sdk-react@0.30.0
[0.29.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.29.1...@metamask/sdk-react@0.29.2
[0.29.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.29.0...@metamask/sdk-react@0.29.1
[0.29.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.28.4...@metamask/sdk-react@0.29.0
[0.28.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.28.3...@metamask/sdk-react@0.28.4
[0.28.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.28.2...@metamask/sdk-react@0.28.3
[0.28.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.28.1...@metamask/sdk-react@0.28.2
[0.28.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.28.0...@metamask/sdk-react@0.28.1
[0.28.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.27.0...@metamask/sdk-react@0.28.0
[0.27.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.5...@metamask/sdk-react@0.27.0
[0.26.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.4...@metamask/sdk-react@0.26.5
[0.26.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.3...@metamask/sdk-react@0.26.4
[0.26.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.2...@metamask/sdk-react@0.26.3
[0.26.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.1...@metamask/sdk-react@0.26.2
[0.26.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.26.0...@metamask/sdk-react@0.26.1
[0.26.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.5...@metamask/sdk-react@0.26.0
[0.20.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.4...@metamask/sdk-react@0.20.5
[0.20.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.3...@metamask/sdk-react@0.20.4
[0.20.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.2...@metamask/sdk-react@0.20.3
[0.20.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.1...@metamask/sdk-react@0.20.2
[0.20.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.20.0...@metamask/sdk-react@0.20.1
[0.20.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.19.0...@metamask/sdk-react@0.20.0
[0.19.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.18.6...@metamask/sdk-react@0.19.0
[0.18.6]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.18.5...@metamask/sdk-react@0.18.6
[0.18.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.18.4...@metamask/sdk-react@0.18.5
[0.18.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.18.0...@metamask/sdk-react@0.18.4
[0.18.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.17.2...@metamask/sdk-react@0.18.0
[0.17.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.17.1...@metamask/sdk-react@0.17.2
[0.17.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.17.0...@metamask/sdk-react@0.17.1
[0.17.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.16.0...@metamask/sdk-react@0.17.0
[0.16.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.15.0...@metamask/sdk-react@0.16.0
[0.15.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.14.2...@metamask/sdk-react@0.15.0
[0.14.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.14.1...@metamask/sdk-react@0.14.2
[0.14.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.14.0...@metamask/sdk-react@0.14.1
[0.14.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.13.0...@metamask/sdk-react@0.14.0
[0.13.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.12.4...@metamask/sdk-react@0.13.0
[0.12.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.12.3...@metamask/sdk-react@0.12.4
[0.12.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.12.2...@metamask/sdk-react@0.12.3
[0.12.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.12.1...@metamask/sdk-react@0.12.2
[0.12.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.12.0...@metamask/sdk-react@0.12.1
[0.12.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.11.2...@metamask/sdk-react@0.12.0
[0.11.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.11.1...@metamask/sdk-react@0.11.2
[0.11.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.11.0...@metamask/sdk-react@0.11.1
[0.11.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.10.1...@metamask/sdk-react@0.11.0
[0.10.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.10.0...@metamask/sdk-react@0.10.1
[0.10.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.9.0...@metamask/sdk-react@0.10.0
[0.9.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.8.0...@metamask/sdk-react@0.9.0
[0.8.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.7.0...@metamask/sdk-react@0.8.0
[0.7.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.6.2...@metamask/sdk-react@0.7.0
[0.6.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.6.1...@metamask/sdk-react@0.6.2
[0.6.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.6.0...@metamask/sdk-react@0.6.1
[0.6.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.5.6...@metamask/sdk-react@0.6.0
[0.5.6]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.5.4...@metamask/sdk-react@0.5.6
[0.5.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.5.3...@metamask/sdk-react@0.5.4
[0.5.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react@0.3.1...@metamask/sdk-react@0.5.3
[0.3.1]: https://github.com/MetaMask/metamask-sdk/releases/tag/@metamask/sdk-react@0.3.1
