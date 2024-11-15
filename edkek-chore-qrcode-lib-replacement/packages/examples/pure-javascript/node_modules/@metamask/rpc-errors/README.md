# `@metamask/rpc-errors`

JSON-RPC errors, including for
[Ethereum JSON RPC](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1474.md)
and
[Ethereum Provider](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md),
and [making unknown errors compliant with either spec](#parsing-unknown-errors).

## Installation

`yarn add @metamask/rpc-errors`

or

`npm install @metamask/rpc-errors`

## Usage

```js
import { rpcErrors, providerErrors } from '@metamask/rpc-errors';

throw rpcErrors.invalidRequest();
// or
throw providerErrors.unauthorized('my custom message');
```

## Supported Errors

- Generic JSON RPC 2.0 errors
  - Per [JSON RPC 2.0 spec](https://www.jsonrpc.org/specification#error_object)
- Ethereum JSON RPC
  - Per [EIP-1474](https://eips.ethereum.org/EIPS/eip-1474#error-codes)
- Ethereum Provider errors
  - Per [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#provider-errors)
    - Does **not** yet support [`CloseEvent` errors or status codes](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes).

## API

```js
import { rpcErrors, providerErrors } from '@metamask/rpc-errors';

// JSON-RPC errors and Ethereum EIP-1474 errors are namespaced under "rpcErrors"
response.error = rpcErrors.methodNotFound({
  message: optionalCustomMessage,
  data: optionalData,
});

// Ethereum EIP-1193 Provider errors namespaced under "providerErrors"
response.error = providerErrors.unauthorized({
  message: optionalCustomMessage,
  data: optionalData,
});

// each error getter takes a single "opts" argument
// for most errors, this can be replaced with a single string, which becomes
// the error message
response.error = providerErrors.unauthorized(customMessage);

// if an error getter accepts a single string, all arguments can be omitted
response.error = providerErrors.unauthorized();
response.error = providerErrors.unauthorized({});

// omitting the message will produce an error with a default message per
// the relevant spec

// omitting the data argument will produce an error without a
// "data" property

// the JSON RPC 2.0 server error requires a valid code
response.error = rpcErrors.server({
  code: -32031,
});

// custom Ethereum Provider errors require a valid code and message
// valid codes are integers i such that: 1000 <= i <= 4999
response.error = providerErrors.custom({
  code: 1001,
  message: 'foo',
});
```

### Parsing Unknown Errors

```js
// this is useful for ensuring your errors are standardized
import { serializeError } from '@metamask/rpc-errors'

// if the argument is not a valid error per any supported spec,
// it will be added as error.data.originalError
response.error = serializeError(maybeAnError)

// you can add a custom fallback error code and message if desired
const fallbackError = { code: 4999, message: 'My custom error.' }
response.error = serializeError(maybeAnError, fallbackError)

// Note: if the original error has a "message" property, it will take
// precedence over the fallback error's message

// the default fallback is:
{
  code: -32603,
  message: 'Internal JSON-RPC error.'
}
```

### Other Exports

```js
/**
 * Classes
 */
import { JsonRpcError, EthereumProviderError } from '@metamask/rpc-errors';

/**
 * getMessageFromCode and errorCodes
 */
import { getMessageFromCode, errorCodes } from '@metamask/rpc-errors';

// get the default message string for the given code, or a fallback message if
// no message exists for the given code
const message1 = getMessageFromCode(someCode);

// you can specify your own fallback message
const message2 = getMessageFromCode(someCode, myFallback);
// it can be anything, use at your own peril
const message3 = getMessageFromCode(someCode, null);

// {
//   rpcErrors: { [errorName]: code, ... },
//   providerErrors: { [errorName]: code, ... },
// }
const code1 = rpcErrors.parse;
const code2 = providerErrors.userRejectedRequest;

// all codes in errorCodes have default messages
const message4 = getMessageFromCode(code1);
const message5 = getMessageFromCode(code2);
```

## Contributing

### Setup

- Install [Node.js](https://nodejs.org) version 16
  - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn v3](https://yarnpkg.com/getting-started/install)
- Run `yarn install` to install dependencies and run any required post-install scripts

### Testing and Linting

Run `yarn test` to run the tests once. To run tests on file changes, run `yarn test:watch`.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and fix any automatically fixable issues.

### Release & Publishing

The project follows the same release process as the other libraries in the MetaMask organization. The GitHub Actions [`action-create-release-pr`](https://github.com/MetaMask/action-create-release-pr) and [`action-publish-release`](https://github.com/MetaMask/action-publish-release) are used to automate the release process; see those repositories for more information about how they work.

1. Choose a release version.

- The release version should be chosen according to SemVer. Analyze the changes to see whether they include any breaking changes, new features, or deprecations, then choose the appropriate SemVer version. See [the SemVer specification](https://semver.org/) for more information.

2. If this release is backporting changes onto a previous release, then ensure there is a major version branch for that version (e.g. `1.x` for a `v1` backport release).

- The major version branch should be set to the most recent release with that major version. For example, when backporting a `v1.0.2` release, you'd want to ensure there was a `1.x` branch that was set to the `v1.0.1` tag.

3. Trigger the [`workflow_dispatch`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch) event [manually](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow) for the `Create Release Pull Request` action to create the release PR.

- For a backport release, the base branch should be the major version branch that you ensured existed in step 2. For a normal release, the base branch should be the main branch for that repository (which should be the default value).
- This should trigger the [`action-create-release-pr`](https://github.com/MetaMask/action-create-release-pr) workflow to create the release PR.

4. Update the changelog to move each change entry into the appropriate change category ([See here](https://keepachangelog.com/en/1.0.0/#types) for the full list of change categories, and the correct ordering), and edit them to be more easily understood by users of the package.

- Generally any changes that don't affect consumers of the package (e.g. lockfile changes or development environment changes) are omitted. Exceptions may be made for changes that might be of interest despite not having an effect upon the published package (e.g. major test improvements, security improvements, improved documentation, etc.).
- Try to explain each change in terms that users of the package would understand (e.g. avoid referencing internal variables/concepts).
- Consolidate related changes into one change entry if it makes it easier to explain.
- Run `yarn auto-changelog validate --rc` to check that the changelog is correctly formatted.

5. Review and QA the release.

- If changes are made to the base branch, the release branch will need to be updated with these changes and review/QA will need to restart again. As such, it's probably best to avoid merging other PRs into the base branch while review is underway.

6. Squash & Merge the release.

- This should trigger the [`action-publish-release`](https://github.com/MetaMask/action-publish-release) workflow to tag the final release commit and publish the release on GitHub.

7. Publish the release on npm.

- Wait for the `publish-release` GitHub Action workflow to finish. This should trigger a second job (`publish-npm`), which will wait for a run approval by the [`npm publishers`](https://github.com/orgs/MetaMask/teams/npm-publishers) team.
- Approve the `publish-npm` job (or ask somebody on the npm publishers team to approve it for you).
- Once the `publish-npm` job has finished, check npm to verify that it has been published.
