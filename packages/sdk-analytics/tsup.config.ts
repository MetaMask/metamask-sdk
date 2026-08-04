import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Bundle `openapi-fetch` into the output instead of leaving it as a
  // runtime `require()`/`import`. Its `require` export condition points to
  // `dist/cjs/index.cjs`, and webpack configs that have no rule for `.cjs`
  // files (e.g. create-react-app) emit that file as a static asset URL,
  // which makes `createClient` resolve to a string at runtime and throw
  // "import_openapi_fetch.default is not a function".
  // See https://github.com/MetaMask/metamask-sdk/issues/1340
  noExternal: ['openapi-fetch'],
});
