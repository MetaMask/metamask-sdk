# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0]
### Added
- feat: add sdk version and change modal order ([#405](https://github.com/MetaMask/metamask-sdk/pull/405))
- feat: implementing internationalization via i18next package ([#403](https://github.com/MetaMask/metamask-sdk/pull/403))
- feat: alias terminate to disconnect on sdk ([#399](https://github.com/MetaMask/metamask-sdk/pull/399))
- fix typos ([#401](https://github.com/MetaMask/metamask-sdk/pull/401))
- fix: modal cleanup and otp selection ([#402](https://github.com/MetaMask/metamask-sdk/pull/402))

## [0.8.0]
### Uncategorized
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
### Uncategorized
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

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.9.0...HEAD
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
