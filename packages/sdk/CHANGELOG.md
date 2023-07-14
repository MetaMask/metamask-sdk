# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.3]
### Added
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

[Unreleased]: https://github.com/MetaMask/metamask-sdk/compare/@metamask/sdk@0.5.3...HEAD
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
