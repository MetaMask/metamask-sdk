# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [0.26.0]
### Added
- feat: add script to align version before publishing ([#902](https://github.com/MetaMask/metamask-sdk.git/pull/902))

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

## [0.17.0]
### Added
- feat: update the "@metamask/providers" package to version 15.0.0 ([#752](https://github.com/MetaMask/metamask-sdk/pull/752))

## [0.16.0]
### Added
- feat: activate sourcemap support in all packages and resolve issues ([#730](https://github.com/MetaMask/metamask-sdk/pull/730))
- feat: automated github pages publication ([#599](https://github.com/MetaMask/metamask-sdk/pull/599))

## [0.15.0]
### Added
- feat: disable sourcemaps ([#678](https://github.com/MetaMask/metamask-sdk/pull/678))

## [0.14.3]
### Added
- fix: 'sdk-react-ui' MetaMaskModal is not showing balance ([#593](https://github.com/MetaMask/metamask-sdk/pull/593))

## [0.14.2]
### Added
- update: updates Wagmi dependency on `sdk-react-ui` to 1.4.12 ([#588](https://github.com/MetaMask/metamask-sdk/pull/588))

## [0.14.1]

## [0.14.0]
### Added
- fix: balance not updating on metamask button ([#553](https://github.com/MetaMask/metamask-sdk/pull/553))

## [0.13.0]
### Added
- feat: add sdk instance to window scope to prevent double init ([#546](https://github.com/MetaMask/metamask-sdk/pull/546))

## [0.12.4]
### Added
- feat: build setup for ui and lab ([#537](https://github.com/MetaMask/metamask-sdk/pull/537))

## [0.12.3]
### Added
- feat: sdk config context as part of sdk-react ([#529](https://github.com/MetaMask/metamask-sdk/pull/529))

## [0.12.2]
### Added
- feat: optimize rollup builds ([#496](https://github.com/MetaMask/metamask-sdk/pull/496))
- fix: linting changelog issue after updating scripts ([#509](https://github.com/MetaMask/metamask-sdk/pull/509))
- fix: invalid changelog linter script ([#506](https://github.com/MetaMask/metamask-sdk/pull/506))

## [0.12.1]
### Added
- feat: metamask/sdk-ui initial setup ([#487](https://github.com/MetaMask/metamask-sdk/pull/487))

## [0.12.0]
### Added
- align version with sdk

## [0.11.2]
### Added
- fix: add missing wagmi provider wrapper dependencies ([#459](https://github.com/MetaMask/metamask-sdk/pull/459))

## [0.11.1]
### Added
- align version with sdk

## [0.11.0]
### Added
- feat: enable wagmi config as option ([#447](https://github.com/MetaMask/metamask-sdk/pull/447))
- feat: rename metamask_chainRPCs to metamask_batch and add unit tests ([#440](https://github.com/MetaMask/metamask-sdk/pull/440))
- feat: add 'tw-' prefix to tailwind classes in the sdk-react-ui package ([#437](https://github.com/MetaMask/metamask-sdk/pull/437))

## [0.10.1]
### Added
- fix: flightwind css leaking with preflight ([#428](https://github.com/MetaMask/metamask-sdk/pull/428))

## [0.10.0]
### Added
- Force align package version to sdk

## [0.9.0]
### Added
- feat: implementing internationalization via i18next package ([#403](https://github.com/MetaMask/metamask-sdk/pull/403))

## [0.8.0]
### Added
- feat: adds contact form to npm packages ([#382](https://github.com/MetaMask/metamask-sdk/pull/382))

## [0.7.0]
### Added
- feat: add codecov to CI ([#343](https://github.com/MetaMask/metamask-sdk/pull/343))

## [0.6.2]
### Added
- docs: add readme info for sdk-react and sdk-react-ui ([#342](https://github.com/MetaMask/metamask-sdk/pull/342))
- fix: sdk-react-ui doesn't reexport sdk-react hooks ([#341](https://github.com/MetaMask/metamask-sdk/pull/341))

## [0.6.1]
### Added
- feat: align versions ([#323](https://github.com/MetaMask/metamask-sdk/pull/323))
- feat: refactor MetaMaskSDK class for enhanced modularity and testability  ([#309](https://github.com/MetaMask/metamask-sdk/pull/309))

## [0.6.0]
### Added
- [feat] initial beta released

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.27.0...HEAD
[0.27.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.26.5...@metamask/sdk-react-ui@0.27.0
[0.26.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.26.4...@metamask/sdk-react-ui@0.26.5
[0.26.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.26.3...@metamask/sdk-react-ui@0.26.4
[0.26.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.26.2...@metamask/sdk-react-ui@0.26.3
[0.26.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.26.0...@metamask/sdk-react-ui@0.26.2
[0.26.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.20.4...@metamask/sdk-react-ui@0.26.0
[0.20.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.20.3...@metamask/sdk-react-ui@0.20.4
[0.20.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.20.2...@metamask/sdk-react-ui@0.20.3
[0.20.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.20.1...@metamask/sdk-react-ui@0.20.2
[0.20.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.20.0...@metamask/sdk-react-ui@0.20.1
[0.20.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.18.6...@metamask/sdk-react-ui@0.20.0
[0.18.6]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.18.5...@metamask/sdk-react-ui@0.18.6
[0.18.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.18.4...@metamask/sdk-react-ui@0.18.5
[0.18.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.18.0...@metamask/sdk-react-ui@0.18.4
[0.18.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.17.0...@metamask/sdk-react-ui@0.18.0
[0.17.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.16.0...@metamask/sdk-react-ui@0.17.0
[0.16.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.15.0...@metamask/sdk-react-ui@0.16.0
[0.15.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.14.3...@metamask/sdk-react-ui@0.15.0
[0.14.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.14.2...@metamask/sdk-react-ui@0.14.3
[0.14.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.14.1...@metamask/sdk-react-ui@0.14.2
[0.14.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.14.0...@metamask/sdk-react-ui@0.14.1
[0.14.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.13.0...@metamask/sdk-react-ui@0.14.0
[0.13.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.12.4...@metamask/sdk-react-ui@0.13.0
[0.12.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.12.3...@metamask/sdk-react-ui@0.12.4
[0.12.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.12.2...@metamask/sdk-react-ui@0.12.3
[0.12.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.12.1...@metamask/sdk-react-ui@0.12.2
[0.12.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.12.0...@metamask/sdk-react-ui@0.12.1
[0.12.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.11.2...@metamask/sdk-react-ui@0.12.0
[0.11.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.11.1...@metamask/sdk-react-ui@0.11.2
[0.11.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.11.0...@metamask/sdk-react-ui@0.11.1
[0.11.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.10.1...@metamask/sdk-react-ui@0.11.0
[0.10.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.10.0...@metamask/sdk-react-ui@0.10.1
[0.10.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.9.0...@metamask/sdk-react-ui@0.10.0
[0.9.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.8.0...@metamask/sdk-react-ui@0.9.0
[0.8.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.7.0...@metamask/sdk-react-ui@0.8.0
[0.7.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.6.2...@metamask/sdk-react-ui@0.7.0
[0.6.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.6.1...@metamask/sdk-react-ui@0.6.2
[0.6.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-react-ui@0.6.0...@metamask/sdk-react-ui@0.6.1
[0.6.0]: https://github.com/MetaMask/metamask-sdk/releases/tag/@metamask/sdk-react-ui@0.6.0
