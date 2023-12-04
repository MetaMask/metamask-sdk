# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- build: optimize rollup output by env ([#450](https://github.com/MetaMask/metamask-sdk.git/pull/450))
- fix: socket io event handler not initializing properly ([#446](https://github.com/MetaMask/metamask-sdk.git/pull/446))
- feat: rename metamask_chainRPCs to metamask_batch and add unit tests ([#440](https://github.com/MetaMask/metamask-sdk.git/pull/440))

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
### Uncategorized
- feat: adds contact form to npm packages ([#382](https://github.com/MetaMask/metamask-sdk/pull/382))

## [0.7.1]
### Uncategorized
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
- [FEAT] improve logging + update examples ([#99](https://github.com/MetaMask/metamask-sdk/pull/99))

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.14.1...HEAD
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
