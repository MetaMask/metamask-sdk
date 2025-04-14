# MetaMask SDK Protocol Development: Addressing Architectural Challenges

## Core Problem: Single Communication Layer Package

The original design of `sdk-communication-layer` as a single package, shared between dApps and the mobile wallet, was initially efficient. However, evolving platform requirements, particularly for React Native (mobile), have created critical issues:

1.  **Dependency Conflicts:**
    *   Mobile requires `eciesjs@^0.3.16` due to React Native limitations.
    *   The SDK uses `eciesjs@^0.4.11`.
    *   These versions are incompatible, blocking the use of the latest communication layer in mobile and breaking the development workflow (`sdk-comm-layer-mobile-overwrite.sh` fails with `@ecies/ciphers/aes` resolution errors).

2.  **Bundle Size & Complexity:**
    *   The mobile wallet is forced to include dApp-specific code, increasing bundle size.
    *   Managing dependencies and debugging across environments is overly complex.

## Required Solution: Package Splitting

The necessary path forward is to **split the communication layer package**:

```
sdk-communication-layer/
├── core/       # Shared core logic & types
├── wallet/     # Wallet-specific code
│   └── mobile/ # Mobile-optimized implementation (using compatible dependencies like eciesjs 0.3.x)
└── dapp/       # dApp-specific implementation (using latest dependencies like eciesjs 0.4.x)
```

**Benefits:**

*   **Resolves Dependency Conflicts:** Allows mobile and dApp implementations to use appropriate dependency versions.
*   **Optimizes Bundle Size:** Mobile only includes necessary code.
*   **Simplifies Development:** Easier dependency management, debugging, and platform-specific optimizations.
*   **Unblocks Development:** Enables the mobile wallet to use an updated (but compatible) communication layer.

**This architectural change is critical to address the current development blockers and ensure the maintainability and performance of the SDK across all platforms.**

---

*(Optional: Include simplified Architecture/Workflow sections below if needed for context)*

## Architecture Components (Brief)

*   **Mobile Wallet:** React Native app (`metamask-mobile`).
*   **Communication Layer:** Currently single package (`sdk-communication-layer`), needs splitting.
*   **Backend:** Socket server (`sdk-socket-server-next`).
*   **dApp Examples:** Test environments (`devnext`, `playgroundnext`).

## Detailed Development Workflow

### Setting Up the Environment

1.  Clone the repositories:
    ```bash
    git clone https://github.com/MetaMask/metamask-sdk
    git clone https://github.com/MetaMask/metamask-mobile
    ```

2.  Configure environment:
    *   Create `.env` file in SDK root (`metamask-sdk/`) with:
        ```
        MM_MOBILE_PATH=/path/to/metamask-mobile
        ```

### Development Process (Currently Broken)

1.  **Modify Communication Layer:**
    ```bash
    # In metamask-sdk/
    cd packages/sdk-communication-layer
    # Make your changes
    yarn build
    ```

2.  **Update Mobile Implementation (Fails):**
    ```bash
    # From SDK root (metamask-sdk/)
    ./scripts/sdk-comm-layer-mobile-overwrite.sh
    ```
    *   **What it *should* do:** Remove old layer, copy new build, run `rn-nodeify`.
    *   **Current State:** Fails due to the ECIES version incompatibility mentioned above. Mobile development must use the older `sdk-communication-layer@0.29.0-wallet`.

3.  **Configure Mobile Socket Server:**
    *   For testing against a local backend (`sdk-socket-server-next`), configure the Mobile Wallet:
        *   Set `SDK_COMMLAYER_URL` environment variable, OR
        *   Modify `socketServerUrl` directly in the mobile codebase (e.g., within `SDKConnect.ts`).
