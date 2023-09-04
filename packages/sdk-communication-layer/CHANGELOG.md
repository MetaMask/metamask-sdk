# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk-communication-layer@0.6.0...HEAD
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
