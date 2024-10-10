# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0]
### Changed
- **BREAKING**: Use portable `readable-stream@^3.6.2` instead of native streams ([#51](https://github.com/MetaMask/extension-port-stream/pull/51))

## [2.1.1]
### Changed
- deps: replace webextension-polyfill-ts with webextension-polyfill ([#43](https://github.com/MetaMask/extension-port-stream/pull/43))

## [2.1.0] - 2023-06-15
### Added
- `_setLogger` method can be used to inject custom logger for incoming/outgoing messages ([#46](https://github.com/MetaMask/extension-port-stream/pull/46))

### Changed
- deps: webextension-polyfill-ts@0.22.0->0.26.0 ([#37](https://github.com/MetaMask/extension-port-stream/pull/37))
  - Updates webextension-polyfill from 0.7.0 to 0.8.0

### Fixed
- Fix exporting of types ([#24](https://github.com/MetaMask/extension-port-stream/pull/24))
- deps: webextension-polyfill-ts@0.22.0->0.26.0 ([#37](https://github.com/MetaMask/extension-port-stream/pull/37))
  - Updates webextension-polyfill from 0.7.0 to 0.8.0

## [2.0.1] - 2021-04-29
### Changed
- Move `webextension-polyfill-ts` from `devDependencies` to `dependencies` ([#11](https://github.com/MetaMask/extension-port-stream/pull/11))

## [2.0.0] - 2020-11-23
### Added
- TypeScript typings ([#4](https://github.com/MetaMask/extension-port-stream/pull/4))

### Removed
- **(BREAKING)** Remove `readable-stream` dependency ([#4](https://github.com/MetaMask/extension-port-stream/pull/4))
  - Consumers using this package in browser environments will have to bring their own Node.js stream polyfill.

[Unreleased]: https://github.com/MetaMask/extension-port-stream/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/extension-port-stream/compare/v2.1.1...v3.0.0
[2.1.1]: https://github.com/MetaMask/extension-port-stream/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/MetaMask/extension-port-stream/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/MetaMask/extension-port-stream/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/MetaMask/extension-port-stream/releases/tag/v2.0.0
