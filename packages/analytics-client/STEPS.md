# Analytics Client Migration Plan

This plan outlines the steps to extract the analytics client logic from `@metamask/sdk-communication-layer` into this new `@metamask/analytics-client` package.

1.  **Configure `package.json` for Public Release (`packages/analytics-client/package.json`):**

    - Ensure `name` is `@metamask/analytics-client`.
    - Set a starting `version` (e.g., `0.1.0`).
    - Set `private: false`.
    - Add essential public package fields: `description`, `license`, `homepage`, `bugs`, `repository`, `author` (copy/adapt from another public package like `@metamask/sdk-communication-layer`).
    - Define `main: "dist/src/index.js"` and `types: "dist/src/index.d.ts"`.
    - Add build/lint/test/clean scripts (copy/adapt from another package).
    - Add `dependencies`: `"cross-fetch": "latest"`, `"@metamask/sdk-communication-layer": "workspace:^"`.
    - Add standard `devDependencies` (`typescript`, `@types/node`, etc., adapt from another package).
    - Add `publishConfig: { "access": "public" }`.
    - Ensure `files` includes `dist/`.

2.  **Verify & Configure `tsconfig.json` (`packages/analytics-client/tsconfig.json`):**

    - Ensure it extends a base config if applicable (e.g., `../../tsconfig.base.json`).
    - Set `compilerOptions.outDir` to `"./dist"`.
    - Set `compilerOptions.rootDir` to `"./src"`.
    - Include `"src/**/*"` and exclude `node_modules`, `dist`.

3.  **Move Analytics Code:**

    - Move the file `packages/sdk-communication-layer/src/Analytics.ts` to `packages/analytics-client/src/Analytics.ts`.

4.  **Refactor Moved Code (`packages/analytics-client/src/Analytics.ts`):**

    - Update import paths for types (`TrackingEvents`, `OriginatorInfo`, `CommunicationLayerPreference`) to point to `@metamask/sdk-communication-layer`.
    - Remove the import and usage of the `logger` from `sdk-communication-layer`. (Logging within `SendAnalytics` can be revisited if necessary).

5.  **Export from New Package (`packages/analytics-client/src/index.ts`):**

    - Export `SendAnalytics` and `AnalyticsProps` from `./Analytics`.
    - Re-export `TrackingEvents`, `OriginatorInfo`, `CommunicationLayerPreference` from `@metamask/sdk-communication-layer` for consumer convenience.

6.  **Update Dependencies in Consuming Packages:**

    - In `packages/sdk/package.json`: Add `"@metamask/analytics-client": "workspace:^"` to `dependencies`.
    - In `packages/sdk-communication-layer/package.json`: Remove `"cross-fetch"` from `dependencies` (if it's no longer used elsewhere in that package).

7.  **Update SDK Code (`packages/sdk/src/services/Analytics.ts` & `Analytics.test.ts`):**

    - Change imports of `SendAnalytics`, `AnalyticsProps`, `TrackingEvents` from `@metamask/sdk-communication-layer` to `@metamask/analytics-client`.
    - Keep the import for `DEFAULT_SERVER_URL` pointing to `@metamask/sdk-communication-layer`.
    - Update the `jest.mock` path in `Analytics.test.ts` to `@metamask/analytics-client`.

8.  **Clean Up Communication Layer (`packages/sdk-communication-layer`):**

    - Delete the original `packages/sdk-communication-layer/src/Analytics.ts` file.
    - In `packages/sdk-communication-layer/src/index.ts`, remove the exports for `SendAnalytics` and `AnalyticsProps`. Keep exports for the shared types (`TrackingEvents`, `OriginatorInfo`, etc.).

9.  **Install & Build:**

    - Run `yarn install` at the workspace root to link the new package and update dependencies.
    - Run `yarn build` (or the appropriate workspace build command) at the root to compile the new package and check for errors.

10. **Test:**
    - Run `yarn test` (or the appropriate workspace test command) at the root. Address any test failures, particularly in `packages/sdk`.
