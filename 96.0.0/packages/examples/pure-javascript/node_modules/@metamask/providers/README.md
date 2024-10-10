# MetaMask Providers

The Ethereum provider object injected by MetaMask into various environments.
Contains a lot of implementation details specific to MetaMask, and is probably
not suitable for out-of-the-box use with other wallets.

The `BaseProvider` implements the Ethereum JavaScript provider specification ([EIP-1193]), but must be modified by a sub-class in order to function.
`StreamProvider` is such a sub-class, which synchronizes its state and marshals JSON-RPC messages via a duplex stream.
`MetamaskInpageProvider` further extends `StreamProvider` to support legacy provider interfaces in addition to [EIP-1193], and is used to instantiate the object injected by MetaMask into web pages as `window.ethereum`.

## Usage

```javascript
import { initializeProvider } from '@metamask/providers';

// Create a stream to a remote provider:
const metamaskStream = new LocalMessageDuplexStream({
  name: 'inpage',
  target: 'contentscript',
});

// this will initialize the provider and set it as window.ethereum
initializeProvider({
  connectionStream: metamaskStream,
});

const { ethereum } = window;
```

### Types

Types are exposed at `index.d.ts`.
They require Node.js `EventEmitter` and `Duplex` stream types, which you can grab from e.g. [`@types/node`](https://npmjs.com/package/@types/node).

### Do Not Modify the Provider

The Provider object should not be mutated by consumers under any circumstances.
The maintainers of this package will neither fix nor take responsbility for bugs caused by third parties mutating the provider object.

## Contributing

### Setup

- Install [Node.js](https://nodejs.org) version 16
  - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn v1](https://yarnpkg.com/en/docs/install)
- Run `yarn setup` to install dependencies and run any requried post-install scripts
  - **Warning:** Do not use the `yarn` / `yarn install` command directly. Use `yarn setup` instead. The normal install command will skip required post-install scripts, leaving your development environment in an invalid state.

### Testing and Linting

Run `yarn test` to run the tests once. To run tests on file changes, run `yarn test:watch`.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and fix any automatically fixable issues.

### Release & Publishing

The project follows the same release process as the other libraries in the MetaMask organization:

1. Create a release branch
   - For a typical release, this would be based on `main`
   - To update an older maintained major version, base the release branch on the major version branch (e.g. `1.x`)
2. Update the changelog
3. Update version in package.json file (e.g. `yarn version --minor --no-git-tag-version`)
4. Create a pull request targeting the base branch (e.g. `main` or `1.x`)
5. Code review and QA
6. Once approved, the PR is squashed & merged
7. The commit on the base branch is tagged
8. The tag can be published as needed

[eip-1193]: https://eips.ethereum.org/EIPS/eip-1193
