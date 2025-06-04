# MetaMask MultiChain Test Dapp - Auto-Mode Implementation

## Overview

The MetaMask MultiChain Test Dapp now supports **dual-mode operation** to enable both manual testing and automated mobile E2E testing. This implementation solves the Detox mobile E2E testing issues while maintaining 100% backward compatibility.

## 🎯 Problem Solved

**Before:** Mobile E2E tests failed because Detox couldn't reliably interact with dropdown method selection:

```typescript
// ❌ Unreliable in Detox mobile testing
await element(by.web.text('eth_chainId')).tap();
```

**After:** Direct method buttons with stable selectors for mobile E2E testing:

```typescript
// ✅ Reliable in Detox mobile testing
await element(by.web.id('direct-invoke-eip155-1-eth_chainId')).tap();
```

## 🚀 Features Implemented

### 1. URL Parameter Control

- `?autoMode=true` - Enables E2E testing mode
- `?preselect=method1,method2,method3` - Pre-selects methods for each scope

### 2. Direct Method Buttons

- Individual buttons for each available method
- Hidden by default (manual mode)
- Visible only in auto-mode
- Stable `data-testid` and `id` attributes for mobile E2E testing

### 3. Auto-Mode Detection

- Visual indicator: "🤖 E2E Testing Mode Active"
- CSS class `auto-mode` added to body
- Conditional styling and behavior for mobile E2E testing

### 4. Backward Compatibility

- Zero breaking changes to existing functionality
- All current selectors and workflows preserved
- Manual testing experience unchanged

## 📋 Usage Examples

### Manual Testing (Default)

```
http://localhost:3000/
```

- Works exactly as before
- Dropdown method selection required
- No visual changes

### Mobile E2E Testing Mode

```
http://localhost:3000/?autoMode=true
```

- Shows direct method buttons
- Visual auto-mode indicator
- Direct method invocation available for mobile testing

### Mobile E2E with Pre-selected Methods

```
http://localhost:3000/?autoMode=true&preselect=eth_chainId,eth_getBalance,eth_gasPrice
```

- Auto-selects methods for connected scopes in order
- Immediate mobile testing capability

## 🧪 Mobile E2E Test Implementation

### Selector Patterns

#### Direct Method Invocation

```typescript
// Pattern: direct-invoke-{escapedChainId}-{methodName}
await element(by.web.id('direct-invoke-eip155-1-eth_chainId')).tap();
await element(by.web.id('direct-invoke-eip155-1-eth_getBalance')).tap();
await element(
  by.web.id(
    'direct-invoke-solana-5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp-sol_getBalance',
  ),
).tap();
```

#### Container Selection

```typescript
// Pattern: direct-methods-{escapedChainId}
await element(by.web.id('direct-methods-eip155-1')).isVisible();
```

### Complete Mobile E2E Test Flow

```typescript
describe('MetaMask MultiChain Mobile E2E Tests', () => {
  it('should invoke methods directly in auto-mode', async () => {
    // 1. Navigate with auto-mode
    await MultichainTestDApp.navigateToMultichainTestDApp('?autoMode=true');

    // 2. Connect and create session
    await MultichainTestDApp.createSessionWithNetworks(['1']);

    // 3. Verify auto-mode indicator
    await expect(
      element(by.web.className('auto-mode-indicator')),
    ).toBeVisible();

    // 4. Direct method invocation
    await element(by.web.id('direct-invoke-eip155-1-eth_chainId')).tap();

    // 5. Verify result
    const result = await element(
      by.web.id('invoke-method-eip155-1-eth_chainId-result-0'),
    ).getText();
    expect(result).toContain('0x1'); // Ethereum mainnet

    // 6. Multiple methods
    await element(by.web.id('direct-invoke-eip155-1-eth_getBalance')).tap();
    await element(by.web.id('direct-invoke-eip155-1-eth_gasPrice')).tap();
  });

  it('should work with pre-selected methods', async () => {
    await MultichainTestDApp.navigateToMultichainTestDApp(
      '?autoMode=true&preselect=eth_chainId,eth_getBalance',
    );

    await MultichainTestDApp.createSessionWithNetworks(['1', '137']);

    // Methods should be pre-selected
    const ethChainSelect = await element(by.web.id('method-select-eip155-1'));
    await expect(ethChainSelect).toHaveValue('eth_chainId');

    const polygonSelect = await element(by.web.id('method-select-eip155-137'));
    await expect(polygonSelect).toHaveValue('eth_getBalance');
  });
});
```

## ✅ Implementation Summary

This implementation successfully adds mobile E2E testing capabilities while maintaining full backward compatibility. The key changes include:

1. **New State**: `isAutoMode` boolean state
2. **URL Parsing**: Detection of `autoMode` and `preselect` parameters
3. **Direct Buttons**: Individual method buttons with stable selectors
4. **CSS Styling**: Conditional display based on auto-mode
5. **Visual Indicator**: Clear feedback when in mobile E2E mode

All existing functionality remains unchanged, ensuring a smooth transition for both manual testers and automated mobile test suites.
