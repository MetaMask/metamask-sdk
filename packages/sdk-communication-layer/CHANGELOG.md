# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.26.4]
### Added
- chore: update SDK dependencies to resolve version conflicts ([#921](https://github.com/MetaMask/metamask-sdk/pull/921))

## [0.26.2]
### Added
- feat: cleanup leaking console logs ([#907](https://github.com/MetaMask/metamask-sdk/pull/907))

## [0.26.0]
### Added
- feat: add script to align version before publishing ([#902](https://github.com/MetaMask/metamask-sdk.git/pull/902))
- feat: update dev rn / expo and empty dappid ([#897](https://github.com/MetaMask/metamask-sdk.git/pull/897))
- feat: prevent empty dappid ([#891](https://github.com/MetaMask/metamask-sdk.git/pull/891))
- chore: improve unit tests coverage ([#888](https://github.com/MetaMask/metamask-sdk.git/pull/888))

## [0.20.5]
### Added
- fix: ref crossfetch ([#871](https://github.com/MetaMask/metamask-sdk.git/pull/871))

## [0.20.4]
### Added
- chore: update prepare-preview-builds CI job ([#869](https://github.com/MetaMask/metamask-sdk/pull/869))
- fix: crossfetch version not matching comm layer ([#860](https://github.com/MetaMask/metamask-sdk/pull/860))

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
- feat: update the 'expo-demo' example dapp ([#824](https://github.com/MetaMask/metamask-sdk/pull/824))

## [0.18.5]
### Added
- fix: preferDesktop and onboarding ([#807](https://github.com/MetaMask/metamask-sdk/pull/807))

## [0.18.4]
### Added
- fix: prefer desktop ([#800](https://github.com/MetaMask/metamask-sdk/pull/800))
- feat: logging initialization ([#799](https://github.com/MetaMask/metamask-sdk/pull/799))

## [0.18.2]
### Added
- feat: sdk done event on dapp side ([#789](https://github.com/MetaMask/metamask-sdk/pull/789))

## [0.18.1]
### Added
- fix: add correct param to sdk_rpc_request_received ([#781](https://github.com/MetaMask/metamask-sdk/pull/781))
- feat: add rpc received event ([#780](https://github.com/MetaMask/metamask-sdk/pull/780))
- feat: store account between refresh ([#779](https://github.com/MetaMask/metamask-sdk/pull/779))

## [0.18.0]
### Added
- feat: update prod socket server url ([#774](https://github.com/MetaMask/metamask-sdk/pull/774))

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
- feat: sdk bundle size opt methodology ([#722](https://github.com/MetaMask/metamask-sdk/pull/722))
- chore: use the 'debug' package as the new logger ([#716](https://github.com/MetaMask/metamask-sdk/pull/716))

## [0.15.0]
### Added
- chore: sourcemaps ([#687](https://github.com/MetaMask/metamask-sdk/pull/687))
- Revert "Release 48.0.0" ([#686](https://github.com/MetaMask/metamask-sdk/pull/686))
- Release 48.0.0 ([#684](https://github.com/MetaMask/metamask-sdk/pull/684))
- feat: disable sourcemaps ([#678](https://github.com/MetaMask/metamask-sdk/pull/678))
- feat: permission system flow ([#675](https://github.com/MetaMask/metamask-sdk/pull/675))

## [0.14.3]
### Added
- feat: new socket code ([#609](https://github.com/MetaMask/metamask-sdk/pull/609))

## [0.14.2]
### Added
- feat: change the 'enableDebug' option to 'enableAnalytics' ([#604](https://github.com/MetaMask/metamask-sdk/pull/604))

## [0.14.1]
### Added
- feat: graceful warning instead of throwing keyexchange ([#571](https://github.com/MetaMask/metamask-sdk/pull/571))

## [0.14.0]
### Added
- feat: expo keyexchange status and track last rpc id ([#554](https://github.com/MetaMask/metamask-sdk/pull/554))

## [0.13.0]
### Added
- Align version with sdk

## [0.12.3]
### Added
- feat: add the option to add dapp icon in base64 format ([#521](https://github.com/MetaMask/metamask-sdk/pull/521))

## [0.12.2]
### Added
- feat: add the option to add iconUrl to the dappMetadata ([#511](https://github.com/MetaMask/metamask-sdk/pull/511))
- feat: optimize rollup builds ([#496](https://github.com/MetaMask/metamask-sdk/pull/496))

## [0.12.1]
### Added
- feat: metamask/sdk-ui initial setup ([#487](https://github.com/MetaMask/metamask-sdk/pull/487))

## [0.12.0]
### Added
- feat: set minimum required coverage to 50/100 ([#473](https://github.com/MetaMask/metamask-sdk/pull/473))
- feat: socket handling optimization and devnext ui ([#468](https://github.com/MetaMask/metamask-sdk/pull/468))
- feat: expose rpc history tracker ([#462](https://github.com/MetaMask/metamask-sdk/pull/462))
- feat: allow editing otherpublickey for faster connection recovery ([#466](https://github.com/MetaMask/metamask-sdk/pull/466))
- feat: disable favicon in dappmetadata ([#467](https://github.com/MetaMask/metamask-sdk/pull/467))

## [0.11.1]
### Added
- build: improve sdk bundle to work with nodejs strictmode ([#457](https://github.com/MetaMask/metamask-sdk/pull/457))

## [0.11.0]
### Added
- build: optimize rollup output by env ([#450](https://github.com/MetaMask/metamask-sdk/pull/450))
- fix: socket io event handler not initializing properly ([#446](https://github.com/MetaMask/metamask-sdk/pull/446))
- feat: rename metamask_chainRPCs to metamask_batch and add unit tests ([#440](https://github.com/MetaMask/metamask-sdk/pull/440))

## [0.10.1]
### Added
- feat: send sdk_extension_utilized analytics event when extension is selected from cached choice. ([#425](https://github.com/MetaMask/metamask-sdk/pull/425))

## [0.10.0]
### Added
- feat: connection recovery edge case ([#411](https://github.com/MetaMask/metamask-sdk/pull/411))

## [0.9.0]
### Added
- fix typos ([#401](https://github.com/MetaMask/metamask-sdk/pull/401))

## [0.8.0]
### Added
- feat: adds contact form to npm packages ([#382](https://github.com/MetaMask/metamask-sdk/pull/382))

## [0.7.1]
### Added
- fix: sdk connection request event ([#364](https://github.com/MetaMask/metamask-sdk/pull/364))

## [0.7.0]
### Added
- feat: extend the time we resume the session without showing OTP ([#348](https://github.com/MetaMask/metamask-sdk/pull/348))
- feat: add codecov to CI ([#343](https://github.com/MetaMask/metamask-sdk/pull/343))

## [0.6.2]
### Added
- feat: add unit tests to the MetaMaskSDK class ([#319](https://github.com/MetaMask/metamask-sdk/pull/319))

## [0.6.1]
### Added
- feat: align versions ([#323](https://github.com/MetaMask/metamask-sdk/pull/323))

## [0.6.0]
### Added
- feat: improved event tracking ([#298](https://github.com/MetaMask/metamask-sdk/pull/298))
- feat: add unit tests to the SocketService class ([#294](https://github.com/MetaMask/metamask-sdk/pull/294))
- feat: refactor SocketService class for enhanced modularity and testability ([#292](https://github.com/MetaMask/metamask-sdk/pull/292))
- feat: refactor RemoteCommunication class for enhanced modularity and testability ([#282](https://github.com/MetaMask/metamask-sdk/pull/282))

## [0.5.3]
### Added
- feat: remove webrtc references ([#227](https://github.com/MetaMask/metamask-sdk/pull/227))
- refactor: simplify connection flow ([#226](https://github.com/MetaMask/metamask-sdk/pull/226))
- feat: cleanup obsolete walletconnect references ([#223](https://github.com/MetaMask/metamask-sdk/pull/223))
- fix: initial connection promise potentially dangling with browser extension ([#218](https://github.com/MetaMask/metamask-sdk/pull/218))

## [0.5.2]
### Added
- feat: optimize paused/resume flow ([#212](https://github.com/MetaMask/metamask-sdk/pull/212))

## [0.5.0]
### Added
- feat: improved event tracking for extension and inappbrowser ([#200](https://github.com/MetaMask/metamask-sdk/pull/200))
- feat: export sendanalytics from comm layer ([#198](https://github.com/MetaMask/metamask-sdk/pull/198))
- fix: possible dangling promise on sendMessage (wallet side) ([#194](https://github.com/MetaMask/metamask-sdk/pull/194))
- feat: sdk async init ([#191](https://github.com/MetaMask/metamask-sdk/pull/191))

## [0.4.2]
### Added
- feat: add metamask-mobile platform-type for wallet compatibility ([#187](https://github.com/MetaMask/metamask-sdk/pull/187))

## [0.4.0]
### Added
- feat: linter improvements ([#175](https://github.com/MetaMask/metamask-sdk/pull/175))
- [FEAT] authorized improvements + typings ([#158](https://github.com/MetaMask/metamask-sdk/pull/158))

## [0.3.3]
### Added
- [FEAT] wait for authorized event ([#147](https://github.com/MetaMask/metamask-sdk/pull/147))
- [FEAT] choose between extennsion and mobile wallet ([#146](https://github.com/MetaMask/metamask-sdk/pull/146))

## [0.3.2]
### Added
- [FIX] initial eth_requestAccounts ignored when refreshing session ([#139](https://github.com/MetaMask/metamask-sdk/pull/139))

## [0.3.0]
### Fixed
- [FIX] reconnection instability ([#109](https://github.com/MetaMask/metamask-sdk/pull/109))

## [0.2.5]
### Added
- [FEAT]: improve logging + update examples ([#99](https://github.com/MetaMask/metamask-sdk/pull/99))

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.26.4...HEAD
[0.26.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.26.2...@metamask/sdk-communication-layer@0.26.4
[0.26.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.26.0...@metamask/sdk-communication-layer@0.26.2
[0.26.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.20.5...@metamask/sdk-communication-layer@0.26.0
[0.20.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.20.4...@metamask/sdk-communication-layer@0.20.5
[0.20.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.20.2...@metamask/sdk-communication-layer@0.20.4
[0.20.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.20.1...@metamask/sdk-communication-layer@0.20.2
[0.20.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.20.0...@metamask/sdk-communication-layer@0.20.1
[0.20.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.19.0...@metamask/sdk-communication-layer@0.20.0
[0.19.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.18.5...@metamask/sdk-communication-layer@0.19.0
[0.18.5]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.18.4...@metamask/sdk-communication-layer@0.18.5
[0.18.4]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.18.2...@metamask/sdk-communication-layer@0.18.4
[0.18.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.18.1...@metamask/sdk-communication-layer@0.18.2
[0.18.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.18.0...@metamask/sdk-communication-layer@0.18.1
[0.18.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.17.0...@metamask/sdk-communication-layer@0.18.0
[0.17.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.16.0...@metamask/sdk-communication-layer@0.17.0
[0.16.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.15.0...@metamask/sdk-communication-layer@0.16.0
[0.15.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.14.3...@metamask/sdk-communication-layer@0.15.0
[0.14.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.14.2...@metamask/sdk-communication-layer@0.14.3
[0.14.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.14.1...@metamask/sdk-communication-layer@0.14.2
[0.14.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.14.0...@metamask/sdk-communication-layer@0.14.1
[0.14.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.13.0...@metamask/sdk-communication-layer@0.14.0
[0.13.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.12.3...@metamask/sdk-communication-layer@0.13.0
[0.12.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.12.2...@metamask/sdk-communication-layer@0.12.3
[0.12.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.12.1...@metamask/sdk-communication-layer@0.12.2
[0.12.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.12.0...@metamask/sdk-communication-layer@0.12.1
[0.12.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.11.1...@metamask/sdk-communication-layer@0.12.0
[0.11.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.11.0...@metamask/sdk-communication-layer@0.11.1
[0.11.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.10.1...@metamask/sdk-communication-layer@0.11.0
[0.10.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.10.0...@metamask/sdk-communication-layer@0.10.1
[0.10.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.9.0...@metamask/sdk-communication-layer@0.10.0
[0.9.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.8.0...@metamask/sdk-communication-layer@0.9.0
[0.8.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.7.1...@metamask/sdk-communication-layer@0.8.0
[0.7.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.7.0...@metamask/sdk-communication-layer@0.7.1
[0.7.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.6.2...@metamask/sdk-communication-layer@0.7.0
[0.6.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.6.1...@metamask/sdk-communication-layer@0.6.2
[0.6.1]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.6.0...@metamask/sdk-communication-layer@0.6.1
[0.6.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.5.3...@metamask/sdk-communication-layer@0.6.0
[0.5.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.5.2...@metamask/sdk-communication-layer@0.5.3
[0.5.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.5.0...@metamask/sdk-communication-layer@0.5.2
[0.5.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.4.2...@metamask/sdk-communication-layer@0.5.0
[0.4.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.4.0...@metamask/sdk-communication-layer@0.4.2
[0.4.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.3.3...@metamask/sdk-communication-layer@0.4.0
[0.3.3]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.3.2...@metamask/sdk-communication-layer@0.3.3
[0.3.2]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.3.0...@metamask/sdk-communication-layer@0.3.2
[0.3.0]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.2.5...@metamask/sdk-communication-layer@0.3.0
[0.2.5]: https://github.com/MetaMask/metamask-sdk/releases/tag/@metamask/sdk-communication-layer@0.2.5
