# MetaMask SDK Initialization Flow

## Importing the SDK

The **SDK** is imported into your project, along with various dependencies and utilities.

## Instantiating the SDK

A new instance of the SDK is created by calling the `MetaMaskSDK` constructor. This constructor accepts an **options** object that can be used to customize the behavior of the SDK.

## Configuration

The constructor sets up the SDK's **configuration**. This includes setting up default values, validating and applying any user-provided configuration options, and setting up internal state. If no dapp metadata is provided, the SDK will attempt to automatically set it based on the **current webpage**.

## Setting up the Platform Manager

The **Platform Manager** is set up to handle platform-specific tasks. It determines the platform type (web, mobile, etc.) and sets up any necessary platform-specific settings.

## Setting up the Analytics Service

The **Analytics service** is set up to track usage of the SDK. It sends events to a server for analysis. The Analytics service is initialized with the server URL, debug settings, and metadata including the dapp URL, title, platform, and source.

## Setting up the Storage Manager

If storage is enabled, the **Storage Manager** is set up. This is used to manage persistent storage for the SDK. If no storage manager is provided, the SDK will create one using the platform manager and storage settings.

## Setting up the Dapp Metadata

The SDK attempts to extract the **favicon** from the current webpage to use as the dapp's icon. This is only done if the SDK is running in a browser and no icon was provided in the dapp metadata.

## Checking for the MetaMask Extension

The SDK checks if the **MetaMask browser extension** is installed and logged in. If it is, and the `extensionOnly` option is set, the SDK will use the extension as the provider and stop the initialization process. If the SDK is running in the MetaMask mobile web view, it will use the in-app browser provider and stop the initialization process.

## Setting up the Remote Connection

The **Remote Connection** is set up. This is responsible for communicating with the MetaMask service. The Remote Connection is initialized with the communication layer preference, dapp metadata, source, debug settings, timer, SDK instance, platform manager, transports, communication server URL, storage, logging, and modal settings.

## Setting up the Installer

The **Installer** is set up. This is used to handle installation of the MetaMask extension if it's not already installed. The Installer is initialized with the desktop preference, remote connection, platform manager, and debug settings.

## Injecting the Provider

The SDK injects its **provider** into `window.ethereum`. This provider is used to interact with the Ethereum blockchain. The provider is initialized with the communication layer preference, platform manager, SDK instance, check installation on all calls setting, inject provider setting, shim web3 setting, installer, remote connection, and debug settings.

## Setting up Event Listeners

The SDK sets up event listeners on the **Remote Connection**. These listeners propagate events from the Remote Connection to the SDK's EventEmitter. The events include connection status and service status.

## Auto-Connect

If the `checkInstallationImmediately` option is enabled, the SDK will automatically attempt to connect to the **Ethereum provider** upon initialization. This is only done if the SDK is running on a desktop web platform.

## Ready for Use

At this point, the SDK is fully initialized and ready for use. You can now use it to send transactions, sign messages, and interact with the Ethereum blockchain. The SDK also provides various utility methods for interacting with the provider.
