# Running End-to-End (E2E) Tests in the Project

## Introduction
A new End-to-End (E2E) testing process using GitHub Actions has been implemented. This guide offers an overview of utilizing this workflow to ensure efficient and effective testing in various project scenarios.

The E2E test workflow is available at: [E2E test workflow](#).

## Running the Tests

### Prerequisites
- Ensure you have Yarn installed, as we use Yarn for managing dependencies and running scripts.

### Workflow Inputs
To run the workflow, you need to specify inputs for both iOS and Android platforms. The updated inputs include paths and bundle IDs for the main app and the ReactNativeDemo Dapp. Here are the inputs we are currently using:

#### For Android:
- `BUNDLE_ID`: `io.metamask.qa`
- `APP_PATH`: `bs://0a8158e21e87e7bda6036e0fd69e917e659d5058`
- `RN_TEST_APP_PATH`: `bs://274e1d4e83062786defb99edbdae13a81a0edabf`
- `RN_TEST_APP_BUNDLE_ID`: `com.reactnativedemo`

#### For iOS:
- `BUNDLE_ID`: `io.metamask.MetaMask-QA`
- `APP_PATH`: `bs://b89256cdb82d39ad2b6868f743d1f48b63b744a1`
- `RN_TEST_APP_PATH`: `bs://cfa2a15fc2f2db56a4395355469ea58488ea16f6`
- `RN_TEST_APP_BUNDLE_ID`: `org.reactjs.native.example.reactNativeDemo`

### Running Scripts
You can find the necessary scripts for running the E2E tests in the `package.json` file under the `scripts` section. Here's what you will find:

```json
"scripts": {
  "test:android": "wdio run test/configs/local/wdio.android.app.local.conf.ts",
  "test:android:browserstack": "wdio run test/configs/browserstack/wdio.android.app.browserstack.conf.ts",
  "test:ios:browserstack": "wdio run test/configs/browserstack/wdio.ios.app.browserstack.conf.ts",
}
```

### Execution
- iOS tests use BrowserStack and cannot be executed locally.
- Android tests can be run both locally and on BrowserStack.

### Steps to Run Tests
1. Navigate to the `/e2e` directory in the project.
2. Depending on the platform and environment (local or BrowserStack), run the respective script. For example:
   - For Android (local): `yarn test:android`
   - For Android (BrowserStack): `yarn test:android:browserstack`
   - For iOS (BrowserStack): `yarn test:ios:browserstack`
