# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [15.0.0]

### Added

- **BREAKING:** Add ESM build ([#296](https://github.com/MetaMask/providers/pull/296))
  - It's no longer possible to import files from the `dist` folder directly, with the exception of `./dist/StreamProvider`

### Changed

- Bump several MetaMask dependencies ([#304](https://github.com/MetaMask/providers/pull/304))
- Export `RequestArguments` and `ConsoleLike` types ([#302](https://github.com/MetaMask/providers/pull/302))

## [14.0.2]

### Fixed

- Don't send `null` params to underlying provider ([#292](https://github.com/MetaMask/providers/pull/292))

## [14.0.1]

### Fixed

- Don't send `undefined` params to underlying provider ([#290](https://github.com/MetaMask/providers/pull/290))

## [14.0.0]

### Changed

- **BREAKING**: Update to streams3 API ([#288](https://github.com/MetaMask/providers/pull/288))
  - Update `extension-port-stream` from `^2.1.1` to `^3.0.0`
    - Force subdependency `readable-stream` to `^3.6.2` in resolutions
  - Update `json-rpc-middleware-stream` from `^4.2.3` to `^5.0.1`
  - Update `@metamask/object-multiplex` from `^1.3.0` to `^2.0.0`
  - Add direct dependency on `readable-stream@^3.6.2`
  - Replace internal usage of stream with `readable-stream`

## [13.1.0]

### Added

- Add support for EIP-6963 ([#263](https://github.com/MetaMask/providers/pull/263))
  - `initializeProvider()` params object now accepts an optional `providerInfo` property with a value of [EIP6963ProviderInfo object](https://eips.ethereum.org/EIPS/eip-6963#provider-info)
  - Add `eip6963AnnounceProvider()` which supports a wallet by announcing a provider through the `eip6963:announceProvider` event and re-announcing the provider whenever an `eip6963:requestProvider` event is received
  - Add `eip6963RequestProvider()` which supports a dapp by dispatching an `eip6963:requestProvider` event and invoking a callback for each `eip6963:announceProvider` event received
  - Add `EIP6963AnnounceProviderEvent` type
  - Add `EIP6963ProviderDetail` type
  - Add `EIP6963ProviderInfo` type
  - Add `EIP6963RequestProviderEvent` type

## [13.0.0]

### Changed

- **BREAKING**: Update `chainId`, `networkVersion`, and `selectedAddress` to be read-only ([#280](https://github.com/MetaMask/providers/pull/280))
- Log deprecation warning when accessing `chainId`, `networkVersion`, and `selectedAddress` ([#280](https://github.com/MetaMask/providers/pull/280))
- Remove `pump` ([#281](https://github.com/MetaMask/providers/pull/281))

## [12.0.0]

### Changed

- **BREAKING**: Replace `eth-rpc-errors`@`^4.0.2` with `@metamask/rpc-errors`@`6.0.0` ([#277](https://github.com/MetaMask/providers/pull/277))
- **BREAKING**: Replace `json-rpc-engine`@`^6.1.0` with `@metamask/json-rpc-engine`@`7.1.1` ([#277](https://github.com/MetaMask/providers/pull/277))
- Upgrade `@metamask/utils` from `^6.2.0` to `^8.1.0` ([#277](https://github.com/MetaMask/providers/pull/277))

## [11.1.2]

### Changed

- Update `extension-port-stream` to `^2.1.1` ([#273](https://github.com/MetaMask/providers/pull/273))

## [11.1.1]

### Changed

- Update `fast-deep-equal` ([#258](https://github.com/MetaMask/providers/pull/258))

## [11.1.0]

### Added

- Add warning for callers of `wallet_watchAsset` with ERC721 and ERC1155 token types, that support is currently considered experimental ([#264](https://github.com/MetaMask/providers/pull/264))

## [11.0.0]

### Changed

- **BREAKING**: Minimum Node.js version 16 ([#254](https://github.com/MetaMask/providers/pull/254))
- Support Flask and Beta in the external extension provider ([#252](https://github.com/MetaMask/providers/pull/252))
- Bump @metamask/safe-event-emitter from 2.0.0 to 3.0.0 ([#255](https://github.com/MetaMask/providers/pull/255))

### Fixed

- Fix console warning about deprecated `webextension-polyfill-ts` ([#249](https://github.com/MetaMask/providers/pull/249))
- Prevent `accountsChanged` + `eth_accounts` callback loop ([#248](https://github.com/MetaMask/providers/pull/248))
  - If you listen to the provider `accountsChanged` event, modify the returned accounts, then call `eth_accounts`, it was possible to enter an infinite loop. This was caused by the provider mistakenly thinking the accounts had changed because of the mutation performed in the event listener, triggering redundant `accountsChanged` events. This was fixed; there should be no more redundant `accountsChanged` events and no infinite loop.

## [10.2.1]

### Changed

- Update `json-rpc-middleware-stream` ([#234](https://github.com/MetaMask/providers/pull/234))

## [10.2.0]

### Changed

- Update `json-rpc-middleware-stream` ([#230](https://github.com/MetaMask/providers/pull/230))

## [10.1.0]

### Changed

- Update `json-rpc-middleware-stream` ([#228](https://github.com/MetaMask/providers/pull/228))

## [10.0.0]

### Changed

- Retry sending messages to extension when `METAMASK_EXTENSION_STREAM_CONNECT` is received ([#223](https://github.com/MetaMask/providers/pull/223))
- **BREAKING:** Update minimum Node.js version to v14 ([#225](https://github.com/MetaMask/providers/pull/225))

## [9.1.0]

### Added

- Add deprecation warning for encryption methods ([#218](https://github.com/MetaMask/providers/pull/218))

## [9.0.0]

### Changed

- **BREAKING:** Move stream functionality from `BaseProvider` to new `StreamProvider` ([#209](https://github.com/MetaMask/providers/pull/209))
  - `BaseProvider` is now a transport-agnostic abstract class. `StreamProvider` accepts a stream and relies on MetaMask's internal JSON-RPC API for its behavior. See the `StreamProvider` class for more details.
  - `MetaMaskInpageProvider` should be completely unaffected except that its prototype chain now includes a class named `AbstractStreamProvider`.

## [8.1.1] - 2021-05-12

### Changed

- Rename package to `@metamask/providers` ([#168](https://github.com/MetaMask/providers/pull/168))

### Fixed

- Restore `networkChanged` event in `MetaMaskInpageProvider` ([#171](https://github.com/MetaMask/providers/pull/171))

## [8.1.0] - 2021-05-05

### Added

- `BaseProvider`, implementing EIP-1193 without any legacy features ([#144](https://github.com/MetaMask/providers/pull/144))
- `createExternalExtensionProvider`, from the [extension-provider](https://github.com/MetaMask/extension-provider/) package ([#152](https://github.com/MetaMask/providers/pull/152))

## [8.0.4] - 2021-02-04

### Fixed

- Fix warning on second `currentProvider` access ([#138](https://github.com/MetaMask/providers/pull/138))

## [8.0.3] - 2021-01-20

### Fixed

- Restore 'data' provider event ([#135](https://github.com/MetaMask/providers/pull/135))

## [8.0.2] - 2021-01-12

### Changed

- Reduce `window.web3` shim console noise ([#133](https://github.com/MetaMask/providers/pull/133))

## [8.0.1] - 2020-12-08

### Fixed

- Fix `8.0.0` types ([#127](https://github.com/MetaMask/providers/pull/127))

## [8.0.0] - 2020-12-07

### Added

- Add `logger` parameter to `initializeProvider` ([#116](https://github.com/MetaMask/providers/pull/116))
- Add `window.web3` shim, `shimWeb3` export ([#113](https://github.com/MetaMask/providers/pull/113), [#115](https://github.com/MetaMask/providers/pull/115))
  - This is to maintain `window.web3.currentProvider` once MetaMask stops injecting `window.web3` (very soon), and to log attempts to access any properties on the shim other than `currentProvider`.
  - `initializeWeb3` now has a `shouldShimWeb3` argument, which causes the shim to be set as `window.web3` if `true`.

### Changed

- **BREAKING:** Rename `initProvider` export to `initializeProvider` ([#114](https://github.com/MetaMask/providers/pull/114))
- **BREAKING:** Replace `ethereum.publicConfigStore` with new set of JSON-RPC notifications ([#109](https://github.com/MetaMask/providers/pull/109))

### Removed

- **BREAKING:** Remove `_metamask.isEnabled` and `_metamask.isApproved` ([#112](https://github.com/MetaMask/providers/pull/112))
- **BREAKING:** Remove the `chainIdChanged` event ([#111](https://github.com/MetaMask/providers/pull/111))
- **BREAKING:** Remove `ethereum.publicConfigStore` ([#109](https://github.com/MetaMask/providers/pull/109))
- **BREAKING:** Remove `web3.js`-related functionality ([#106](https://github.com/MetaMask/providers/pull/106))
  - This functionality caused the page to reload if there was a `web3.js` instance at `window.web3`, and kept `web3.eth.defaultAccount` in sync with `ethereum.selectedAddress`.
  - This functionality is replicated in [@metamask/legacy-web3](https://www.npmjs.com/package/@metamask/legacy-web3).

### Fixed

- Correctly implement `connect` and `disconnect` events ([#120](https://github.com/MetaMask/providers/pull/120))
  - See [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#connect) for the specification of these events.
  - `disconnect` emits with an RPC error. Like all such errors emitted by this module, they have a `code` property with a `number` value. There are currently two codes:
    - `1013` indicates that MetaMask is attempting to reestablish the connection
    - `1011` indicates that a page reload is required
- Send page metadata even if page is already loaded ([#119](https://github.com/MetaMask/providers/pull/119))
- Convert `MetaMaskInpageProvider` `logger` to instance variable ([#118](https://github.com/MetaMask/providers/pull/118))
  - Previously, it was erroneously a singleton across all class instances.
- Stop emitting state change events on initialization ([#117](https://github.com/MetaMask/providers/pull/117))
  - Includes `accountsChanged`, `chainChanged`, and `networkChanged`.
  - This prevents sites that handle any of these events by reloading the page from entering into a reload loop.

## [7.0.0] - 2020-09-08

### Changed

- **BREAKING:** Changed casing of `Metamask` in all exports to `MetaMask`
  - A brand is a brand ¯\\\_(ツ)\_/¯

## [6.3.0] - 2020-09-04

### Added

- Types

### Changed

- `ethereum.networkVersion` and `.chainId` now default to `null` instead of `undefined`
- Improved JSDoc comments and tags

## [6.2.0] - 2020-08-04

### Added

- Package consumers can now provide a `logger` object to the provider constructor, to override the default logger
  - The default logger is the `console` global
  - The following methods are required: `debug`, `error`, `info`, `log`, `trace`

## [6.1.1] - 2020-07-28

### Changed

- Updated dependencies, which produces a smaller bundle size

## [6.1.0] - 2020-07-21

### Changed

- Only emit `data` event for notifications present in `^4.0.0`
  ([#73](https://github.com/MetaMask/providers/pull/73))
  - Some consumers make assumptions about the shape of the object emitted with the event that do not hold for all notifications in `^6.0.0`.
- Select icon using `rel~="icon"` when retrieving site metadata
  ([#76](https://github.com/MetaMask/providers/pull/76))
  - This is instead of defaulting to `rel="shortcut icon"`.

### Fixed

- Emit `accountsChanged` event _after_ all related state has been updated
  ([#72](https://github.com/MetaMask/providers/pull/72))
  - For example, `ethereum.selectedAddress` will now have been updated by the time the event is emitted.
- Enable retrieval of site icons _not_ hosted on the same origin
  ([#78](https://github.com/MetaMask/providers/pull/78))
  - For example, icons hosted on `assets.foo.com` that are used on `foo.com` will now be retrieved successfully.

## [6.0.1] - 2020-07-15

### Fixed

- Warning message for the `data` event
  - This deprecated event was added back in `6.0.0`, but the warning message was not defined.
- Restore `publicConfigStore` property as alias for `_publicConfigStore`
  - The `_publicConfigStore` was named `publicConfigStore` before `4.0.0`.
    The original property turned out to be used by consumers.
    The store is scheduled to be removed completely, and accessing `publicConfigStore` emits a warning.

## [6.0.0] - 2020-07-04

### Added

- The `data` event
  - This event was removed in `4.0.0`, as it was thought to only be used internally.
    This assumption was incorrect, and the event is now restored.

### Changed

- **BREAKING:** Restore the `notification` event value to its pre-`4.0.0` state
  - Prior to `4.0.0` this event was emitted by code in the MetaMask extension.
    Its value was inadvertently changed when it was moved to this package.

## [5.2.1] - 2020-06-29

### Changed

- Un-deprecate `isConnected` method.

## [5.2.0] - 2020-06-24

### Changed

- Remove property protections
  - Unless we lock down the entire provide object, which we can't do, a determined consumer can break our provider. Thus, protected properties are pointless.
- Fix `requests` `params` type checks
- Update deprecation warning messages per most recent deprecation plans

## [5.1.0] - 2020-06-01

### Changed

- Update `request` `params` type to `unknown[] | object`
  - This is not breaking in practice, since no RPC methods with other `params` values exist.

## [5.0.2] - 2020-05-22

### Changed

- Fix `ethereum.send` return value for certain argument combination
  - Reverted to pre-`4.0.0` state
- Stop protecting overwrites of the following properties, that existed prior to `4.0.0`:
  - `ethereum.isMetaMask`
  - `ethereum._metamask`
- Protect the following new, private properties required for `ethereum.request` to work:
  - `ethereum._rpcRequest`
  - `ethereum._rpcEngine`

## [5.0.1] - 2020-05-11

### Changed

- Rename package to [@metamask/inpage-provider](https://www.npmjs.com/package/@metamask/inpage-provider)
- Prevent overwrite of certain properties on the Provider
  - `ethereum.request`
  - `ethereum.isMetaMask`
  - `ethereum._metamask`

## [5.0.0] - 2020-04-22

### Added

- The [most recent EIP 1193 API](https://github.com/ethereum/EIPs/blob/89e373d5d3a62a28f2646830247579f323ef6b40/EIPS/eip-1193.md) ([#30](https://github.com/MetaMask/providers/pull/30))
  - The method `request`
  - The events `disconnect` and `message`
- A global initialization event, `ethereum#initialized`, for
  asynchronous injection ([#31](https://github.com/MetaMask/providers/pull/31))
- Helper methods for initializing the provider ([#31](https://github.com/MetaMask/providers/pull/31))

### Changed

- **BREAKING:** Use named instead of default exports ([#31](https://github.com/MetaMask/providers/pull/31))
- **BREAKING:** `MetaMaskInpage` constructor now takes a `connectionStream` and an
  options object ([#31](https://github.com/MetaMask/providers/pull/31))
- **BREAKING:** `_metamask.sendBatch` -> `_metamask.requestBatch` ([#30](https://github.com/MetaMask/providers/pull/30))
- **BREAKING:** Revert `send` to match provider in v7.7.8 of `metamask-extension` ([#29](https://github.com/MetaMask/providers/pull/29))
- The `connect` event now emits with a `ProviderConnectInfo` object per EIP 1193 ([#30](https://github.com/MetaMask/providers/pull/30))
- Deprecated the `send` method ([#30](https://github.com/MetaMask/providers/pull/30))
- Deprecated the events `close`, `networkChanged`, and `notification`, and
  added deprecation warnings for them ([#30](https://github.com/MetaMask/providers/pull/30))
- Un-deprecated `sendAsync` ([#29](https://github.com/MetaMask/providers/pull/29))

[Unreleased]: https://github.com/MetaMask/providers/compare/v15.0.0...HEAD
[15.0.0]: https://github.com/MetaMask/providers/compare/v14.0.2...v15.0.0
[14.0.2]: https://github.com/MetaMask/providers/compare/v14.0.1...v14.0.2
[14.0.1]: https://github.com/MetaMask/providers/compare/v14.0.0...v14.0.1
[14.0.0]: https://github.com/MetaMask/providers/compare/v13.1.0...v14.0.0
[13.1.0]: https://github.com/MetaMask/providers/compare/v13.0.0...v13.1.0
[13.0.0]: https://github.com/MetaMask/providers/compare/v12.0.0...v13.0.0
[12.0.0]: https://github.com/MetaMask/providers/compare/v11.1.2...v12.0.0
[11.1.2]: https://github.com/MetaMask/providers/compare/v11.1.1...v11.1.2
[11.1.1]: https://github.com/MetaMask/providers/compare/v11.1.0...v11.1.1
[11.1.0]: https://github.com/MetaMask/providers/compare/v11.0.0...v11.1.0
[11.0.0]: https://github.com/MetaMask/providers/compare/v10.2.1...v11.0.0
[10.2.1]: https://github.com/MetaMask/providers/compare/v10.2.0...v10.2.1
[10.2.0]: https://github.com/MetaMask/providers/compare/v10.1.0...v10.2.0
[10.1.0]: https://github.com/MetaMask/providers/compare/v10.0.0...v10.1.0
[10.0.0]: https://github.com/MetaMask/providers/compare/v9.1.0...v10.0.0
[9.1.0]: https://github.com/MetaMask/providers/compare/v9.0.0...v9.1.0
[9.0.0]: https://github.com/MetaMask/providers/compare/v8.1.1...v9.0.0
[8.1.1]: https://github.com/MetaMask/providers/compare/v8.1.0...v8.1.1
[8.1.0]: https://github.com/MetaMask/providers/compare/v8.0.4...v8.1.0
[8.0.4]: https://github.com/MetaMask/providers/compare/v8.0.3...v8.0.4
[8.0.3]: https://github.com/MetaMask/providers/compare/v8.0.2...v8.0.3
[8.0.2]: https://github.com/MetaMask/providers/compare/v8.0.1...v8.0.2
[8.0.1]: https://github.com/MetaMask/providers/compare/v8.0.0...v8.0.1
[8.0.0]: https://github.com/MetaMask/providers/compare/v7.0.0...v8.0.0
[7.0.0]: https://github.com/MetaMask/providers/compare/v6.3.0...v7.0.0
[6.3.0]: https://github.com/MetaMask/providers/compare/v6.2.0...v6.3.0
[6.2.0]: https://github.com/MetaMask/providers/compare/v6.1.1...v6.2.0
[6.1.1]: https://github.com/MetaMask/providers/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/MetaMask/providers/compare/v6.0.1...v6.1.0
[6.0.1]: https://github.com/MetaMask/providers/compare/v6.0.0...v6.0.1
[6.0.0]: https://github.com/MetaMask/providers/compare/v5.2.1...v6.0.0
[5.2.1]: https://github.com/MetaMask/providers/compare/v5.2.0...v5.2.1
[5.2.0]: https://github.com/MetaMask/providers/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/MetaMask/providers/compare/v5.0.2...v5.1.0
[5.0.2]: https://github.com/MetaMask/providers/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/MetaMask/providers/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/MetaMask/providers/releases/tag/v5.0.0
